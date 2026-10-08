import type { Customer, CustomerProfile } from "../../../shared/types/domain";

export type AuthFlowState =
  | "ENTER_MOBILE"
  | "OTP_VERIFICATION"
  | "PASSCODE_LOGIN"
  | "FORGOT_PASSCODE_OTP"
  | "RESET_PASSCODE"
  | "BIOMETRIC_REAUTH";

export interface RegistrationData {
  name: string;
  email: string;
  customerType?: string;
  dob?: string;
  gender?: string;
  fatherSpouseName?: string;
  pan?: string;
  aadhaar?: string;
  address?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  pincode?: string;
  state?: string;
  avatarUri?: string | null;
  pushToken?: string;
}

export interface DevUser {
  customerId: string;
  mobileNumber: string;
  name: string;
  email: string;
  gender?: string;
  fatherSpouseName?: string;
  pan?: string;
  aadhaar?: string;
  dob?: string;
  address?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  pincode?: string;
  state?: string;
  customerType?: string;
  avatarUri?: string | null;
  passcode?: string;
  hasPasscode?: boolean;
  pushToken?: string;
  registrationCompleted?: boolean;
  createdAt?: string;
}

/**
 * Field aliases found on user records saved by older app versions or returned
 * directly by the backend (`custId` for `customerId`, `mobile` for `mobileNumber`, …).
 */
export interface LegacyUserFields {
  custId?: string;
  mobile?: string;
  adhar?: string;
  pinCode?: string;
  fullName?: string;
  dateOfBirth?: string;
  custType?: string;
  profileCompleted?: boolean;
  token?: string;
}

/** A user record as persisted on the device: `DevUser` plus any legacy aliases it may carry. */
export type StoredUser = DevUser & LegacyUserFields;

/** The persisted login session. */
export interface AuthSession {
  isLoggedIn: boolean;
  activeMobile: string | null;
  lastLoginAt?: string | null;
  activeCustId?: string;
}

export interface AuthResult {
  success: boolean;
  user?: DevUser;
  isExistingUser?: boolean;
  customerExists?: boolean;
  profileCompleted?: boolean;
  hasPasscode?: boolean;
  message?: string;
  error?: string;
  token?: string;
}

export interface AuthStoreState {
  // Session & user
  isLoggedIn: boolean;
  mobileNumber: string;
  customer: Customer | null;
  authenticatedUser: StoredUser | null;

  // Flow State
  authFlowState: AuthFlowState;
  isExistingUser: boolean;
  customerExists: boolean;
  profileCompleted: boolean;
  hasPasscode: boolean;
  isLoading: boolean;
  error: string | null;

  // OTP State
  otp: string;
  otpTimer: number;
  canResendOTP: boolean;

  // Passcode State
  passcode: string;
  confirmPasscode: string;

  // Onboarding & Service Access
  pendingServiceRoute: string | null;
  isCompleteProfileModalOpen: boolean;

  // Biometric Authentication
  isBiometricEnabled: boolean;
  biometricTypeLabel: string;
}


export interface AuthStoreActions {
  // Field updaters
  setMobileNumber: (m: string) => void;
  setOtp: (otp: string) => void;
  setPasscode: (p: string) => void;
  setConfirmPasscode: (cp: string) => void;
  setAuthFlowState: (state: AuthFlowState) => void;
  setError: (err: string | null) => void;
  setIsLoading: (loading: boolean) => void;

  // Onboarding & Service Access actions
  setProfileCompleted: (completed: boolean) => void;
  setPendingServiceRoute: (route: string | null) => void;
  openCompleteProfileModal: (targetRoute?: string) => void;
  closeCompleteProfileModal: () => void;

  // Biometric actions
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  syncBiometricState: () => Promise<void>;

  // Timer actions
  setOtpTimer: (t: number) => void;
  decrementTimer: () => void;
  resetTimer: (initialSeconds?: number) => void;

  // Business Flow Operations
  sendOtp: (overrideMobile?: string) => Promise<boolean>;
  checkUser: (overrideMobile?: string) => Promise<any>;
  verifyOtp: (codeToVerify?: string) => Promise<{
    success: boolean;
    isExistingUser?: boolean;
    requiresPasscode?: boolean;
    profileCompleted?: boolean;
    error?: string;
    message?: string;
  }>;
  loginWithPasscode: (passcodeToUse?: string) => Promise<{ success: boolean; error?: string }>;
  startForgotPasscode: () => Promise<boolean>;
  verifyForgotPasscodeOtp: (codeToVerify?: string) => Promise<boolean>;
  resetPasscodeAndProceed: () => Promise<boolean>;
  updatePassword: (mobileNumber: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  resendOtp: () => Promise<boolean>;
  changeNumber: () => void;
  resetFlow: () => void;

  // Registration & Session actions
  login: (p?: string) => Promise<{ success: boolean; error?: string }>;
  register: (profile: CustomerProfile, passcode?: string, autoLogin?: boolean) => Promise<{ success: boolean; error?: string }>;
  setAvatar: (uri: string | null) => void;
  logout: () => void | Promise<void>;
  syncFromDevAuth: () => void;
  fetchAndSyncProfile: (identifier?: string) => Promise<{ success: boolean; isComplete: boolean; customer: Customer | null }>;
}

export type AuthState = AuthStoreState & AuthStoreActions;
