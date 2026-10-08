import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useNavigation } from "expo-router";
import { toHref } from "@/shared/utils/navigation";

export interface UseUniversalDraftGuardOptions {
  /** Return true if the user has unsaved input/dirty state that should trigger draft confirmation */
  isDirty: () => boolean;
  /** Callback executed when user chooses "Save as Draft & Exit" */
  onSaveDraft: () => void;
  /** Callback executed when user chooses "Discard & Exit" */
  onDiscardDraft: () => void;
  /** Return true if screen is in final success/completed state where user can navigate away freely */
  isSubmitted?: () => boolean;
  /** Optional explicit route to navigate to when discarding, overriding the original back action */
  discardDestination?: string;
  /** Optional explicit route to navigate to when saving draft, overriding the original back action */
  saveDestination?: string;
}

export const useUniversalDraftGuard = ({
  isDirty,
  onSaveDraft,
  onDiscardDraft,
  isSubmitted = () => false,
  discardDestination,
  saveDestination,
}: UseUniversalDraftGuardOptions) => {
  const router = useRouter();
  const navigation = useNavigation();

  const [showDraftModal, setShowDraftModal] = useState(false);
  const pendingNavigationActionRef = useRef<any>(null);
  const hasSubmittedRef = useRef(false);

  // Keep refs in sync with callbacks
  const isDirtyRef = useRef(isDirty);
  const isSubmittedRef = useRef(isSubmitted);
  const onSaveDraftRef = useRef(onSaveDraft);
  const onDiscardDraftRef = useRef(onDiscardDraft);
  const discardDestinationRef = useRef(discardDestination);
  const saveDestinationRef = useRef(saveDestination);

  useEffect(() => {
    isDirtyRef.current = isDirty;
    isSubmittedRef.current = isSubmitted;
    onSaveDraftRef.current = onSaveDraft;
    onDiscardDraftRef.current = onDiscardDraft;
    discardDestinationRef.current = discardDestination;
    saveDestinationRef.current = saveDestination;
  });

  const markSubmitted = useCallback(() => {
    hasSubmittedRef.current = true;
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // If already submitted or final step reached, allow free navigation
      if (hasSubmittedRef.current || isSubmittedRef.current()) {
        return;
      }

      // Check if user has entered data
      if (!isDirtyRef.current()) {
        return;
      }

      // Intercept navigation & open draft modal
      e.preventDefault();
      pendingNavigationActionRef.current = e.data.action;
      setShowDraftModal(true);
    });

    return unsubscribe;
  }, [navigation]);

  const handleSaveAndExit = useCallback(() => {
    onSaveDraftRef.current();
    setShowDraftModal(false);
    hasSubmittedRef.current = true;

    if (saveDestinationRef.current) {
      router.replace(toHref(saveDestinationRef.current));
    } else if (pendingNavigationActionRef.current) {
      navigation.dispatch(pendingNavigationActionRef.current);
    } else {
      router.back();
    }
  }, [navigation, router]);

  const handleDiscardAndExit = useCallback(() => {
    onDiscardDraftRef.current();
    setShowDraftModal(false);
    hasSubmittedRef.current = true;

    if (discardDestinationRef.current) {
      router.replace(toHref(discardDestinationRef.current));
    } else if (pendingNavigationActionRef.current) {
      navigation.dispatch(pendingNavigationActionRef.current);
    } else {
      router.back();
    }
  }, [navigation, router]);

  const handleCancel = useCallback(() => {
    setShowDraftModal(false);
    pendingNavigationActionRef.current = null;
  }, []);

  const openDraftModal = useCallback(() => {
    setShowDraftModal(true);
  }, []);

  return {
    showDraftModal,
    openDraftModal,
    markSubmitted,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
  };
};
