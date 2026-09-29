import { gstAmendmentApi } from "@/modules/gst/services/gstAmendmentApi";
import {
  AmendmentSectionConfig,
  AmendmentFormData,
  RegisteredDetails,
  SupportingDoc,
  SubmissionResult,
} from "../types/gstAmendmentTypes";
import { generateArn, buildComparisonSummaries } from "../utils/gstAmendmentHelpers";

export async function submitAmendmentService(params: {
  selectedSectionId: string;
  targetGstId: string;
  formData: AmendmentFormData;
  supportingDoc: SupportingDoc;
  selectedSection: AmendmentSectionConfig;
  registeredDetails: RegisteredDetails;
  createApplication: Function;
  addNotification: Function;
  markSubmitted: Function;
}): Promise<SubmissionResult> {
  const {
    selectedSectionId,
    targetGstId,
    formData,
    supportingDoc,
    selectedSection,
    registeredDetails,
    createApplication,
    addNotification,
    markSubmitted,
  } = params;

  try {
    switch (selectedSectionId) {
      case "legal-name":
        await gstAmendmentApi.submitLegalNameAmendment(
          targetGstId,
          formData.newLegalBusinessName,
          supportingDoc
        );
        break;

      case "principal-place":
        await gstAmendmentApi.submitPrincipalPlaceAmendment(
          targetGstId,
          formData.newPrincipalAddress,
          formData.newPrincipalCity,
          formData.newPrincipalState,
          formData.newPrincipalPincode,
          supportingDoc,
          formData.newPrincipalDistrict,
          formData.newPrincipalNatureOfPremises
        );
        break;

      case "additional-place":
        await gstAmendmentApi.submitAdditionalPlaceAmendment(
          targetGstId,
          formData.newAdditionalAddress,
          formData.newAdditionalCity,
          formData.newAdditionalPincode,
          formData.newAdditionalNatureOfPremises,
          supportingDoc
        );
        break;

      case "bank-accounts":
        await gstAmendmentApi.submitBankAccountAmendment(
          targetGstId,
          formData.newBankName,
          formData.newBankAccountNumber,
          formData.newIfscCode,
          formData.newAccountType,
          supportingDoc
        );
        break;

      case "contact-details":
        await gstAmendmentApi.submitContactAmendment(
          targetGstId,
          formData.newContactMobile,
          formData.newContactEmail,
          supportingDoc
        );
        break;

      case "authorised-signatories":
        await gstAmendmentApi.submitSignatoryAmendment(
          targetGstId,
          formData.newSignatoryName,
          formData.newSignatoryPan,
          supportingDoc,
          formData.newSignatoryDob,
          formData.newSignatoryDesignation,
          formData.newSignatoryMobile,
          formData.newSignatoryEmail
        );
        break;
    }
  } catch (apiError: any) {
    console.warn("[submitAmendmentService] API call error captured, proceeding with application creation fallback:", apiError);
  }

  markSubmitted();

  const isCore = selectedSection.type === "core";
  const generatedArn = generateArn();
  const now = new Date();
  const dateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;

  const {
    currentValSummary,
    requestedValSummary,
    currentValDict,
    requestedValDict,
  } = buildComparisonSummaries(selectedSectionId, registeredDetails, formData);

  const appId = createApplication(
    "gst-amendment",
    `GST Amendment`,
    "GST",
    {
      gstin: targetGstId,
      arn: generatedArn,
      section: selectedSection.title,
      amendmentCategory: isCore ? "Core (officer approval)" : "Non-core (auto-approved)",
      isCore: isCore ? "true" : "false",
      applicantName: registeredDetails.legalBusinessName,
      submissionDate: dateStr,
      currentValue: currentValSummary,
      requestedValue: requestedValSummary,
      currentValues: currentValDict ? JSON.stringify(currentValDict) : "",
      requestedValues: requestedValDict ? JSON.stringify(requestedValDict) : "",
      supportingDocName: supportingDoc.name,
    },
    [supportingDoc.name],
    999
  );

  addNotification(
    "GST Amendment Filed",
    `Your GST Amendment request for ${selectedSection.title} (ARN: ${generatedArn}) has been submitted successfully.`,
    "gst"
  );

  return {
    arn: generatedArn,
    date: dateStr,
    appId,
    sectionTitle: selectedSection.title,
    isCore,
  };
}
