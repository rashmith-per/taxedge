import AsyncStorage from "@react-native-async-storage/async-storage";
import { AmendmentStep, AmendmentFormData, SupportingDoc } from "../types/gstAmendmentTypes";
import { logger } from "@/core/logging/logger";

interface RestoreDraftParams {
  customerMobile?: string;
  gstAmendmentDraft?: {
    formData?: Record<string, any>;
    step?: string | number;
  } | null;
  paramsGstin?: string;
  paramsSection?: string;
  paramsStep?: string;
  paramsResume?: string;
}

interface RestoredDraftResult {
  savedStep: AmendmentStep | null;
  savedSectionId: string | null;
  restoredGstin: string;
  restoredSectionId: string;
  restoredFormData: Partial<AmendmentFormData>;
  restoredSectionDocs: Record<string, SupportingDoc | null>;
  restoredAmendmentId: number | string | null;
  restoredDbReviewData: any;
  initialStep: AmendmentStep;
}

export async function restoreAmendmentDraftFromStorage({
  customerMobile,
  gstAmendmentDraft,
  paramsGstin,
  paramsSection,
  paramsStep,
  paramsResume,
}: RestoreDraftParams): Promise<RestoredDraftResult> {
  const clean = customerMobile ? String(customerMobile).replace(/\D/g, "") : "";
  let savedData: any = gstAmendmentDraft?.formData || {};
  let savedStep: AmendmentStep | undefined = gstAmendmentDraft?.step as AmendmentStep | undefined;

  if (!savedData.gstin && clean) {
    const draftKey = `@finsolz_draft_${clean}_gst-amendment`;
    try {
      const raw = await AsyncStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        savedData = parsed.formData || {};
        savedStep = parsed.step;
      }
    } catch (err) {
      logger.warn("[restoreAmendmentDraftFromStorage] Error reading draft from storage:", { error: err });
    }
  }

  const hasSavedState = Boolean(savedStep || savedData.gstin || savedData.selectedSectionId);
  const isExplicitResume = Boolean(paramsResume === "true" || paramsStep);
  const targetStep = (paramsStep as AmendmentStep) || savedStep || "EDIT";
  const initialStep: AmendmentStep = (isExplicitResume || hasSavedState) && targetStep !== "SUCCESS" ? targetStep : "LANDING";

  return {
    savedStep: (savedStep as AmendmentStep) || null,
    savedSectionId: savedData.selectedSectionId || null,
    restoredGstin: paramsGstin || savedData.gstin || "",
    restoredSectionId: paramsSection || savedData.selectedSectionId || "legal-name",
    restoredFormData: savedData || {},
    restoredSectionDocs: savedData._sectionDocs || {},
    restoredAmendmentId: savedData.amendmentId || null,
    restoredDbReviewData: savedData.dbReviewData || null,
    initialStep,
  };
}
