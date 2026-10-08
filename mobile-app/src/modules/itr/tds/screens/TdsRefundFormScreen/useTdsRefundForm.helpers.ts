import type { Customer } from "@/shared/types/domain";
import type { DevUser } from "@/modules/authentication/types/auth.types";
import type { CustomerApiRecord } from "@/modules/authentication/services/authApi";
import type { PersonalDetails } from "../../types/customerIncome.types";

/** Customer fields as returned by the customer-details API or read from the locally stored user. */
export type CustomerProfileRecord = CustomerApiRecord;

/** Logged-in user as stored by auth; older records carry `custId` instead of `customerId`. */
type AuthUserRecord = DevUser & { custId?: string };

/** Customer built from a fetched profile record, falling back to what the app already holds. */
export const mergeFetchedCustomer = (
  apiRes: CustomerProfileRecord,
  currentCustomer: Customer | null,
  currentAuthUser: AuthUserRecord | null,
  activeMobile: string | null | undefined,
  activeCustId: string | null | undefined
): Customer => ({
  name: apiRes.name || apiRes.fullName || currentCustomer?.name || "",
  email: apiRes.email || currentCustomer?.email || "",
  mobile: apiRes.mobileNumber || apiRes.mobile || currentCustomer?.mobile || activeMobile || "",
  pan: apiRes.pan || currentCustomer?.pan || "",
  aadhaar: apiRes.aadhaar || currentCustomer?.aadhaar || "",
  dob: apiRes.dob || apiRes.dateOfBirth || currentCustomer?.dob || "",
  customerType: apiRes.customerType || apiRes.custType || currentCustomer?.customerType || "Individual",
  addressLine1: apiRes.addressLine1 || currentCustomer?.addressLine1 || "",
  addressLine2: apiRes.addressLine2 || currentCustomer?.addressLine2 || "",
  city: apiRes.city || currentCustomer?.city || "",
  state: apiRes.state || currentCustomer?.state || "",
  pincode: apiRes.pincode || apiRes.pinCode || currentCustomer?.pincode || "",
  address: apiRes.address || currentCustomer?.address || "",
  customerId: apiRes.custId || apiRes.customerId || currentCustomer?.customerId || activeCustId || "",
  avatarUri: currentCustomer?.avatarUri || null,
  profileCompleted: true,
  hasPasscode: currentCustomer?.hasPasscode ?? Boolean(currentAuthUser?.passcode),
});

/** Personal-details section of the TDS form, from the best available profile source. */
export const buildPersonalDetails = (
  apiRes: CustomerProfileRecord | null,
  currentCustomer: Customer | null,
  currentAuthUser: AuthUserRecord | null
): PersonalDetails => {
  const rawPan = apiRes?.pan || currentCustomer?.pan || currentAuthUser?.pan || "";
  const rawAadhaar = apiRes?.aadhaar || currentCustomer?.aadhaar || currentAuthUser?.aadhaar || "";
  const rawDob = apiRes?.dob || apiRes?.dateOfBirth || currentCustomer?.dob || currentAuthUser?.dob || "";
  const rawMobile = apiRes?.mobileNumber || apiRes?.mobile || currentCustomer?.mobile || currentAuthUser?.mobileNumber || "";
  const rawEmail = apiRes?.email || currentCustomer?.email || currentAuthUser?.email || "";
  const rawName = apiRes?.name || apiRes?.fullName || currentCustomer?.name || currentAuthUser?.name || "";

  let rawAddress = apiRes?.addressLine1 || currentCustomer?.addressLine1 || apiRes?.address || currentCustomer?.address || "";
  if (apiRes?.addressLine2 || currentCustomer?.addressLine2) {
    // One of the two is set (checked above), so the empty fallback never applies.
    const line2 = apiRes?.addressLine2 || currentCustomer?.addressLine2 || "";
    rawAddress = rawAddress ? `${rawAddress}, ${line2}` : line2;
  }

  const rawCity = apiRes?.city || currentCustomer?.city || "";
  const rawState = apiRes?.state || currentCustomer?.state || "";
  const rawPin = apiRes?.pincode || apiRes?.pinCode || currentCustomer?.pincode || "";

  return {
    fullName: rawName,
    pan: rawPan,
    aadhaar: rawAadhaar,
    dob: rawDob,
    mobileNumber: rawMobile,
    email: rawEmail,
    residentialAddress: rawAddress,
    city: rawCity,
    state: rawState,
    pinCode: rawPin,
  };
};

/** Customer record after the user edits their personal details on the TDS form. */
export const buildCustomerFromPersonal = (
  normalizedPersonal: PersonalDetails,
  cleanMob: string,
  currentCust: Customer | null,
  currentAuthUser: AuthUserRecord | null
): Customer => ({
  name: normalizedPersonal.fullName,
  email: normalizedPersonal.email,
  mobile: cleanMob || normalizedPersonal.mobileNumber,
  pan: normalizedPersonal.pan,
  aadhaar: normalizedPersonal.aadhaar,
  dob: normalizedPersonal.dob,
  customerType: currentCust?.customerType || "Individual",
  addressLine1: normalizedPersonal.residentialAddress,
  addressLine2: currentCust?.addressLine2 || "",
  city: normalizedPersonal.city,
  state: normalizedPersonal.state,
  pincode: normalizedPersonal.pinCode,
  address: `${normalizedPersonal.residentialAddress}, ${normalizedPersonal.city}, ${normalizedPersonal.state} - ${normalizedPersonal.pinCode}`,
  customerId: currentCust?.customerId || currentAuthUser?.customerId || currentAuthUser?.custId || "",
  avatarUri: currentCust?.avatarUri || null,
  profileCompleted: true,
  hasPasscode: currentCust?.hasPasscode ?? Boolean(currentAuthUser?.passcode),
});

/** Request body for `authApi.updateCustomerProfile`. */
export const buildCustomerProfileUpdate = (updatedCustomer: Customer) => ({
  custId: updatedCustomer.customerId || undefined,
  name: updatedCustomer.name,
  email: updatedCustomer.email,
  mobileNumber: updatedCustomer.mobile,
  pan: updatedCustomer.pan,
  aadhaar: updatedCustomer.aadhaar,
  dob: updatedCustomer.dob,
  addressLine1: updatedCustomer.addressLine1,
  addressLine2: updatedCustomer.addressLine2,
  city: updatedCustomer.city,
  state: updatedCustomer.state,
  pincode: updatedCustomer.pincode,
  address: updatedCustomer.address,
});
