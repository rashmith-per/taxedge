import { authStorage } from "./authStorage";
import { authApi } from "./authApi";
import { passcodeService } from "./passcodeService";
import { tokenManager } from "../../../core/authentication/tokenManager";
import { registerForPushNotificationsAsync } from "../../../utils/pushNotificationService";
import type { DevUser, StoredUser, RegistrationData, AuthResult } from "../types/auth.types";
import { getErrorMessage } from "@/core/error-handling/errorMessage";
import { logger } from "@/core/logging/logger";
 
export interface RegisterParams extends Partial<RegistrationData> {
  mobileNumber?: string;
  name: string;
  passcode?: string;
}
 
export const authService = {
  findUserByMobile: (m: string) => authStorage.getUserByMobile(m),
  isUserRegistered: (m: string) => Boolean(authStorage.getUserByMobile(m)?.registrationCompleted),
 
  async sendOtp(mobileNumber: string): Promise<{ success: boolean; message?: string }> {
    const clean = mobileNumber.replace(/\D/g, "");
    const res = await authApi.sendOtp(clean);
    return res;
  },
 
  async verifyOtp(mobileNumber: string, otp: string): Promise<AuthResult & { customerExists?: boolean; profileCompleted?: boolean; hasPasscode?: boolean }> {
    const clean = mobileNumber.replace(/\D/g, "");
    const apiRes = await authApi.verifyOtp(clean, otp);
    if (!apiRes.success) {
      return {
        success: false,
        isExistingUser: false,
        customerExists: false,
        profileCompleted: false,
        hasPasscode: false,
        message: apiRes.message || "Invalid OTP code",
      };
    }

    // Direct check in Customer table from backend response
    const customerExists = apiRes.customerExists === true || apiRes.isExistingUser === true;
    const profileCompleted = customerExists && (apiRes.profileCompleted === true || apiRes.hasPasscode === true);
    const hasPasscode = customerExists;

    let user = apiRes.user;
    if (user) {
      authStorage.saveUser(user);
    } else if (customerExists) {
      const existing = authStorage.getUserByMobile(clean);
      user = {
        ...(existing || {}),
        customerId: existing?.customerId || "",
        mobileNumber: clean,
        name: existing?.name || "",
        email: existing?.email || `${clean}@taxedge.in`,
        customerType: existing?.customerType || "Individual",
        registrationCompleted: profileCompleted || Boolean(existing?.registrationCompleted),
      };
      if (existing) {
        authStorage.saveUser(user);
      }
    }

    return {
      success: true,
      isExistingUser: customerExists,
      customerExists,
      profileCompleted,
      hasPasscode,
      user: user || undefined,
    };
  },

  async checkUser(mobileNumber: string): Promise<{ success: boolean; exists: boolean; customerExists: boolean; profileCompleted: boolean; hasPasscode: boolean; user?: DevUser; error?: string }> {
    const clean = mobileNumber.replace(/\D/g, "");
    try {
      const checkRes = await authApi.checkUser(clean);
      if (checkRes && checkRes.success) {
        return {
          success: true,
          exists: checkRes.exists,
          customerExists: checkRes.customerExists ?? checkRes.exists,
          profileCompleted: checkRes.exists,
          hasPasscode: checkRes.exists,
        };
      }
      return {
        success: false,
        exists: false,
        customerExists: false,
        profileCompleted: false,
        hasPasscode: false,
        error: (checkRes as any).error || "Unable to check customer existence",
      };
    } catch (e) {
      logger.warn("[AuthService] Error calling backend checkUser", { error: getErrorMessage(e) });
      return {
        success: false,
        exists: false,
        customerExists: false,
        profileCompleted: false,
        hasPasscode: false,
        error: getErrorMessage(e) || "Unable to check customer existence",
      };
    }
  },
 
  async registerUser(params: RegisterParams, autoLogin = false): Promise<AuthResult> {
    const mobile = (params.mobileNumber || "").replace(/\D/g, "");
    if (mobile.length !== 10) return { success: false, error: "Please enter a valid 10-digit mobile number" };
    if (!params.name?.trim()) return { success: false, error: "Full name is required" };
 
    const passcode = params.passcode ? params.passcode.replace(/\D/g, "") : "";
 
    // Fetch Push Token from device/Expo push service
    let pushToken: string | undefined = undefined;
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        pushToken = token;
        logger.info("[AuthService] Push token registered", { hasPushToken: Boolean(pushToken) });
      }
    } catch (e) {
      logger.warn("[AuthService] Could not retrieve push token during registration", { error: getErrorMessage(e) });
    }
 
    const user: DevUser = {
      mobileNumber: mobile,
      passcode,
      name: params.name.trim(),
      email: params.email?.trim() || `${mobile}@taxedge.in`,
      customerType: params.customerType || "Individual",
      dob: params.dob?.trim() || "",
      gender: params.gender?.trim() || "",
      fatherSpouseName: params.fatherSpouseName?.trim() || "",
      pan: params.pan?.trim().toUpperCase() || "",
      aadhaar: params.aadhaar?.trim() || "",
      address: params.address?.trim() || "",
      addressLine1: params.addressLine1?.trim() || "",
      addressLine2: params.addressLine2?.trim() || "",
      city: params.city?.trim() || "",
      pincode: params.pincode?.trim() || "",
      state: params.state?.trim() || "",
      avatarUri: params.avatarUri || null,
      pushToken,
      registrationCompleted: Boolean(passcode),
      createdAt: new Date().toISOString(),
      customerId: `CUST-2026-${mobile.slice(-5) || "00001"}`,
    };
 
    // Execute Backend Fetch Request
    const apiRes = await authApi.register({
      ...user,
      mobileNumber: mobile,
      passcode,
      pushToken,
    });
 
    if (!apiRes.success) {
      return {
        success: false,
        error: apiRes.message || "Failed to register customer on server.",
      };
    }
 
    if (apiRes.user?.customerId) {
      user.customerId = apiRes.user.customerId;
    }

    if (passcode) {
      await passcodeService.setPasscode(mobile, passcode);
    }

    authStorage.saveUser(user);

    if (autoLogin && passcode) {
      authStorage.saveSession({
        isLoggedIn: true,
        activeMobile: mobile,
        lastLoginAt: new Date().toISOString(),
      });
    }

    return { success: true, user, token: apiRes.token };
  },

  async createPasscode(mobileNumber: string, passcode: string): Promise<AuthResult> {
    const clean = mobileNumber.replace(/\D/g, "");
    const pass = passcode.replace(/\D/g, "");
    if (clean.length !== 10) return { success: false, error: "Invalid mobile number" };
    if (pass.length !== 6) return { success: false, error: "Passcode must be exactly 6 digits" };

    let user = authStorage.getUserByMobile(clean);
    if (!user) {
      user = {
        customerId: `CUST-2026-${clean.slice(-5)}`,
        mobileNumber: clean,
        name: "Valued Client",
        email: `${clean}@taxedge.in`,
        customerType: "Individual",
      };
    }

    user.registrationCompleted = true;
    authStorage.saveUser(user);
    await passcodeService.setPasscode(clean, pass);

    try {
      const remoteRes = await authApi.createPasscode(clean, pass);
      if (!remoteRes.success) {
        logger.warn("[AuthService] Remote passcode sync failed; local passcode preserved", {
          message: remoteRes.message,
        });
      }
    } catch (err) {
      logger.warn("[AuthService] Remote passcode sync exception; local passcode preserved", {
        error: getErrorMessage(err),
      });
    }

    authStorage.saveSession({
      isLoggedIn: true,
      activeMobile: clean,
      lastLoginAt: new Date().toISOString(),
    });

    return { success: true, user };
  },

  async loginWithPasscode(m: string, p: string): Promise<AuthResult> {
    const clean = (m || "").replace(/\D/g, "");
    const pass = (p || "").replace(/\D/g, "");
    if (clean.length !== 10) return { success: false, error: "Please enter a valid 10-digit mobile number" };
    if (pass.length !== 6) return { success: false, error: "Passcode must be exactly 6 numeric digits" };

    const verifyRes = await passcodeService.verifyPasscode(clean, pass);
    if (!verifyRes.success) {
      return { success: false, error: verifyRes.error || "Invalid mobile number or passcode" };
    }

    let existingUser = authStorage.getUserByMobile(clean) || ({} as DevUser);
    const user: DevUser = {
      ...existingUser,
      ...(verifyRes.user || {}),
      mobileNumber: clean,
      registrationCompleted: true,
    };
    authStorage.saveUser(user);

    authStorage.saveSession({
      isLoggedIn: true,
      activeMobile: clean,
      lastLoginAt: new Date().toISOString(),
    });
    return { success: true, user, token: verifyRes.token };
  },

  async forgotPasscode(mobileNumber: string): Promise<{ success: boolean; message?: string }> {
    const clean = mobileNumber.replace(/\D/g, "");
    return authApi.forgotPasscode(clean);
  },

  async updatePassword(mobileNumber: string, newPasscode: string): Promise<AuthResult> {
    const clean = mobileNumber.replace(/\D/g, "");
    const pass = newPasscode.replace(/\D/g, "");
    if (clean.length !== 10) return { success: false, error: "Please enter a valid 10-digit mobile number" };
    if (pass.length !== 6) return { success: false, error: "Passcode must be 6 numeric digits" };

    const apiRes = await authApi.updatePassword(clean, pass);
    if (!apiRes.success) {
      return { success: false, error: apiRes.message || "Failed to update password" };
    }

    await passcodeService.setPasscode(clean, pass);
    let user = authStorage.getUserByMobile(clean);
    if (user) {
      user.registrationCompleted = true;
      authStorage.saveUser(user);
    }

    return { success: true, user: user || undefined, message: apiRes.message };
  },

  async resetPasscode(mobileNumber: string, newPasscode: string, _otp?: string): Promise<AuthResult> {
    const clean = mobileNumber.replace(/\D/g, "");
    const pass = newPasscode.replace(/\D/g, "");
    if (clean.length !== 10) return { success: false, error: "Please enter a valid 10-digit mobile number" };
    if (pass.length !== 6) return { success: false, error: "Passcode must be 6 numeric digits" };

    const apiRes = await authApi.updatePassword(clean, pass);
    if (!apiRes.success) {
      return { success: false, error: apiRes.message || "Failed to reset passcode" };
    }

    await passcodeService.setPasscode(clean, pass);
    let user = authStorage.getUserByMobile(clean);
    if (user) {
      user.registrationCompleted = true;
      authStorage.saveUser(user);
    }

    return { success: true, user: user || undefined, message: apiRes.message };
  },
 
  login: (m: string, p: string) => authService.loginWithPasscode(m, p),
  logout: async () => {
    authStorage.clearSession();
    try {
      const refreshToken = await tokenManager.getRefreshToken();
      if (refreshToken) {
        authApi.revokeRefreshToken(refreshToken).catch((err) => {
          logger.debug("[AuthService] Background token revocation error", { error: getErrorMessage(err) });
        });
      }
    } catch (e) {
      logger.warn("[AuthService] Error during logout token revocation", { error: getErrorMessage(e) });
    } finally {
      await tokenManager.clearTokens();
    }
  },
  isAuthenticated: () => Boolean(authStorage.getSession().isLoggedIn && authStorage.getSession().activeMobile),
  getActiveMobile: () => authStorage.getSession().activeMobile,
  getCurrentUser: (): StoredUser | null => {
    const session = authStorage.getSession();
    return session.activeMobile ? authStorage.getUserByMobile(session.activeMobile) : null;
  },
  setAvatar: (uri: string | null) => {
    const u = authService.getCurrentUser();
    if (u) {
      u.avatarUri = uri;
      authStorage.saveUser(u);
    }
  },
  resetAccount: () => authStorage.clearAllAuthData(),
};
 
// Aliased for seamless backwards-compatibility
export const devAuthService = authService;
export default authService;
 
 