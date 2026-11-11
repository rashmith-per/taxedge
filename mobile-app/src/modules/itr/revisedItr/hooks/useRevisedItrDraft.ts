import { useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { useApplicationStore } from "@/store/applicationStore";
import { getActiveCustomerMobile } from "@/store/applicationStorage";
import { useRevisedProgressStore } from "../store/revisedProgressStore";

export interface UseRevisedItrDraftOptions {
  step: number;
  acknowledgementNumber?: string;
  assessmentYear?: string;
  isEditing?: boolean;
}

export function useRevisedItrDraft({
  step,
  acknowledgementNumber,
  assessmentYear,
  isEditing = false,
}: UseRevisedItrDraftOptions) {
  const isSubmitted = useRevisedProgressStore((s) => s.isSubmitted);
  const resetStore = useRevisedProgressStore((s) => s.reset);
  const saveRevisedItrDraft = useApplicationStore((s) => s.saveRevisedItrDraft);
  const clearRevisedItrDraft = useApplicationStore((s) => s.clearRevisedItrDraft);

  const isDirty = useCallback(() => {
    if (isSubmitted) return false;
    const store = useRevisedProgressStore.getState();
    const hasAck = Boolean(acknowledgementNumber?.trim());
    const hasAy = Boolean(assessmentYear?.trim());
    const hasReason = Boolean(store.revisionReason);
    const hasForm = Boolean(
      store.formData &&
        Object.values(store.formData).some((v) => typeof v === "string" && v.trim().length > 0)
    );
    const hasDocs = Boolean(
      store.documents &&
        store.documents.some((d) => Boolean(d.fileUri || d.status === "uploaded"))
    );
    const hasBackend = Boolean(store.revisedItrId);

    return hasAck || hasAy || hasReason || hasForm || hasDocs || hasBackend;
  }, [acknowledgementNumber, assessmentYear, isSubmitted]);

  const onSaveDraft = useCallback(async () => {
    const store = useRevisedProgressStore.getState();
    const draftPayload = {
      step,
      acknowledgementNumber: acknowledgementNumber || undefined,
      assessmentYear: assessmentYear || undefined,
      revisionReason: store.revisionReason || undefined,
      formData: store.formData ? { ...store.formData } : undefined,
      documents: store.documents ? [...store.documents] : undefined,
      revisedItrId: store.revisedItrId,
      revisionReasonId: store.revisionReasonId,
      detailsId: store.detailsId,
      documentId: store.documentId,
      maxStepReached: Math.max(store.maxStepReached, step),
      updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    saveRevisedItrDraft({
      id: "revised-itr-draft",
      step,
      formData: draftPayload as unknown as Record<string, unknown>,
      updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });

    const mobile = getActiveCustomerMobile();
    try {
      await AsyncStorage.setItem(
        `@finsolz_draft_${mobile}_revised-itr`,
        JSON.stringify(draftPayload)
      );
    } catch {
      // Storage write error ignored
    }
  }, [step, acknowledgementNumber, assessmentYear, saveRevisedItrDraft]);

  const onDiscardDraft = useCallback(async () => {
    clearRevisedItrDraft();
    const mobile = getActiveCustomerMobile();
    try {
      await AsyncStorage.removeItem(`@finsolz_draft_${mobile}_revised-itr`);
    } catch {
      // Ignore
    }
    resetStore();
  }, [clearRevisedItrDraft, resetStore]);

  const draftGuard = useUniversalDraftGuard({
    isDirty,
    onSaveDraft,
    onDiscardDraft,
    isSubmitted: () => isSubmitted,
  });

  return {
    ...draftGuard,
    clearRevisedItrDraft,
  };
}

/**
 * Restores saved draft on initial mount of the Revised ITR flow.
 */
export function useRevisedItrDraftRestore(
  enabled: boolean,
  onRestore: (draft: { acknowledgementNumber?: string; assessmentYear?: string }) => void
) {
  useEffect(() => {
    if (!enabled) return;

    const restore = async () => {
      const state = useRevisedProgressStore.getState();
      if (state.revisedItrId || state.revisionReason || state.formData) return;

      const zustandDraft = useApplicationStore.getState().revisedItrDraft;
      let draftData: any = zustandDraft?.formData;
      if (!draftData) {
        const mobile = getActiveCustomerMobile();
        try {
          const raw = await AsyncStorage.getItem(`@finsolz_draft_${mobile}_revised-itr`);
          if (raw) {
            const parsed = JSON.parse(raw);
            draftData = parsed.formData || parsed;
          }
        } catch {
          // Ignore parse errors
        }
      }

      if (draftData) {
        if (draftData.revisionReason) {
          state.setRevisionReason(draftData.revisionReason);
        }
        if (draftData.formData) {
          state.setFormData(draftData.formData);
        }
        if (draftData.documents) {
          state.setDocuments(draftData.documents);
        }
        state.setBackendIds({
          revisedItrId: draftData.revisedItrId,
          revisionReasonId: draftData.revisionReasonId,
          detailsId: draftData.detailsId,
          documentId: draftData.documentId,
        });
        if (draftData.step) {
          state.setMaxStepReached(draftData.step);
        }
        onRestore({
          acknowledgementNumber: draftData.acknowledgementNumber,
          assessmentYear: draftData.assessmentYear,
        });
      }
    };

    restore();
  }, [enabled, onRestore]);
}
