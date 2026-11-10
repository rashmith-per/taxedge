import AsyncStorage from "@react-native-async-storage/async-storage";
import { ComplianceFormData } from "@/modules/gst/validation/complianceSchema";
import { addDraftToIndex, removeDraftFromIndex } from "@/shared/hooks/useServiceDraft";
import { logger } from "@/core/logging/logger";

export function getComplianceDraftKey(mobile: string): string {
  return `@finsolz_draft_${mobile}_gst-compliance`;
}

export async function readComplianceDraft(
  mobile: string
): Promise<{ formData: Partial<ComplianceFormData>; step?: number } | null> {
  if (!mobile) return null;
  try {
    const raw = await AsyncStorage.getItem(getComplianceDraftKey(mobile));
    if (raw) {
      const draft = JSON.parse(raw);
      return {
        formData: draft.formData || {},
        step: typeof draft.step === "number" ? draft.step : undefined,
      };
    }
  } catch (err) {
    logger.debug("[readComplianceDraft] Draft read fallback", { error: err });
  }
  return null;
}

export async function saveComplianceDraft(
  mobile: string,
  currentStep: number,
  formData: ComplianceFormData
): Promise<void> {
  if (!mobile) return;
  addDraftToIndex(mobile, "gst-compliance");
  await AsyncStorage.setItem(
    getComplianceDraftKey(mobile),
    JSON.stringify({
      serviceKey: "gst-compliance",
      serviceName: "GST Compliance",
      category: "GST",
      step: currentStep,
      formData,
      updatedAt: new Date().toISOString().split("T")[0],
    })
  );
}

export async function clearComplianceDraft(mobile: string): Promise<void> {
  if (!mobile) return;
  removeDraftFromIndex(mobile, "gst-compliance");
  await AsyncStorage.removeItem(getComplianceDraftKey(mobile));
}
