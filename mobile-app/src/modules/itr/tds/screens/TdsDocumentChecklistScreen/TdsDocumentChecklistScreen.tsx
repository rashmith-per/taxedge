import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTdsProgressStore } from "../../store/tdsProgressStore";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  BackHandler,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TdsDocumentItem, DocumentUploadPayload } from "../../types/tdsDocuments.types";
import { INITIAL_TDS_DOCUMENTS } from "../../constants/tdsDocuments.constants";
import {
  TdsDocumentHeader,
  TdsUploadProgressBar,
  TdsDocumentCard,
} from "../../components/documents";
import { useApplicationStore } from "@/store/applicationStore";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { authStorage } from "@/modules/authentication/services/authStorage";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { tdsApiService } from "../../services/tdsApiService";
import { tdsDraftService } from "../../services/tdsDraftService";
import {
  styles,
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
  getBottomBarInsetsStyle,
} from "./TdsDocumentChecklistScreen.styles";

export const TdsDocumentChecklistScreen: React.FC = () => {
  const router = useRouter();
  const { isEditing: isEditingParam } = useLocalSearchParams<{ isEditing?: string }>();
  const isEditingFromEstimate = isEditingParam === "true";
  const maxStepReached = useTdsProgressStore((s: any) => s.maxStepReached);
  const insets = useSafeAreaInsets();
  const [isSaving, setIsSaving] = useState(false);

  const tdsDraft = useApplicationStore((state) => state.tdsDraft);
  const saveTdsDraft = useApplicationStore((state) => state.saveTdsDraft);

  // Initialize checklist items from draft store or fallback default constants
  const [documents, setDocuments] = useState<TdsDocumentItem[]>(() => {
    const draft = tdsDraft as any;
    if (draft && draft.documents && Array.isArray(draft.documents) && draft.documents.length > 0) {
      const savedMap = new Map(draft.documents.map((d: any) => [d.id, d]));
      return INITIAL_TDS_DOCUMENTS.map((doc: any) => {
        const saved = savedMap.get(doc.id) as any;
        if (saved && (saved.fileUri || saved.status === "uploaded")) {
          return {
            ...doc,
            status: "uploaded" as const,
            fileUri: saved.fileUri,
            fileName: saved.fileName,
            fileSize: saved.fileSize,
            mimeType: saved.mimeType,
            fileTypeLabel: saved.fileTypeLabel,
          };
        }
        return doc;
      });
    }
    return INITIAL_TDS_DOCUMENTS;
  });

  // Restore existing documents from backend on mount
  useEffect(() => {
    async function loadBackendDocuments() {
      try {
        const tdsRefundId = await tdsDraftService.getApplicationId();
        if (tdsRefundId) {
          const backendDocs = await tdsApiService.fetchAndMapDocumentsList(tdsRefundId, documents);
          const hasBackendUploaded = backendDocs.some((d: any) => d.status === 'uploaded' || d.status === 'verified');
          if (hasBackendUploaded) {
            setDocuments(backendDocs);
          }
        }
      } catch (err) {
        console.warn("[TDS Docs Screen] Error fetching backend documents:", err);
      }
    }
    loadBackendDocuments();
  }, []);

  // Universal Draft Guard Hook for page exit
  // BUG_B24_002: destructure openDraftModal (shows modal) and handleSaveAndExit separately —
  // the back button must open the modal; the modal's Save button calls handleSaveAndExit
  // Newest documents, so Save as Draft stores what is on screen and not a stale closure.
  const documentsRef = useRef(documents);
  documentsRef.current = documents;

  // The local draft is written first and must succeed. The server copy is best effort and waits at
  // most a few seconds, so a slow or offline network can never trap the user on this screen; the
  // documents stay in the local draft and are restored when the application is reopened.
  const persistDraftOnBack = async () => {
    const latestDocs = documentsRef.current;
    const localForm = await tdsDraftService.getFormDraft();
    // Editing from Review resumes at Review; a first visit resumes at the checklist.
    const resumeStep = isEditingFromEstimate ? "ESTIMATE" : "DOCUMENTS";
    if (!(await tdsDraftService.saveFormDraft(localForm, resumeStep))) {
      throw new Error("Could not write the TDS form draft");
    }
    if (!(await tdsDraftService.saveDocumentsDraft(latestDocs))) {
      throw new Error("Could not write the TDS documents draft");
    }
    saveTdsDraft?.({
      formData: localForm as any,
      documents: latestDocs as any,
      step: resumeStep,
      updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    const serverSync = (async () => {
      const tdsRefundId = await getOrFetchRefundId();
      if (tdsRefundId) await tdsApiService.saveDocuments(latestDocs, tdsRefundId);
    })().catch((err) => {
      console.warn("[TDS Docs Screen] Draft save to backend warning:", err);
    });
    await Promise.race([serverSync, new Promise((resolve) => setTimeout(resolve, 4000))]);
  };

  const isDirty = useCallback(
    () =>
      !useTdsProgressStore.getState().isSubmitted &&
      documents.some((d: any) => Boolean(d.fileUri || d.status === "uploaded")),
    [documents]
  );

  // Universal Draft Guard: Back (header, Android hardware Back, back gesture) asks to save the draft.
  const {
    showDraftModal,
    openDraftModal,
    markSubmitted,
    handleSaveAndExit,
    handleDiscardAndExit: discardDraft,
    handleCancel: cancelExit,
  } = useUniversalDraftGuard({
    isDirty,
    onSaveDraft: async () => {
      try {
        await persistDraftOnBack();
      } catch (err) {
        console.warn("[TDS Docs Screen] Saving draft failed:", err);
        Alert.alert("Could not save your progress", "Your changes could not be saved as a draft. Please try again.");
        throw err; // keeps the prompt open so nothing is lost silently
      }
    },
    onDiscardDraft: async () => {
      // Discarding an edit from Review only abandons the edit. The saved application stays.
      if (!isEditingFromEstimate) await tdsDraftService.clearDraft();
    },
    isSubmitted: () => useTdsProgressStore.getState().isSubmitted,
  });

  // Functional count of uploaded documents - zero loops
  const uploadedCount = documents.filter(
    (d: any) => d.status === "uploaded" || !!d.fileUri
  ).length;
  const totalCount = documents.length;

  const mandatoryDocs = documents.filter((d: any) => d.isMandatory);
  const isMandatoryComplete = mandatoryDocs.every(
    (d: any) => d.status === "uploaded" || !!d.fileUri
  );

  const getOrFetchRefundId = async (): Promise<string | null> => {
    let appId = await tdsDraftService.getApplicationId();
    if (!appId) {
      const activeMobile =
        useAuthStore.getState().customer?.mobile ||
        authStorage.getSession().activeMobile ||
        useAuthStore.getState().mobileNumber ||
        "";
      const cleanMob = activeMobile ? String(activeMobile).replace(/\D/g, "").slice(-10) : "";
      if (cleanMob) {
        const bank = await tdsApiService.getBankAccountByCustId(cleanMob);
        if (bank && bank.id) {
          appId = bank.id;
          await tdsDraftService.saveApplicationId(appId);
        } else {
          appId = `REFUND-${cleanMob}`;
        }
      }
    }
    return appId;
  };

  const handleUploadSuccess = async (id: string, payload: DocumentUploadPayload) => {
    const updated = documents.map((doc: any) =>
      doc.id === id
        ? {
            ...doc,
            status: "uploaded" as const,
            fileUri: payload.uri,
            fileName: payload.name,
            fileSize: payload.size,
            mimeType: payload.mimeType,
            fileTypeLabel: payload.fileTypeLabel,
            errorMessage: undefined,
          }
        : doc
    );
    setDocuments(updated);

    // Immediately persist uploaded documents to draft store
    saveTdsDraft?.({
      formData: tdsDraft?.formData || {},
      documents: updated as any,
      step: "DOCUMENTS",
      updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    await tdsDraftService.saveDocumentsDraft(updated);

    // Sync uploaded document to backend database
    try {
      const tdsRefundId = await getOrFetchRefundId();
      if (tdsRefundId) {
        await tdsApiService.saveDocuments(updated, tdsRefundId);
      }
    } catch (err) {
      console.warn("[TDS Docs Screen] Backend document upload save warning:", err);
    }
  };

  const handleUploadError = (id: string, errorMessage: string) => {
    setDocuments((prev: any) =>
      prev.map((doc: any) =>
        doc.id === id
          ? {
              ...doc,
              status: "not_uploaded",
              errorMessage,
            }
          : doc
      )
    );
  };

  const handleRemove = async (id: string) => {
    const updated = documents.map((doc: any) =>
      doc.id === id
        ? {
            ...doc,
            status: "not_uploaded" as const,
            fileUri: undefined,
            fileName: undefined,
            fileSize: undefined,
            mimeType: undefined,
            fileTypeLabel: undefined,
            errorMessage: undefined,
          }
        : doc
    );
    setDocuments(updated);

    // Immediately persist document removal to draft store
    saveTdsDraft?.({
      formData: tdsDraft?.formData || {},
      documents: updated as any,
      step: "DOCUMENTS",
      updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    await tdsDraftService.saveDocumentsDraft(updated);

    // Sync updated list to backend database
    try {
      const tdsRefundId = await getOrFetchRefundId();
      if (tdsRefundId) {
        await tdsApiService.saveDocuments(updated, tdsRefundId);
      }
    } catch (err) {
      console.warn("[TDS Docs Screen] Backend document removal sync warning:", err);
    }
  };

  const handleContinue = async () => {
    if (!isMandatoryComplete) {
      Alert.alert("Missing Documents", "Please upload all mandatory documents to proceed.");
      // Mark missing mandatory documents with inline card errors functionally - zero loops
      setDocuments((prev: any) =>
        prev.map((doc: any) =>
          doc.isMandatory && !doc.fileUri && doc.status !== "uploaded"
            ? {
                ...doc,
                errorMessage: "This required document must be uploaded to proceed",
              }
            : doc
        )
      );
      return;
    }

    setIsSaving(true);
    // Save state into backend database & draft store
    try {
      const tdsRefundId = await getOrFetchRefundId();
      if (tdsRefundId) {
        console.log("🚀 [TDS Docs] Explicitly saving documents before review for refund ID:", tdsRefundId);
        const res = await tdsApiService.saveDocuments(documents, tdsRefundId);
        console.log("✅ [TDS Docs] Backend document save response:", res);
      }
    } catch (err: any) {
      console.warn("[TDS Docs Screen] Backend save before estimate warning:", err?.message || err);
    } finally {
      setIsSaving(false);
    }

    saveTdsDraft?.({
      formData: tdsDraft?.formData || {},
      documents: documents as any,
      step: "ESTIMATE",
      updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    await tdsDraftService.saveDocumentsDraft(documents);

    // Navigate to next screen: return to estimate when editing, push when first-time
    if (isEditingFromEstimate) {
      markSubmitted();
      router.back();
    } else {
      router.push("/service/tds-estimate" as any);
    }
  };

  const handleBackPress = useCallback(() => {
    if (isDirty()) {
      openDraftModal();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/service/itr" as any);
    }
  }, [isDirty, openDraftModal, router]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isDirty()) {
          openDraftModal();
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => sub.remove();
    }, [isDirty, openDraftModal])
  );

  const containerInsetsStyle = getContainerInsetsStyle(insets.top);
  const scrollContentInsetsStyle = getScrollContentInsetsStyle(insets.bottom);
  const bottomBarInsetsStyle = getBottomBarInsetsStyle(insets.bottom);

  return (
    <View style={[styles.container, containerInsetsStyle]}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header with back guard */}
      <TdsDocumentHeader onBack={handleBackPress} hideBack={isEditingFromEstimate} />

      {/* Main Scrollable Content */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, scrollContentInsetsStyle]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Bar Header */}
        <TdsUploadProgressBar
          uploadedCount={uploadedCount}
          totalCount={totalCount}
        />

        {/* 9 Document Cards with inline field validation - zero loops */}
        {documents.map((doc: any) => (
          <TdsDocumentCard
            key={doc.id}
            item={doc}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            onRemove={handleRemove}
          />
        ))}
      </ScrollView>

      {/* Sticky Bottom CTA - 2 Distinct Buttons */}
      <View style={[styles.bottomBar, bottomBarInsetsStyle]}>
        {maxStepReached > 2 ? (
          /* Separate Button 1: Update and Continue (PUT Method flow) */
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleContinue}
            disabled={isSaving}
            style={[
              styles.continueButton,
              !isSaving ? styles.continueActive : styles.continueDisabled,
            ]}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.continueButtonText}>Update and Continue</Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
              </>
            )}
          </TouchableOpacity>
        ) : (
          /* Separate Button 2: Continue (POST Method flow) */
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleContinue}
            disabled={isSaving}
            style={[
              styles.continueButton,
              !isSaving ? styles.continueActive : styles.continueDisabled,
            ]}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.continueButtonText}>Continue to Review</Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Universal Draft Modal (Same as GST & ITR) */}
      <UniversalDraftModal
        visible={showDraftModal}
        title="Save Document Progress?"
        message="You have uploaded documents in your TDS refund application. Save your progress so you can resume anytime without re-uploading."
        saveButtonText="Save as Draft & Exit"
        discardButtonText="Discard & Exit"
        cancelButtonText="Keep Editing"
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={discardDraft}
        onCancel={cancelExit}
      />
    </View>
  );
};

export default TdsDocumentChecklistScreen;
