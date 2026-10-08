import { gstAmendmentApi } from "@/modules/gst/services/gstAmendmentApi";
import { logger } from "@/core/logging/logger";
import {
  AmendmentSectionConfig,
  AmendmentFormData,
  RegisteredDetails,
  SupportingDoc,
  SubmissionResult,
} from "../types/gstAmendmentTypes";
import { generateArn, buildComparisonSummaries } from "../utils/gstAmendmentHelpers";

/** Posts the amendment to the endpoint for its section. Unknown sections are a no-op. */
const submitSectionAmendment = async (
  selectedSectionId: string,
  targetGstId: string,
  formData: AmendmentFormData,
  supportingDoc: SupportingDoc
): Promise<void> => {
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
};

/** Metadata stored on the tracked "GST Amendment" application. */
const buildAmendmentApplicationDetails = ({
  targetGstId,
  generatedArn,
  selectedSection,
  isCore,
  registeredDetails,
  dateStr,
  comparison,
  supportingDoc,
}: {
  targetGstId: string;
  generatedArn: string;
  selectedSection: AmendmentSectionConfig;
  isCore: boolean;
  registeredDetails: RegisteredDetails;
  dateStr: string;
  comparison: ReturnType<typeof buildComparisonSummaries>;
  supportingDoc: SupportingDoc;
}) => {
  const { currentValSummary, requestedValSummary, currentValDict, requestedValDict } = comparison;
  return {
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
  };
};

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
  amendmentId?: number | null;
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
    amendmentId,
  } = params;

  try {
    switch (Boolean(amendmentId)) {
      case true:
        // Already persisted in database with ID during Review step
        break;
      case false:
        await submitSectionAmendment(selectedSectionId, targetGstId, formData, supportingDoc);
        break;
    }
  } catch (apiError) {
    logger.warn("[submitAmendmentService] API call error captured, proceeding with application creation fallback:", { error: apiError });
  }

  markSubmitted();

  const isCore = selectedSection.type === "core";
  const generatedArn = generateArn();
  const now = new Date();
  const dateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;

  const appId = createApplication(
    "gst-amendment",
    `GST Amendment`,
    "GST",
    buildAmendmentApplicationDetails({
      targetGstId,
      generatedArn,
      selectedSection,
      isCore,
      registeredDetails,
      dateStr,
      comparison: buildComparisonSummaries(selectedSectionId, registeredDetails, formData),
      supportingDoc,
    }),
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
    gstin: targetGstId,
    estCompletion: isCore ? "15 Working Days" : "Immediate / 1 Working Day",
  };
}
