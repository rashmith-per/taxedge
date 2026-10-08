import { apiClient } from "../../../core/api/apiClient";
import { tokenManager } from "../../../core/authentication/tokenManager";
import type { DevUser, RegistrationData } from "../types/auth.types";
import { buildRegisterPayload } from "./customerRegistrationPayload";
import { getErrorMessage } from "@/core/error-handling/errorMessage";
import { logger } from "@/core/logging/logger";

const maskMobile = (mobile: string): string => {
  if (!mobile) return "";
  const clean = mobile.replace(/\D/g, "");
  return clean.length >= 4 ? clean.slice(-4).padStart(clean.length, "*") : "****";
};

export interface SendOtpResponse {
  success: boolean;
  message?: string;
}

/** Customer record as returned by the customer endpoints (backend CustomerDto; legacy aliases included). */
export interface CustomerApiRecord {
  custId?: string;
  customerId?: string;
  name?: string;
  fullName?: string;
  email?: string;
  mobileNumber?: string;
  mobile?: string;
  customerType?: string;
  custType?: string;
  pan?: string;
  aadhaar?: string;
  adhar?: string;
  dob?: string;
  dateOfBirth?: string;
  gender?: string;
  fatherSpouseName?: string;
  address?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  pinCode?: string;
  avatarUri?: string | null;
  profileCompleted?: boolean;
  registrationCompleted?: boolean;
}

/** `POST /otp/verify` body. The embedded customer is present only for registered numbers. */
interface VerifyOtpApiResponse {
  customerExists?: boolean;
  isExistingUser?: boolean;
  profileCompleted?: boolean;
  hasPasscode?: boolean;
  message?: string;
  customer?: CustomerApiRecord & { custId: string; name: string; email: string };
}

/** `GET /customer/exists/:mobile` body. */
interface CustomerStatusResponse {
  exists?: boolean;
  customerExists?: boolean;
  profileCompleted?: boolean;
  hasPasscode?: boolean;
}

/** Token pair and identity returned by `/customer/login` and `/customer/register`. */
export interface CustomerLoginResponse {
  accessToken?: string;
  refreshToken?: string;
  custId: string;
  mobileNumber: string;
  name: string;
}

/** Result of `getCustomerDetails`. */
export type CustomerDetailsResult =
  | { success: true; data: CustomerApiRecord }
  | { success: false; message: string };

/** Fields sent to `PUT /customer/update`; other profile fields pass through unchanged. */
export interface CustomerProfileUpdate {
  mobileNumber?: string;
  dob?: string;
  [field: string]: unknown;
}

export interface VerifyOtpResponse {
  success: boolean;
  isExistingUser?: boolean;
  customerExists?: boolean;
  profileCompleted?: boolean;
  hasPasscode?: boolean;
  message?: string;
  user?: DevUser;
  customer?: CustomerApiRecord;
}

export interface CheckUserResponse {
  success: boolean;
  exists: boolean;
  customerExists?: boolean;
  profileCompleted?: boolean;
  hasPasscode?: boolean;
  user?: DevUser;
}

export interface RegisterResponse {
  success: boolean;
  user: DevUser;
  token?: string;
  message?: string;
}

export interface PasscodeResponse {
  success: boolean;
  user?: DevUser;
  token?: string;
  message?: string;
}

export interface UpdatePasswordResponse {
  success: boolean;
  message?: string;
}

export const authApi = {
  sendOtp: async (mobileNumber: string): Promise<SendOtpResponse> => {
    const cleanMobile = mobileNumber.replace(/\D/g, "");
    try {
      logger.info("[OTP] Requesting OTP generation", { mobile: maskMobile(cleanMobile) });
      const res = await apiClient.post<unknown>("/otp/generate", {
        mobileNumber: cleanMobile,
      });
      logger.info("[OTP] Backend generated OTP successfully");
      return {
        success: true,
        message: typeof res === "string" ? res : "OTP generated successfully",
      };
    } catch (error) {
      logger.warn("[OTP] Error requesting OTP from backend", { error: getErrorMessage(error) });
      const errorMsg = getErrorMessage(error)?.includes("Network request failed")
        ? `Network error: Unable to reach backend at ${apiClient.getBaseUrl()}. Check connection.`
        : getErrorMessage(error) || "Failed to generate OTP";
      return { success: false, message: errorMsg };
    }
  },

  verifyOtp: async (
    mobileNumber: string,
    otp: string,
  ): Promise<VerifyOtpResponse> => {
    const cleanMobile = mobileNumber.replace(/\D/g, "");
    try {
      logger.info("[OTP] Verifying OTP with backend", { mobile: maskMobile(cleanMobile) });
      const res = await apiClient.post<VerifyOtpApiResponse>("/otp/verify", {
        mobileNumber: cleanMobile,
        otpCode: otp,
      });
      logger.info("[OTP] Backend verified OTP response received", {
        customerExists: Boolean(res?.customerExists || res?.isExistingUser),
        profileCompleted: Boolean(res?.profileCompleted),
        hasPasscode: Boolean(res?.hasPasscode),
      });

      const customerExists =
        res?.customerExists === true || res?.isExistingUser === true;
      const profileCompleted = res?.profileCompleted === true;
      const hasPasscode = res?.hasPasscode === true;

      let devUser: DevUser | undefined;
      if (res?.customer) {
        devUser = {
          customerId: res.customer.custId,
          name: res.customer.name,
          email: res.customer.email,
          mobileNumber: res.customer.mobileNumber || cleanMobile,
          customerType: res.customer.customerType,
          registrationCompleted: profileCompleted,
        };
      }

      return {
        success: true,
        isExistingUser: customerExists,
        customerExists,
        profileCompleted,
        hasPasscode,
        message: res?.message || "OTP verified successfully",
        user: devUser,
        customer: res?.customer,
      };
    } catch (error) {
      logger.warn("[OTP] Incorrect OTP entered or verification failed", {
        mobile: maskMobile(cleanMobile),
        error: getErrorMessage(error),
      });
      const errorMessage = getErrorMessage(error);
      const backendMsg =
        errorMessage &&
        errorMessage !== "Request failed" &&
        !errorMessage.includes("status code")
          ? errorMessage
          : "Incorrect OTP code. Please enter the valid OTP sent to your terminal.";
      return {
        success: false,
        isExistingUser: false,
        customerExists: false,
        profileCompleted: false,
        hasPasscode: false,
        message: backendMsg,
      };
    }
  },

  checkUser: async (mobileNumber: string): Promise<CheckUserResponse> => {
    const cleanMobile = mobileNumber.replace(/\D/g, "");
    try {
      logger.debug("[API] Checking customer status", { mobile: maskMobile(cleanMobile) });
      const res = await apiClient.get<CustomerStatusResponse>(`/customer/exists/${cleanMobile}`);
      const exists = res?.exists === true || res?.customerExists === true;
      logger.debug("[API] Customer status retrieved", { exists });
      return {
        success: true,
        exists,
        customerExists: exists,
        profileCompleted: res?.profileCompleted === true,
        hasPasscode: res?.hasPasscode === true,
      };
    } catch (err) {
      logger.warn("Error calling /customer/exists", { error: getErrorMessage(err) });
      return {
        success: false,
        exists: false,
        customerExists: false,
        profileCompleted: false,
        hasPasscode: false,
      };
    }
  },

  register: async (
    data: RegistrationData & { mobileNumber: string; passcode?: string },
  ): Promise<RegisterResponse> => {
    try {
      const payload = buildRegisterPayload(data);
      logger.info("[API] Registering customer", {
        customerType: data.customerType,
        mobile: maskMobile(data.mobileNumber),
      });
      const response = await apiClient.post<Partial<CustomerLoginResponse>>("/customer/register", payload);
      logger.info("[API] Customer registration response received", {
        custId: response.custId,
        hasAccessToken: Boolean(response.accessToken),
      });

      if (response.accessToken) {
        await tokenManager.setAccessToken(response.accessToken);
      }
      if (response.refreshToken) {
        await tokenManager.setRefreshToken(response.refreshToken);
      }

      return {
        success: true,
        user: {
          customerId: response.custId || `CUST-${data.mobileNumber}`,
          mobileNumber: response.mobileNumber || data.mobileNumber,
          name: response.name || data.name,
          email: data.email,
          pushToken: data.pushToken,
        },
        token: response.accessToken,
      };
    } catch (error) {
      logger.error("[API] Customer registration failed", error);
      return {
        success: false,
        message: getErrorMessage(error) || "Registration failed on backend",
        user: {} as DevUser,
      };
    }
  },

  createPasscode: async (
    mobileNumber: string,
    passcode: string,
  ): Promise<PasscodeResponse> => {
    try {
      const res = await apiClient.post<PasscodeResponse>("/auth/create-passcode", {
        mobileNumber,
        passcode,
      });
      logger.info("[API] Passcode created successfully");
      return res;
    } catch (error) {
      logger.warn("[API] Failed to create passcode on server", {
        error: getErrorMessage(error),
      });
      return {
        success: false,
        message: getErrorMessage(error) || "Failed to create passcode on server",
      };
    }
  },

  loginPasscode: async (
    mobileNumber: string,
    passcode: string,
  ): Promise<PasscodeResponse> => {
    try {
      const cleanMobile = mobileNumber.replace(/\D/g, "");
      logger.info("[API] Attempting passcode login", { mobile: maskMobile(cleanMobile) });
      const response = await apiClient.post<CustomerLoginResponse>("/customer/login", {
        mobileNumber: cleanMobile,
        password: passcode,
      });
      logger.info("[API] Customer login successful", {
        custId: response.custId,
        hasAccessToken: Boolean(response.accessToken),
      });

      if (response.accessToken) {
        await tokenManager.setAccessToken(response.accessToken);
      }
      if (response.refreshToken) {
        await tokenManager.setRefreshToken(response.refreshToken);
      }

      return {
        success: true,
        token: response.accessToken,
        user: {
          customerId: response.custId,
          mobileNumber: response.mobileNumber,
          name: response.name,
          email: `${response.mobileNumber}@taxedge.in`,
        },
      };
    } catch (error) {
      logger.warn("[API] Passcode login failed", { error: getErrorMessage(error) });
      return {
        success: false,
        message: getErrorMessage(error) || "Invalid mobile number or passcode",
      };
    }
  },

  updatePassword: async (
    mobileNumber: string,
    password: string,
  ): Promise<UpdatePasswordResponse> => {
    const cleanMobile = mobileNumber.replace(/\D/g, "");
    try {
      logger.info("[API] Updating customer password", { mobile: maskMobile(cleanMobile) });
      const res = await apiClient.patch<string | { message?: string }>("/customer/update_password", {
        mobileNumber: cleanMobile,
        password,
      });
      logger.info("[API] Password update completed");

      const msg =
        typeof res === "string"
          ? res
          : res?.message || "Password updated successfully";
      if (typeof msg === "string" && msg.toLowerCase().includes("not found")) {
        return { success: false, message: msg };
      }
      return { success: true, message: msg };
    } catch (error) {
      logger.error("[API] Password update error", error);
      return {
        success: false,
        message: getErrorMessage(error) || "Failed to update password",
      };
    }
  },

  forgotPasscode: async (mobileNumber: string): Promise<SendOtpResponse> => {
    const cleanMobile = mobileNumber.replace(/\D/g, "");
    return authApi.sendOtp(cleanMobile);
  },

  resetPasscode: async (
    mobileNumber: string,
    newPasscode: string,
    _otp?: string,
  ): Promise<PasscodeResponse> => {
    const res = await authApi.updatePassword(mobileNumber, newPasscode);
    return {
      success: res.success,
      message: res.message,
    };
  },

  revokeRefreshToken: async (refreshToken: string): Promise<boolean> => {
    try {
      logger.info("[API] Revoking refresh token on server");
      await apiClient.post("/auth/revoke", { refreshToken });
      logger.info("[API] Refresh token revoked successfully on backend");
      return true;
    } catch (err) {
      logger.warn("[API] Failed to revoke refresh token on backend", { error: getErrorMessage(err) });
      return false;
    }
  },

  getCustomerDetails: async (custId: string): Promise<CustomerDetailsResult> => {
    try {
      logger.debug("[API] Fetching customer details", { custId });
      const res = await apiClient.get<CustomerApiRecord>(`/customer/details/${custId}`);
      logger.debug("[API] Customer details fetched successfully", { custId });
      return { success: true as const, data: res };
    } catch (error) {
      logger.error("[API] Error fetching customer details", error, { custId });
      return { success: false as const, message: getErrorMessage(error) || "Failed to fetch customer details" };
    }
  },

  updateCustomerProfile: async (customerData: CustomerProfileUpdate): Promise<{ success: boolean; message?: string }> => {
    try {
      // Format DOB from DD/MM/YYYY or DD-MM-YYYY to YYYY-MM-DD for Spring Boot LocalDate if needed
      let formattedDob = customerData.dob || "";
      if (formattedDob && typeof formattedDob === "string") {
        if (/^\d{2}[-\/]\d{2}[-\/]\d{4}$/.test(formattedDob)) {
          const parts = formattedDob.split(/[-\/]/);
          formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      const payload = {
        ...customerData,
        mobileNumber: customerData.mobileNumber ? customerData.mobileNumber.replace(/\D/g, "").slice(-10) : undefined,
        dob: formattedDob || customerData.dob,
      };

      logger.info("[API] Updating customer profile");
      const res = await apiClient.put<unknown>("/customer/update", payload);
      logger.info("[API] Customer profile updated successfully");
      return { success: true, message: typeof res === "string" ? res : "Profile updated successfully" };
    } catch (error) {
      logger.error("[API] Customer profile update error", error);
      return { success: false, message: getErrorMessage(error) || "Failed to update profile" };
    }
  },
};

export default authApi;

