import {
  BUSINESS_TYPES,
  NATURE_OF_BUSINESS,
  REASONS,
  COMPOSITION_OPTIONS,
  PLACE_OPTIONS,
  ACCOUNT_TYPES,
  type BusinessType,
  type NatureOfBusiness,
  type ReasonForRegistration,
  type CompositionOption,
  type PlaceOption,
  type AccountType,
} from "../constants/gstOptionConstants";

export {
  BUSINESS_TYPES,
  NATURE_OF_BUSINESS,
  REASONS,
  COMPOSITION_OPTIONS,
  PLACE_OPTIONS,
  ACCOUNT_TYPES,
  type BusinessType,
  type NatureOfBusiness,
  type ReasonForRegistration,
  type CompositionOption,
  type PlaceOption,
  type AccountType,
};

export interface GstBusinessFormData {
  gstId?: string;
  customerId?: string;
  legalName: string;
  businessName: string;
  businessType: string;
  natureOfBusiness: string;
  placeOfBusiness: string;
  businessStartDate: string;
  reasonForRegistration: string;
  compositionScheme: string;
  businessAddress: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  hsnCode: string;
  accountHolderName: string;
  bankAccountNumber: string;
  confirmBankAccountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  accountType: string;
  signatoryName: string;
  signatoryPan: string;
  signatoryDob: string;
  signatoryDesignation: string;
  signatoryMobile: string;
  signatoryEmail: string;
  addressProofType: string;
  aadhaarConsent: boolean;
  businessPan: string;
}

export type FormErrors = Partial<Record<keyof GstBusinessFormData, string>>;
