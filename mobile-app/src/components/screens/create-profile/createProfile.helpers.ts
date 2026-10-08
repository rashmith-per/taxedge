import type { SignupForm } from "./types";

/** "Line 1, Line 2, City, State - PIN" from the sign-up address fields, skipping empty parts. */
export const formatSignupAddress = (form: SignupForm): string =>
  [
    form.addressLine1.trim(),
    form.addressLine2.trim(),
    form.city.trim(),
    form.state.trim()
      ? `${form.state.trim()} - ${form.pincode.trim()}`
      : form.pincode.trim(),
  ]
    .filter(Boolean)
    .join(", ");

/** Profile passed to `register`, with fields trimmed and normalised. */
export const buildRegistrationProfile = (
  form: SignupForm,
  fullAddress: string,
  storeMobileNumber: string
) => ({
  name: form.name.trim(),
  email: form.email.trim(),
  customerType: form.customerType,
  dob: form.dob.trim(),
  gender: form.gender,
  fatherSpouseName: form.fatherSpouseName.trim(),
  pan: form.pan.trim().toUpperCase(),
  aadhaar: form.aadhaar.replace(/\D/g, ""),
  address: fullAddress,
  addressLine1: form.addressLine1.trim(),
  addressLine2: form.addressLine2.trim(),
  city: form.city.trim(),
  pincode: form.pincode.trim(),
  state: form.state.trim(),
  mobileNumber: form.mobileNumber || storeMobileNumber,
});
