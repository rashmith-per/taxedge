import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LoanDraftStorageKey } from "../constants/loanDraftKeys";
import { logger } from "@/core/logging/logger";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

/** A draft as persisted: the screen's data plus the time it was saved. */
export type StoredLoanDraft<TDraft extends object> = TDraft & { savedAt: string };

export interface LoanDraftStorage<TDraft extends object> {
  saveDraft: (draft: TDraft) => Promise<void>;
  loadDraft: () => Promise<StoredLoanDraft<TDraft> | null>;
  clearDraft: () => Promise<void>;
  hasDraft: () => Promise<boolean>;
}

/**
 * Standard loan draft persistence:
 * JSON of `{ ...draft, savedAt }` under a fixed key with graceful degradation.
 */
export function createLoanDraftStorage<TDraft extends object>(
  storageKey: LoanDraftStorageKey
): LoanDraftStorage<TDraft> {
  return {
    saveDraft: async (draft) => {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify({ ...draft, savedAt: new Date().toISOString() }));
      } catch (err) {
        logger.warn("[LoanDraftStorage] Failed to save draft", { storageKey, error: getErrorMessage(err) });
      }
    },

    loadDraft: async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (!raw) return null;
        // Trust boundary: the stored JSON was written by `saveDraft` for this key.
        const draft: StoredLoanDraft<TDraft> = JSON.parse(raw);
        return draft;
      } catch (err) {
        logger.warn("[LoanDraftStorage] Failed to load draft", { storageKey, error: getErrorMessage(err) });
        return null;
      }
    },

    clearDraft: async () => {
      try {
        await AsyncStorage.removeItem(storageKey);
      } catch (err) {
        logger.warn("[LoanDraftStorage] Failed to clear draft", { storageKey, error: getErrorMessage(err) });
      }
    },

    hasDraft: async () => {
      try {
        return Boolean(await AsyncStorage.getItem(storageKey));
      } catch (err) {
        logger.warn("[LoanDraftStorage] Failed to check draft existence", { storageKey, error: getErrorMessage(err) });
        return false;
      }
    },
  };
}

