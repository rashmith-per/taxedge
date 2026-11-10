import { Alert } from "react-native";
import { AmendmentFormData, SupportingDoc } from "../types/gstAmendmentTypes";
import { validateSectionForm } from "../utils/gstAmendmentValidation";
import { persistAmendmentForReview } from "../services/persistAmendmentForReview";
import { getErrorMessage } from "@/core/error-handling/errorMessage";
import { logger } from "@/core/logging/logger";

interface ReviewActionParams {
  selectedSectionId: string;
  formData: AmendmentFormData;
  supportingDoc: SupportingDoc | null;
  isEditMode: boolean;
  amendmentId: number | string | null;
  targetGstId: string | null;
  setAmendmentId: (id: number | string | null) => void;
  setDbReviewData: (data: any) => void;
}

export async function processAmendmentReview({
  selectedSectionId,
  formData,
  supportingDoc,
  isEditMode,
  amendmentId,
  targetGstId,
  setAmendmentId,
  setDbReviewData,
}: ReviewActionParams): Promise<{ success: boolean; validationErrors?: Record<string, string> }> {
  const { isValid, errors: validationErrs } = validateSectionForm(
    selectedSectionId,
    formData,
    supportingDoc
  );

  if (!isValid) {
    Alert.alert(
      "Required Information",
      "Please fill in the required amendment details and attach supporting proof."
    );
    return { success: false, validationErrors: validationErrs };
  }

  try {
    await persistAmendmentForReview(
      {
        isEditMode,
        amendmentId,
        sectionId: selectedSectionId,
        targetGstId: targetGstId ?? "",
        formData,
        supportingDoc,
      },
      { onSaved: setAmendmentId, onReviewData: setDbReviewData }
    );
    return { success: true };
  } catch (err) {
    logger.error("[processAmendmentReview] Error saving/updating amendment record:", { error: err });
    Alert.alert(
      "Save Failed",
      getErrorMessage(err) || "Failed to save amendment record. Please try again."
    );
    throw err;
  }
}
