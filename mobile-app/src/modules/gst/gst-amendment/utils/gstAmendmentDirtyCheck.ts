import { AmendmentFormData, AmendmentStep, SupportingDoc } from "../types/gstAmendmentTypes";

export function isFormDataDirty(
  currentStep: AmendmentStep,
  formData: AmendmentFormData,
  supportingDocOrDocs: SupportingDoc | Record<string, SupportingDoc | null> | null
): boolean {
  if (currentStep === "LANDING" || currentStep === "SUCCESS") return false;

  const hasDoc = Boolean(
    supportingDocOrDocs &&
      (typeof supportingDocOrDocs === "object" && "uri" in supportingDocOrDocs
        ? Boolean(supportingDocOrDocs.uri)
        : Object.values(supportingDocOrDocs).some((doc) => Boolean(doc?.uri)))
  );

  return Boolean(
    formData.newLegalBusinessName ||
      formData.newPrincipalAddress ||
      formData.newPrincipalCity ||
      formData.newPrincipalDistrict ||
      formData.newPrincipalState ||
      formData.newPrincipalPincode ||
      formData.newPrincipalNatureOfPremises ||
      formData.newAdditionalAddress ||
      formData.newAdditionalCity ||
      formData.newAdditionalPincode ||
      formData.newAdditionalNatureOfPremises ||
      formData.newBankName ||
      formData.newBankAccountNumber ||
      formData.confirmBankAccountNumber ||
      formData.newIfscCode ||
      formData.newAccountType ||
      formData.newSignatoryName ||
      formData.newSignatoryPan ||
      formData.newSignatoryDob ||
      formData.newSignatoryDesignation ||
      formData.newSignatoryMobile ||
      formData.newSignatoryEmail ||
      formData.newContactMobile ||
      formData.newContactEmail ||
      hasDoc
  );
}
