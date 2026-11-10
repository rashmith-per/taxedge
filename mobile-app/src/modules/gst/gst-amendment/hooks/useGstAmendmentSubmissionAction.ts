import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { removeDraftFromIndex } from "@/shared/hooks/useServiceDraft";
import { verifyFileAccessible } from "../utils/gstDocumentPersistence";
import { submitAmendmentService } from "../services/submitAmendmentService";
import { getErrorMessage } from "@/core/error-handling/errorMessage";
import { logger } from "@/core/logging/logger";
import {
  AmendmentFormData,
  SupportingDoc,
  AmendmentSectionConfig,
  RegisteredDetails,
  SubmissionResult,
} from "../types/gstAmendmentTypes";

interface SubmitActionParams {
  declared: boolean;
  supportingDoc: SupportingDoc | null;
  selectedSectionId: string;
  targetGstId: string | null;
  formData: AmendmentFormData;
  selectedSection: AmendmentSectionConfig;
  registeredDetails: RegisteredDetails;
  createApplication: any;
  addNotification: any;
  markSubmitted: () => void;
  amendmentId: number | string | null;
  clearGstAmendmentDraft: () => void;
  customerMobile?: string;
}

export async function executeAmendmentSubmission({
  declared,
  supportingDoc,
  selectedSectionId,
  targetGstId,
  formData,
  selectedSection,
  registeredDetails,
  createApplication,
  addNotification,
  markSubmitted,
  amendmentId,
  clearGstAmendmentDraft,
  customerMobile,
}: SubmitActionParams): Promise<SubmissionResult | null> {
  if (!declared) {
    Alert.alert(
      "Declaration Required",
      "Please tick the declaration checkbox to authorise Finsolz to file your amendment."
    );
    return null;
  }

  if (!supportingDoc || !supportingDoc.uri) {
    Alert.alert(
      "Supporting Proof Required",
      "Please attach a supporting proof document before submitting your amendment."
    );
    return null;
  }

  // Live FileSystem accessibility check immediately before submission
  try {
    const isAccessible = await verifyFileAccessible(supportingDoc.uri);
    if (!isAccessible) {
      Alert.alert(
        "Document Unavailable",
        "The attached proof file is no longer accessible on this device. Please re-attach the document before submitting."
      );
      return null;
    }
  } catch (fsErr) {
    logger.warn("[executeAmendmentSubmission] FileSystem check error, proceeding with cautious submission:", { error: fsErr });
  }

  try {
    const result = await submitAmendmentService({
      selectedSectionId,
      targetGstId: targetGstId ?? "",
      formData,
      supportingDoc,
      selectedSection,
      registeredDetails,
      createApplication,
      addNotification,
      markSubmitted,
      amendmentId,
    });

    clearGstAmendmentDraft();

    const cleanMobile = customerMobile ? String(customerMobile).replace(/\D/g, "") : "";
    if (cleanMobile) {
      removeDraftFromIndex(cleanMobile, "gst-amendment");
      AsyncStorage.removeItem(`@finsolz_draft_${cleanMobile}_gst-amendment`).catch((e) => {
        logger.debug("[executeAmendmentSubmission] Failed to remove draft key", { error: e });
      });
    }

    return result;
  } catch (error) {
    logger.error("[executeAmendmentSubmission] Amendment Submission Error:", { error });
    Alert.alert(
      "Submission Failed",
      getErrorMessage(error) || "Failed to submit amendment. Please check your network connection and try again."
    );
    throw error;
  }
}
