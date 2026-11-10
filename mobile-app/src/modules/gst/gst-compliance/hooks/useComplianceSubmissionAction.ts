import { Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ComplianceFormData } from "@/modules/gst/validation/complianceSchema";
import { submitComplianceRequest, SubmissionResult } from "@/modules/gst/services/gstComplianceService";
import { removeDraftFromIndex } from "@/shared/hooks/useServiceDraft";
import { logger } from "@/core/logging/logger";

interface SubmitComplianceParams {
  formData: ComplianceFormData;
  complianceId: string | null;
  router: ReturnType<typeof useRouter>;
  cleanMobile: string;
  getDraftKey: (mobile: string) => string;
  markSubmitted: () => void;
  onRetry: () => void;
}

export async function executeComplianceSubmission({
  formData,
  complianceId,
  router,
  cleanMobile,
  getDraftKey,
  markSubmitted,
  onRetry,
}: SubmitComplianceParams): Promise<boolean> {
  try {
    const result: SubmissionResult = await submitComplianceRequest(formData, complianceId);

    if (result.success) {
      markSubmitted();
      if (cleanMobile) {
        removeDraftFromIndex(cleanMobile, "gst-compliance");
        AsyncStorage.removeItem(getDraftKey(cleanMobile)).catch((e) => {
          logger.debug("[executeComplianceSubmission] Failed to remove draft key", { error: e });
        });
      }

      router.replace({
        pathname: "/service/gst-compliance-success",
        params: {
          referenceId: result.referenceId,
          requestType: formData.requestType,
          gstin: formData.gstin,
          submittedAt: result.submittedAt,
          estimatedResponse: result.estimatedResponse,
        },
      });
      return true;
    } else {
      Alert.alert(
        "Submission Failed",
        result.error || "Unable to submit your request. Please check your connection and retry.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Retry", onPress: onRetry },
        ]
      );
      return false;
    }
  } catch (err) {
    logger.warn("[executeComplianceSubmission] Network/submission failure", { error: err });
    Alert.alert(
      "Network Error",
      "Could not communicate with the server. Please verify your internet connection.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Retry", onPress: onRetry },
      ]
    );
    return false;
  }
}
