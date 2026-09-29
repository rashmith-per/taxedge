import type { DirectorInfo } from '../types/director.types';
import { PAN_REGEX, AADHAAR_REGEX, EMAIL_REGEX, PHONE_REGEX, PINCODE_REGEX } from '../../../shared/validators/indianTaxValidators';

export const DOB_REGEX = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-(19|20)\d\d$/;

export function isValidDob(dob: string): boolean {
  if (!dob || !DOB_REGEX.test(dob)) return false;
  const parts = dob.split('-');
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function formatDobInput(text: string): string {
  const cleaned = text.replace(/\D/g, '').slice(0, 8);
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 8)}`;
}

export const directorSchema = {
  validateDirector(director: Partial<DirectorInfo>, index = 0): { valid: boolean; errors: string[]; fieldErrors: Record<string, string> } {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};
    const dirId = director.id || `dir_${index}`;
    const prefix = `dir_${dirId}_`;

    if (!director.name?.trim()) {
      fieldErrors[`${prefix}name`] = 'Director name is required.';
      errors.push(fieldErrors[`${prefix}name`]);
    }
    if (!director.pan?.trim() || !PAN_REGEX.test(director.pan.trim().toUpperCase())) {
      fieldErrors[`${prefix}pan`] = 'Please enter a valid 10-character PAN.';
      errors.push(fieldErrors[`${prefix}pan`]);
    }
    if (director.aadhaar && !AADHAAR_REGEX.test(director.aadhaar.trim().replace(/\s/g, ''))) {
      fieldErrors[`${prefix}aadhaar`] = 'Please enter a valid 12-digit Aadhaar.';
      errors.push(fieldErrors[`${prefix}aadhaar`]);
    }
    if (!director.dob?.trim()) {
      fieldErrors[`${prefix}dob`] = 'Date of Birth is required.';
      errors.push(fieldErrors[`${prefix}dob`]);
    } else if (!isValidDob(director.dob.trim())) {
      fieldErrors[`${prefix}dob`] = 'Please enter a valid date of birth in DD-MM-YYYY format.';
      errors.push(fieldErrors[`${prefix}dob`]);
    }
    if (!director.fatherName?.trim()) {
      fieldErrors[`${prefix}fatherName`] = "Father's name is required.";
      errors.push(fieldErrors[`${prefix}fatherName`]);
    }
    if (!director.gender?.trim()) {
      fieldErrors[`${prefix}gender`] = 'Gender is required.';
      errors.push(fieldErrors[`${prefix}gender`]);
    }
    if (!director.nationality?.trim()) {
      fieldErrors[`${prefix}nationality`] = 'Nationality is required.';
      errors.push(fieldErrors[`${prefix}nationality`]);
    }
    if (!director.designation?.trim()) {
      fieldErrors[`${prefix}designation`] = 'Designation is required.';
      errors.push(fieldErrors[`${prefix}designation`]);
    }
    if (!director.category?.trim()) {
      fieldErrors[`${prefix}category`] = 'Category is required.';
      errors.push(fieldErrors[`${prefix}category`]);
    }
    if (!director.email?.trim() || !EMAIL_REGEX.test(director.email.trim())) {
      fieldErrors[`${prefix}email`] = 'Please enter a valid Email address.';
      errors.push(fieldErrors[`${prefix}email`]);
    }
    if (!director.phone?.trim()) {
      fieldErrors[`${prefix}phone`] = 'Please enter a valid phone number.';
      errors.push(fieldErrors[`${prefix}phone`]);
    } else if (!PHONE_REGEX.test(director.phone.trim())) {
      fieldErrors[`${prefix}phone`] = 'Please enter a valid phone number.';
      errors.push(fieldErrors[`${prefix}phone`]);
    }

    if (director.hasDin && !director.din?.trim()) {
      fieldErrors[`${prefix}din`] = `DIN is required as 'Has DIN' is checked.`;
      errors.push(fieldErrors[`${prefix}din`]);
    }

    const addr = director.addressLine1?.trim() || director.residentialAddress?.trim();
    if (!addr) {
      fieldErrors[`${prefix}addressLine1`] = `Address Line 1 is required.`;
      errors.push(fieldErrors[`${prefix}addressLine1`]);
    }
    if (!director.city?.trim()) {
      fieldErrors[`${prefix}city`] = `City is required.`;
      errors.push(fieldErrors[`${prefix}city`]);
    }
    if (!director.district?.trim()) {
      fieldErrors[`${prefix}district`] = `District is required.`;
      errors.push(fieldErrors[`${prefix}district`]);
    }
    if (!director.state?.trim()) {
      fieldErrors[`${prefix}state`] = `State is required.`;
      errors.push(fieldErrors[`${prefix}state`]);
    }
    if (!director.pinCode?.trim() || !PINCODE_REGEX.test(director.pinCode.trim())) {
      fieldErrors[`${prefix}pinCode`] = `Please enter a valid 6-digit PIN code.`;
      errors.push(fieldErrors[`${prefix}pinCode`]);
    }

    if (!director.sameAsPermanentAddress) {
      if (!director.presentAddressLine1?.trim()) {
        fieldErrors[`${prefix}presentAddressLine1`] = `Present Address Line 1 is required.`;
        errors.push(fieldErrors[`${prefix}presentAddressLine1`]);
      }
      if (!director.presentCity?.trim()) {
        fieldErrors[`${prefix}presentCity`] = `Present City is required.`;
        errors.push(fieldErrors[`${prefix}presentCity`]);
      }
      if (!director.presentDistrict?.trim()) {
        fieldErrors[`${prefix}presentDistrict`] = `Present District is required.`;
        errors.push(fieldErrors[`${prefix}presentDistrict`]);
      }
      if (!director.presentState?.trim()) {
        fieldErrors[`${prefix}presentState`] = `Present State is required.`;
        errors.push(fieldErrors[`${prefix}presentState`]);
      }
      if (!director.presentPincode?.trim() || !PINCODE_REGEX.test(director.presentPincode.trim())) {
        fieldErrors[`${prefix}presentPincode`] = `Please enter a valid 6-digit Present PIN code.`;
        errors.push(fieldErrors[`${prefix}presentPincode`]);
      }
    }

    if (!director.numberOfShares || director.numberOfShares <= 0) {
      fieldErrors[`${prefix}numberOfShares`] = `Number of Subscribed Shares is required.`;
      errors.push(fieldErrors[`${prefix}numberOfShares`]);
    }

    return { valid: errors.length === 0, errors, fieldErrors };
  },
};

