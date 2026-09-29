import { AmendmentFormData, RegisteredDetails } from "../types/gstAmendmentTypes";

export function resolveTargetGstId(
  gstin: string,
  customer: any,
  gstDraft: any,
  applications: any[]
): string {
  return (
    gstin ||
    customer?.gstId ||
    gstDraft?.createdGstId ||
    applications.find((a) => a.formData?.createdGstId || a.formData?.gstId || a.formData?.gstin)?.formData?.createdGstId ||
    applications.find((a) => a.formData?.createdGstId || a.formData?.gstId || a.formData?.gstin)?.formData?.gstId ||
    applications.find((a) => a.formData?.createdGstId || a.formData?.gstId || a.formData?.gstin)?.formData?.gstin ||
    "GST29AAACU9876P1Z5"
  );
}

export function generateArn(): string {
  const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
  return `AA2993${randomSuffix.toString().slice(0, 6)}`;
}

export function buildComparisonSummaries(
  sectionId: string,
  registeredDetails: RegisteredDetails,
  formData: AmendmentFormData
): {
  currentValSummary: string;
  requestedValSummary: string;
  currentValDict: Record<string, string>;
  requestedValDict: Record<string, string>;
} {
  let currentValSummary = "";
  let requestedValSummary = "";
  let currentValDict: Record<string, string> = {};
  let requestedValDict: Record<string, string> = {};

  switch (sectionId) {
    case "legal-name":
      currentValSummary = registeredDetails.legalBusinessName;
      requestedValSummary = formData.newLegalBusinessName;
      currentValDict = { "Legal Business Name": registeredDetails.legalBusinessName };
      requestedValDict = { "Legal Business Name": formData.newLegalBusinessName };
      break;

    case "principal-place":
      currentValSummary = `${registeredDetails.principalAddress}, ${registeredDetails.principalCity}, ${registeredDetails.principalDistrict}, ${registeredDetails.principalState} - ${registeredDetails.principalPincode}`;
      requestedValSummary = `${formData.newPrincipalAddress}, ${formData.newPrincipalCity}, ${formData.newPrincipalDistrict}, ${formData.newPrincipalState} - ${formData.newPrincipalPincode} (${formData.newPrincipalNatureOfPremises})`;
      currentValDict = {
        Address: registeredDetails.principalAddress,
        City: registeredDetails.principalCity,
        District: registeredDetails.principalDistrict,
        State: registeredDetails.principalState,
        "PIN Code": registeredDetails.principalPincode,
      };
      requestedValDict = {
        "Business Address": formData.newPrincipalAddress,
        City: formData.newPrincipalCity,
        District: formData.newPrincipalDistrict,
        "State / UT": formData.newPrincipalState,
        "PIN Code": formData.newPrincipalPincode,
        "Nature of Premises": formData.newPrincipalNatureOfPremises,
      };
      break;

    case "additional-place":
      currentValSummary = `${registeredDetails.additionalAddress}, ${registeredDetails.additionalCity} - ${registeredDetails.additionalPincode} (${registeredDetails.additionalNatureOfPremises})`;
      requestedValSummary = `${formData.newAdditionalAddress}, ${formData.newAdditionalCity} - ${formData.newAdditionalPincode} (${formData.newAdditionalNatureOfPremises})`;
      currentValDict = {
        Address: registeredDetails.additionalAddress,
        City: registeredDetails.additionalCity,
        "PIN Code": registeredDetails.additionalPincode,
        "Nature of Premises": registeredDetails.additionalNatureOfPremises,
      };
      requestedValDict = {
        "Additional Place Address": formData.newAdditionalAddress,
        City: formData.newAdditionalCity,
        "PIN Code": formData.newAdditionalPincode,
        "Nature of Premises": formData.newAdditionalNatureOfPremises,
      };
      break;

    case "bank-accounts":
      currentValSummary = `${registeredDetails.bankName} - A/C: ${registeredDetails.bankAccountNumber}, IFSC: ${registeredDetails.ifscCode}`;
      requestedValSummary = `${formData.newBankName} - A/C: ${formData.newBankAccountNumber}, IFSC: ${formData.newIfscCode}`;
      currentValDict = {
        "Bank Name": registeredDetails.bankName,
        "Account Number": registeredDetails.bankAccountNumber,
        "IFSC Code": registeredDetails.ifscCode,
        "Account Type": registeredDetails.accountType,
      };
      requestedValDict = {
        "Bank Name": formData.newBankName,
        "Account Number": formData.newBankAccountNumber,
        "Confirm Account Number": formData.confirmBankAccountNumber,
        "IFSC Code": formData.newIfscCode,
        "Account Type": formData.newAccountType,
      };
      break;

    case "authorised-signatories":
      currentValSummary = `${registeredDetails.signatoryName} (${registeredDetails.signatoryPan}) - ${registeredDetails.signatoryDesignation}`;
      requestedValSummary = `${formData.newSignatoryName} (${formData.newSignatoryPan}) - ${formData.newSignatoryDesignation}`;
      currentValDict = {
        Name: registeredDetails.signatoryName,
        PAN: registeredDetails.signatoryPan,
        Designation: registeredDetails.signatoryDesignation,
        Mobile: registeredDetails.signatoryMobile,
        Email: registeredDetails.signatoryEmail,
      };
      requestedValDict = {
        "Signatory Name": formData.newSignatoryName,
        "Signatory PAN": formData.newSignatoryPan,
        "Date of Birth": formData.newSignatoryDob,
        Designation: formData.newSignatoryDesignation,
        "Signatory Mobile": formData.newSignatoryMobile,
        "Signatory Email": formData.newSignatoryEmail,
      };
      break;

    case "contact-details":
      currentValSummary = `Mob: ${registeredDetails.contactMobile}, Email: ${registeredDetails.contactEmail}`;
      requestedValSummary = `Mob: ${formData.newContactMobile}, Email: ${formData.newContactEmail}`;
      currentValDict = {
        Mobile: registeredDetails.contactMobile,
        Email: registeredDetails.contactEmail,
      };
      requestedValDict = {
        "Mobile Number": formData.newContactMobile,
        "Email Address": formData.newContactEmail,
      };
      break;
  }

  return {
    currentValSummary,
    requestedValSummary,
    currentValDict,
    requestedValDict,
  };
}
