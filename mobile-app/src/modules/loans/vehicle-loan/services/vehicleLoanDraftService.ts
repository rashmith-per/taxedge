import AsyncStorage from "@react-native-async-storage/async-storage";
import { VehicleLoanDraftData } from "../types/vehicleLoan.types";
import { logger } from "@/core/logging/logger";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

export type { VehicleLoanDraftData };

const VEHICLE_LOAN_DRAFT_KEY = "@taxedge_vehicle_loan_draft_v1";

export const vehicleLoanDraftService = {
  saveDraft: async (draft: VehicleLoanDraftData): Promise<void> => {
    try {
      await AsyncStorage.setItem(
        VEHICLE_LOAN_DRAFT_KEY,
        JSON.stringify({ ...draft, savedAt: new Date().toISOString() })
      );
    } catch (err) {
      logger.warn("[VehicleLoanDraftService] Failed to save draft", { error: getErrorMessage(err) });
    }
  },

  loadDraft: async (): Promise<VehicleLoanDraftData | null> => {
    try {
      const raw = await AsyncStorage.getItem(VEHICLE_LOAN_DRAFT_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as VehicleLoanDraftData;
    } catch (err) {
      logger.warn("[VehicleLoanDraftService] Failed to load draft", { error: getErrorMessage(err) });
      return null;
    }
  },

  clearDraft: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(VEHICLE_LOAN_DRAFT_KEY);
    } catch (err) {
      logger.warn("[VehicleLoanDraftService] Failed to clear draft", { error: getErrorMessage(err) });
    }
  },

  hasDraft: async (): Promise<boolean> => {
    try {
      const raw = await AsyncStorage.getItem(VEHICLE_LOAN_DRAFT_KEY);
      return Boolean(raw);
    } catch (err) {
      logger.warn("[VehicleLoanDraftService] Failed to check draft existence", { error: getErrorMessage(err) });
      return false;
    }
  },
};

