import type { CompanyDetails } from '../types/company.types';
import { EMAIL_REGEX, PHONE_REGEX, PINCODE_REGEX } from '../../../shared/validators/indianTaxValidators';

import type { LinkedRegistrations } from '../types/registration.types';

export const getSuffixForType = (type?: string): string => {
  switch (type) {
    case 'One Person Company (OPC)':
      return '(OPC) Private Limited';
    case 'Section 8 (NGO)':
      return 'Foundation / Section 8';
    case 'Public Limited':
      return 'Limited';
    default:
      return 'Private Limited';
  }
};

export const companySchema = {
  validateStep(step: number, details: Partial<CompanyDetails>, linkedRegistrations?: LinkedRegistrations): { valid: boolean; errors: string[]; fieldErrors: Record<string, string> } {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};

    if (step === 0) {
      if (!details.companyType?.trim()) {
        fieldErrors.companyType = 'Please select a Company Type to proceed.';
        errors.push(fieldErrors.companyType);
      }
    }

    if (step === 1) {
      if (!details.companyClass?.trim()) {
        fieldErrors.companyClass = 'Please select Company Classification.';
        errors.push(fieldErrors.companyClass);
      }
      if (!details.companyCategory?.trim()) {
        fieldErrors.companyCategory = 'Please select Company Category.';
        errors.push(fieldErrors.companyCategory);
      }
      if (!details.companySubCategory?.trim()) {
        fieldErrors.companySubCategory = 'Please select Company Sub-Category.';
        errors.push(fieldErrors.companySubCategory);
      }
      if (!details.primaryActivity?.trim()) {
        fieldErrors.primaryActivity = 'Please enter Primary Business Activity.';
        errors.push(fieldErrors.primaryActivity);
      }
      if (!details.nicCode?.trim() || !/^\d{5}$/.test(details.nicCode)) {
        fieldErrors.nicCode = 'Please enter a valid 5-Digit NIC Code.';
        errors.push(fieldErrors.nicCode);
      }
      if (!details.proposedName1?.trim()) {
        fieldErrors.proposedName1 = 'Please enter 1st Preferred Name.';
        errors.push(fieldErrors.proposedName1);
      }
      if (!details.proposedName2?.trim()) {
        fieldErrors.proposedName2 = 'Please enter 2nd Preferred Name.';
        errors.push(fieldErrors.proposedName2);
      }
      const effectiveSuffix = details.nameSuffix?.trim() || getSuffixForType(details.companyType);
      if (!effectiveSuffix) {
        fieldErrors.nameSuffix = 'Please enter Name Suffix.';
        errors.push(fieldErrors.nameSuffix);
      }
    }

    if (step === 2) {
      if (!details.registeredAddressLine?.trim()) {
        fieldErrors.registeredAddressLine = 'Please enter Building / Premises Address Line.';
        errors.push(fieldErrors.registeredAddressLine);
      }
      if (!details.registeredCity?.trim()) {
        fieldErrors.registeredCity = 'Please enter City.';
        errors.push(fieldErrors.registeredCity);
      }
      if (!details.registeredDistrict?.trim()) {
        fieldErrors.registeredDistrict = 'Please enter District.';
        errors.push(fieldErrors.registeredDistrict);
      }
      if (!details.registeredState?.trim()) {
        fieldErrors.registeredState = 'Please enter State.';
        errors.push(fieldErrors.registeredState);
      }
      if (!details.registeredPincode?.trim() || !PINCODE_REGEX.test(details.registeredPincode)) {
        fieldErrors.registeredPincode = 'Please enter a valid 6-Digit PIN Code.';
        errors.push(fieldErrors.registeredPincode);
      }
      if (!details.premisesOwnership?.trim()) {
        fieldErrors.premisesOwnership = 'Please select Premises Ownership Status.';
        errors.push(fieldErrors.premisesOwnership);
      }
      if (!details.companyEmail?.trim() || !EMAIL_REGEX.test(details.companyEmail)) {
        fieldErrors.companyEmail = 'Please enter a valid Company Email.';
        errors.push(fieldErrors.companyEmail);
      }
      if (!details.companyMobile?.trim() || !PHONE_REGEX.test(details.companyMobile.trim())) {
        fieldErrors.companyMobile = 'Please enter a valid phone number.';
        errors.push(fieldErrors.companyMobile);
      }
      if (!details.officeAddressProofName?.trim()) {
        fieldErrors.officeAddressProof = 'Office Address Proof / Utility Bill is required.';
        errors.push(fieldErrors.officeAddressProof);
      }
      if (!details.ownershipDocName?.trim()) {
        fieldErrors.ownershipDoc = 'Ownership / Rent / Lease Document is required.';
        errors.push(fieldErrors.ownershipDoc);
      }
      const isNocRequired = details.premisesOwnership === 'Rented' || details.premisesOwnership === 'Leased';
      if (isNocRequired && !details.ownerNocName?.trim()) {
        fieldErrors.ownerNoc = 'Owner NOC is required for Rented/Leased premises.';
        errors.push(fieldErrors.ownerNoc);
      }
    }

    if (step === 4) {
      if (!details.authorizedCapital || details.authorizedCapital <= 0) {
        fieldErrors.authorizedCapital = 'Please enter valid Authorized Capital.';
        errors.push(fieldErrors.authorizedCapital);
      }
      if (!details.paidUpCapital || details.paidUpCapital <= 0) {
        fieldErrors.paidUpCapital = 'Please enter valid Paid-up Capital.';
        errors.push(fieldErrors.paidUpCapital);
      }
      if (details.paidUpCapital && details.authorizedCapital && details.paidUpCapital > details.authorizedCapital) {
        fieldErrors.paidUpCapital = 'Paid-up Capital cannot exceed Authorized Capital.';
        errors.push(fieldErrors.paidUpCapital);
      }
      if (!details.numberOfShares || details.numberOfShares <= 0) {
        fieldErrors.numberOfShares = 'Please enter valid Number of Shares.';
        errors.push(fieldErrors.numberOfShares);
      }
      if (!details.faceValuePerShare || details.faceValuePerShare <= 0) {
        fieldErrors.faceValuePerShare = 'Please enter valid Face Value per Share.';
        errors.push(fieldErrors.faceValuePerShare);
      }
    }

    if (step === 6) {
      if (linkedRegistrations?.bankAccount) {
        if (!details.accountNumber?.trim() || !/^\d{6,18}$/.test(details.accountNumber.trim())) {
          fieldErrors.accountNumber = 'Please enter a valid account number.';
          errors.push(fieldErrors.accountNumber);
        }
      }
    }

    return { valid: errors.length === 0, errors, fieldErrors };
  },
};

