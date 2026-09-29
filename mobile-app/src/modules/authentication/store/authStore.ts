import { create } from "zustand";
import type { Customer, CustomerProfile } from "../../../shared/types/domain";
import type { DevUser, AuthState, AuthFlowState } from "../types/auth.types";
import { authService } from "../services/authService";
import { authStorage } from "../services/authStorage";
import { authApi } from "../services/authApi";
import { biometricService } from "../services/biometricService";
import { useNotificationStore } from "../../../store/notificationStore";
import {
  validateLoginPhone,
  validateOtp,
  validatePasscode,
  validatePasscodeMatch,
} from "../validation/authSchema";

const refreshNotificationsForActiveCustomer = () => {
  useNotificationStore.getState().loadPersisted().catch(() => {});
};

const toCustomer = (u: DevUser): Customer => {
  const isPlaceholderName =
    !u.name ||
    u.name.trim() === "" ||
    u.name.toLowerCase() === "valued client" ||
    u.name.toLowerCase() === "client" ||
    u.name.toLowerCase() === "valued";

  const hasBackendIdentity = Boolean(u.customerId && !isPlaceholderName);

  return {
    name: u.name,
    email: u.email,
    dob: u.dob || "",
    gender: u.gender || "",
    fatherSpouseName: u.fatherSpouseName || "",
    pan: u.pan || "",
    aadhaar: u.aadhaar || (u as any).adhar || "",
    address: u.address || "",
    addressLine1: u.addressLine1 || "",
    addressLine2: u.addressLine2 || "",
    city: u.city || "",
    pincode: u.pincode || (u as any).pinCode || "",
    state: u.state || "",
    customerType: u.customerType || "Individual",
    mobile: u.mobileNumber || (u as any).mobile || "",
    customerId: u.customerId || (u as any).custId || "",
    avatarUri: u.avatarUri,
    profileCompleted: Boolean(
      !isPlaceholderName &&
      (
        Boolean(u.customerId && u.customerId.trim() !== "") ||
        Boolean(u.registrationCompleted) ||
        Boolean((u as any).profileCompleted) ||
        Boolean(u.pan || u.aadhaar || (u as any).adhar)
      )
    ),
    hasPasscode: Boolean(u.passcode || (u as any).hasPasscode || hasBackendIdentity),
  };
};

const initialUser = authService.getCurrentUser();

export const useAuthStore = create<AuthState>((set, get) => ({
  // Session & User
  isLoggedIn: Boolean(authService.isAuthenticated() && initialUser),
  mobileNumber: initialUser?.mobileNumber || "",
  customer: initialUser ? toCustomer(initialUser) : null,
  authenticatedUser: initialUser,

  // Flow State
  authFlowState: "ENTER_MOBILE",
  isExistingUser: Boolean(initialUser && (initialUser.registrationCompleted || initialUser.passcode)),
  customerExists: Boolean(initialUser && (initialUser.registrationCompleted || initialUser.passcode)),
  profileCompleted: Boolean(
    initialUser &&
    (initialUser.registrationCompleted ||
     (initialUser as any).profileCompleted ||
     Boolean(initialUser.customerId && initialUser.customerId.trim() !== "") ||
     (initialUser.passcode && initialUser.passcode.length === 6))
  ),
  hasPasscode: Boolean(initialUser && (initialUser.passcode || (initialUser as any).hasPasscode)),
  isLoading: false,
  error: null,

  // OTP State
  otp: "",
  otpTimer: 30,
  canResendOTP: false,

  // Passcode State
  passcode: "",
  confirmPasscode: "",

  // Onboarding & Service Access
  pendingServiceRoute: null,
  isCompleteProfileModalOpen: false,

  // Biometric Authentication
  isBiometricEnabled: false,
  biometricTypeLabel: "Fingerprint",

  // Field updaters
  setMobileNumber: (m) => set({ mobileNumber: m.replace(/\D/g, ""), error: null }),
  setOtp: (otp) => set({ otp: otp.replace(/\D/g, ""), error: null }),
  setPasscode: (p) => set({ passcode: p.replace(/\D/g, ""), error: null }),
  setConfirmPasscode: (cp) => set({ confirmPasscode: cp.replace(/\D/g, ""), error: null }),
  setAuthFlowState: (authFlowState) => set({ authFlowState, error: null }),
  setError: (error) => set({ error }),
  setIsLoading: (isLoading) => set({ isLoading }),

  // Onboarding & Service Access actions
  setProfileCompleted: (completed: boolean) => set({ profileCompleted: completed }),
  setPendingServiceRoute: (route: string | null) => set({ pendingServiceRoute: route }),
  openCompleteProfileModal: (targetRoute?: string) =>
    set({
      isCompleteProfileModalOpen: true,
      pendingServiceRoute: targetRoute !== undefined ? targetRoute : get().pendingServiceRoute,
    }),
  closeCompleteProfileModal: () => set({ isCompleteProfileModalOpen: false }),

  // Biometric actions
  setBiometricEnabled: async (enabled: boolean) => {
    const mobile = get().mobileNumber || get().authenticatedUser?.mobileNumber;
    await biometricService.setBiometricEnabled(enabled, mobile);
    set({ isBiometricEnabled: enabled });
  },

  syncBiometricState: async () => {
    const isEnabled = await biometricService.isBiometricEnabled();
    const label = await biometricService.getBiometricTypeLabel();
    set({ isBiometricEnabled: isEnabled, biometricTypeLabel: label });
  },

  // Timer actions
  setOtpTimer: (t) => set({ otpTimer: t, canResendOTP: t <= 0 }),
  decrementTimer: () =>
    set((state) => {
      const next = state.otpTimer - 1;
      return {
        otpTimer: next > 0 ? next : 0,
        canResendOTP: next <= 0,
      };
    }),
  resetTimer: (initialSeconds = 30) => set({ otpTimer: initialSeconds, canResendOTP: false }),

  // Check user existence in DB
  checkUser: async (overrideMobile?: string) => {
    const mobileToUse = overrideMobile || get().mobileNumber;
    const cleanMobile = mobileToUse.replace(/\D/g, "");
    if (cleanMobile.length !== 10) return { exists: false, customerExists: false, profileCompleted: false, hasPasscode: false };
    const res = await authService.checkUser(cleanMobile);
    set({
      customerExists: res.customerExists,
      profileCompleted: res.profileCompleted,
      hasPasscode: res.hasPasscode,
      isExistingUser: res.customerExists,
    });
    return res;
  },

  // Sync customer profile into auth state from local storage and backend API
  fetchAndSyncProfile: async (identifier?: string) => {
    try {
      const activeMobile =
        identifier ||
        get().mobileNumber ||
        get().authenticatedUser?.mobileNumber ||
        (get().authenticatedUser as any)?.mobile ||
        get().customer?.mobile ||
        authStorage.getUser()?.mobileNumber ||
        authStorage.getSession().activeMobile;

      if (!activeMobile) {
        console.warn("⚠️ [authStore] fetchAndSyncProfile called with no mobile number or user");
        return { success: false, isComplete: false, customer: null };
      }
      const cleanMobile = String(activeMobile).replace(/\D/g, "");

      // 1. Fetch fresh customer profile details from backend database if available
      let backendCustomer: any = null;
      try {
        const backendRes = await authApi.getCustomerDetails(cleanMobile);
        if (backendRes?.success && backendRes?.data) {
          backendCustomer = backendRes.data;
        }
      } catch (err) {
        console.warn("⚠️ [authStore] Backend getCustomerDetails failed in fetchAndSyncProfile:", err);
      }

      const d: any = backendCustomer || (cleanMobile ? authStorage.getUserByMobile(cleanMobile) : null) || authStorage.getUser();
      if (d && typeof d === "object") {
        const currentU = get().authenticatedUser || authStorage.getUser();
        const custId = d.customerId || d.custId || currentU?.customerId || "";
        const name = d.name || d.fullName || currentU?.name || "";
        const isPlaceholderName =
          !name ||
          name.trim() === "" ||
          name.toLowerCase() === "valued client" ||
          name.toLowerCase() === "client" ||
          name.toLowerCase() === "valued";

        const hasRealIdentity = Boolean(name && name.trim() !== "" && !isPlaceholderName);
        const isComplete = Boolean(
          hasRealIdentity &&
          (Boolean(custId) || d.profileCompleted === true || d.registrationCompleted === true || Boolean(d.pan || d.aadhaar || d.adhar))
        );

        const mergedUser: DevUser = {
          customerId: custId || currentU?.customerId || "",
          name: name || currentU?.name || "",
          mobileNumber: d.mobileNumber || d.mobile || cleanMobile,
          email: d.email || currentU?.email || `${cleanMobile}@taxedge.in`,
          customerType: d.customerType || currentU?.customerType || "Individual",
          dob: d.dob || currentU?.dob || "",
          gender: d.gender || currentU?.gender || "",
          fatherSpouseName: d.fatherSpouseName || currentU?.fatherSpouseName || "",
          pan: d.pan || currentU?.pan || "",
          aadhaar: d.aadhaar || d.adhar || currentU?.aadhaar || "",
          address: d.address || currentU?.address || "",
          addressLine1: d.addressLine1 || currentU?.addressLine1 || "",
          addressLine2: d.addressLine2 || currentU?.addressLine2 || "",
          city: d.city || currentU?.city || "",
          pincode: d.pincode || d.pinCode || currentU?.pincode || "",
          state: d.state || currentU?.state || "",
          registrationCompleted: isComplete,
          passcode: currentU?.passcode || get().passcode,
          avatarUri: d.avatarUri || currentU?.avatarUri,
        };

        authStorage.saveUser(mergedUser);
        const custObj = toCustomer(mergedUser);

        set({
          customerExists: Boolean(custId || hasRealIdentity),
          isExistingUser: Boolean(custId || hasRealIdentity),
          profileCompleted: isComplete,
          hasPasscode: Boolean(mergedUser.passcode || custId),
          authenticatedUser: mergedUser,
          customer: custObj,
        });

        console.log("✅ [authStore] fetchAndSyncProfile synced customer:", {
          customerId: custId,
          name: name,
          isComplete,
        });
        return { success: true, isComplete, customer: custObj };
      }
      return { success: false, isComplete: false, customer: null };
    } catch (err) {
      console.warn("⚠️ [authStore] fetchAndSyncProfile warning:", err);
      return { success: false, isComplete: false, customer: null };
    }
  },

  // Business Flow Operations
  sendOtp: async (overrideMobile?: string) => {
    const mobileToUse = overrideMobile || get().mobileNumber;
    const validation = validateLoginPhone(mobileToUse);
    if (!validation.valid) {
      set({ error: validation.error || "Please enter a valid 10-digit mobile number" });
      return false;
    }

    const cleanMobile = mobileToUse.replace(/\D/g, "");
    set({ isLoading: true, error: null });
    try {
      // 1. Check database status for user state
      const checkRes = await authService.checkUser(cleanMobile);

      // 2. Send OTP
      const res = await authService.sendOtp(cleanMobile);
      if (!res.success) {
        set({ isLoading: false, error: res.message || "Failed to send OTP. Could not reach server." });
        return false;
      }

      set({
        isLoading: false,
        error: null,
        mobileNumber: cleanMobile,
        customerExists: checkRes.customerExists,
        isExistingUser: checkRes.customerExists,
        profileCompleted: checkRes.profileCompleted,
        hasPasscode: checkRes.hasPasscode,
        authFlowState: "OTP_VERIFICATION",
        otp: "",
        otpTimer: 30,
        canResendOTP: false,
      });
      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || "Failed to send OTP. Please try again." });
      return false;
    }
  },

  verifyOtp: async (codeToVerify?: string) => {
    const code = codeToVerify !== undefined ? codeToVerify : get().otp;
    const v = validateOtp(code);
    if (!v.valid) {
      set({ error: v.error });
      return { success: false };
    }

    set({ isLoading: true, error: null });
    try {
      const { mobileNumber } = get();
      const res = await authService.verifyOtp(mobileNumber, code);
      set({ isLoading: false });

      if (!res.success) {
        set({ error: res.message || "Invalid OTP. Please try again." });
        return { success: false };
      }

      // Check customer database table status directly from backend
      const customerExists = res.customerExists === true || res.isExistingUser === true;
      const profileCompleted = customerExists;
      const hasPasscode = customerExists;

      console.log("🔍 [authStore] verifyOtp (Checked in Customer table) -> customerExists:", customerExists);

      set({
        customerExists,
        isExistingUser: customerExists,
        profileCompleted,
        hasPasscode,
      });

      // DECISION TREE
      // 1. Existing User in Customer table -> Ask to enter passcode -> After passcode verified, navigate to Dashboard
      if (customerExists) {
        set({
          authFlowState: "PASSCODE_LOGIN",
          passcode: "",
          isLoggedIn: false,
          error: null,
        });
        refreshNotificationsForActiveCustomer();
        return {
          success: true,
          isExistingUser: true,
          requiresPasscode: true,
          profileCompleted: true,
        };
      } else {
        // 2. New User not in Customer table -> Do NOT ask to enter passcode -> Navigate directly to Dashboard
        const cleanMobile = mobileNumber.replace(/\D/g, "");
        const placeholderUser: DevUser = {
          customerId: "",
          mobileNumber: cleanMobile,
          name: "",
          email: `${cleanMobile}@taxedge.in`,
          customerType: "Individual",
          registrationCompleted: false,
        };
        authStorage.saveUser(placeholderUser);
        authStorage.saveSession({
          isLoggedIn: true,
          activeMobile: cleanMobile,
          lastLoginAt: new Date().toISOString(),
        });

        set({
          isExistingUser: false,
          customerExists: false,
          isLoggedIn: true,
          profileCompleted: false,
          authenticatedUser: placeholderUser,
          customer: toCustomer(placeholderUser),
          error: null,
        });
        refreshNotificationsForActiveCustomer();
        return {
          success: true,
          isExistingUser: false,
          requiresPasscode: false,
          profileCompleted: false,
        };
      }
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || "Invalid OTP. Please try again." });
      return { success: false };
    }
  },

  loginWithPasscode: async (passcodeToUse?: string) => {
    const code = passcodeToUse !== undefined ? passcodeToUse : get().passcode;
    const clean = code.replace(/\D/g, "");
    if (!clean) {
      set({ error: "Passcode is required" });
      return { success: false, error: "Passcode is required" };
    }
    if (clean.length !== 6) {
      set({ error: "Passcode must be exactly 6 digits" });
      return { success: false, error: "Passcode must be exactly 6 digits" };
    }

    set({ isLoading: true, error: null });
    try {
      const { mobileNumber } = get();
      const res = await authService.loginWithPasscode(mobileNumber, code);
      if (res.success && res.user) {
        const enrichedUser: DevUser = {
          ...res.user,
          passcode: code,
          registrationCompleted: true,
        };
        authStorage.saveUser(enrichedUser);

        set({
          isLoading: false,
          isLoggedIn: true,
          customerExists: true,
          isExistingUser: true,
          profileCompleted: true,
          hasPasscode: true,
          authenticatedUser: enrichedUser,
          customer: toCustomer(enrichedUser),
          error: null,
          isCompleteProfileModalOpen: false,
        });
        refreshNotificationsForActiveCustomer();

        // Hydrate profile from storage
        try {
          await get().fetchAndSyncProfile(mobileNumber || res.user.mobileNumber);
        } catch (e) {
          console.warn("⚠️ [authStore] Profile sync warning after passcode login:", e);
        }

        return { success: true };
      }
      set({ isLoading: false, error: res.error || "Incorrect passcode. Please try again." });
      return { success: false, error: res.error };
    } catch (err: any) {
      const msg = err?.message || "Incorrect passcode. Please try again.";
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },


  startForgotPasscode: async () => {
    const { mobileNumber } = get();
    if (!mobileNumber) {
      set({ error: "Mobile number is required" });
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      await authService.forgotPasscode(mobileNumber);
      set({
        isLoading: false,
        authFlowState: "FORGOT_PASSCODE_OTP",
        otp: "",
        otpTimer: 30,
        canResendOTP: false,
      });
      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || "Failed to send reset code." });
      return false;
    }
  },

  verifyForgotPasscodeOtp: async (codeToVerify?: string) => {
    const code = codeToVerify !== undefined ? codeToVerify : get().otp;
    const v = validateOtp(code);
    if (!v.valid) {
      set({ error: v.error });
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      const { mobileNumber } = get();
      const res = await authService.verifyOtp(mobileNumber, code);
      if (res.success) {
        set({
          isLoading: false,
          authFlowState: "RESET_PASSCODE",
          passcode: "",
          confirmPasscode: "",
          error: null,
        });
        return true;
      }
      set({ isLoading: false, error: "Invalid OTP code" });
      return false;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || "Invalid OTP code" });
      return false;
    }
  },

  resetPasscodeAndProceed: async () => {
    const { mobileNumber, passcode, confirmPasscode, otp } = get();
    const v = validatePasscodeMatch(passcode, confirmPasscode, mobileNumber);
    if (!v.valid) {
      set({ error: v.error });
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await authService.resetPasscode(mobileNumber, passcode, otp);
      if (res.success) {
        set({
          isLoading: false,
          authFlowState: "PASSCODE_LOGIN",
          passcode: "",
          confirmPasscode: "",
          error: null,
        });
        return true;
      }
      set({ isLoading: false, error: res.error || "Failed to reset passcode" });
      return false;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || "Failed to reset passcode" });
      return false;
    }
  },

  updatePassword: async (mobileNumber: string, newPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.updatePassword(mobileNumber, newPassword);
      set({ isLoading: false, error: res.success ? null : res.error || "Failed to update password" });
      return { success: res.success, message: res.message || res.error };
    } catch (err: any) {
      const msg = err?.message || "Failed to update password";
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  resendOtp: async () => {
    const { mobileNumber, canResendOTP } = get();
    if (!canResendOTP) return false;

    set({ isLoading: true, error: null });
    try {
      const res = await authService.sendOtp(mobileNumber);
      if (!res.success) {
        set({ isLoading: false, error: res.message || "Failed to resend code" });
        return false;
      }
      set({
        isLoading: false,
        otp: "",
        otpTimer: 30,
        canResendOTP: false,
      });
      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || "Failed to resend code" });
      return false;
    }
  },

  changeNumber: () => {
    set({
      authFlowState: "ENTER_MOBILE",
      otp: "",
      passcode: "",
      confirmPasscode: "",
      error: null,
    });
  },

  resetFlow: () => {
    set({
      authFlowState: "ENTER_MOBILE",
      mobileNumber: "",
      otp: "",
      passcode: "",
      confirmPasscode: "",
      isExistingUser: false,
      customerExists: false,
      profileCompleted: false,
      hasPasscode: false,
      error: null,
      isCompleteProfileModalOpen: false,
    });
  },

  // Registration & Session actions
  login: async (passcode = "") => get().loginWithPasscode(passcode),

  register: async (profile: CustomerProfile, passcode = "123456", autoLogin = true) => {
    const mobile = (profile as any).mobileNumber || get().mobileNumber || "9876543210";
    const res = await authService.registerUser(
      {
        ...profile,
        mobileNumber: mobile,
        passcode,
      },
      autoLogin
    );
    if (res.success && res.user) {
      authStorage.saveUser(res.user);
      if (autoLogin) {
        set({
          isLoggedIn: true,
          customerExists: true,
          profileCompleted: true,
          hasPasscode: true,
          mobileNumber: res.user.mobileNumber,
          customer: toCustomer(res.user),
          authenticatedUser: res.user,
          isCompleteProfileModalOpen: false,
        });
        get().fetchAndSyncProfile(res.user.mobileNumber).catch(() => {});
      } else {
        set({
          customerExists: true,
          profileCompleted: true,
          hasPasscode: true,
          isCompleteProfileModalOpen: false,
        });
      }
      return { success: true };
    }
    return { success: false, error: res.error || "Registration failed" };
  },

  setAvatar: (avatarUri) => {
    authService.setAvatar(avatarUri);
    set((s) => (s.customer ? { customer: { ...s.customer, avatarUri } } : {}));
  },

  logout: () => {
    // 1. Synchronously reset state immediately to prevent routing race conditions/glitches
    set({
      isLoggedIn: false,
      customerExists: false,
      isExistingUser: false,
      profileCompleted: false,
      hasPasscode: false,
      customer: null,
      authenticatedUser: null,
      mobileNumber: "",
      otp: "",
      passcode: "",
      confirmPasscode: "",
      authFlowState: "ENTER_MOBILE",
      pendingServiceRoute: null,
      isCompleteProfileModalOpen: false,
    });
    // 2. Perform server token revocation and secure storage cleanup in background
    authService.logout().catch(() => {});
    try {
      const { useApplicationStore } = require("../../../store/applicationStore");
      useApplicationStore.getState().resetStore?.();
    } catch {}
    refreshNotificationsForActiveCustomer();
  },

  syncFromDevAuth: () => {
    const u = authService.getCurrentUser();
    const isAuth = Boolean(authService.isAuthenticated() && u);
    const isPlaceholder =
      !u?.name ||
      u.name.trim() === "" ||
      u.name.toLowerCase() === "valued client" ||
      u.name.toLowerCase() === "client" ||
      u.name.toLowerCase() === "valued";
    const hasRealIdentity = Boolean(u && u.customerId && !isPlaceholder);
    const hasPanOrAadhaar = Boolean(u && (u.pan || u.aadhaar || (u as any).adhar));
    const isComplete = Boolean(
      u &&
      (u.registrationCompleted ||
       (u as any).profileCompleted ||
       hasRealIdentity ||
       (hasPanOrAadhaar && Boolean(u.dob)) ||
       (u.passcode && u.passcode.length === 6))
    );

    set({
      isLoggedIn: isAuth,
      customerExists: Boolean(u && (u.registrationCompleted || u.passcode || hasRealIdentity)),
      isExistingUser: Boolean(u && (u.registrationCompleted || u.passcode || hasRealIdentity)),
      profileCompleted: isComplete,
      hasPasscode: Boolean(u && (u.passcode || (u as any).hasPasscode || hasRealIdentity)),
      mobileNumber: u?.mobileNumber || "",
      customer: u ? toCustomer(u) : null,
      authenticatedUser: u,
    });
  },
}));

// Initialize biometric state asynchronously after bootstrap
setTimeout(() => {
  useAuthStore.getState().syncBiometricState().catch?.(() => {});
}, 300);

export default useAuthStore;
