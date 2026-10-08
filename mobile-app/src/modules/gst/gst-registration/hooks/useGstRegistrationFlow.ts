/**
 * Hook: useGstRegistrationFlow
 * Modular Monolithic flow manager for GST registration.
 * Fully typed, functional architecture, exception-safe, strictly < 500 lines.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Alert, type ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useApplicationStore } from "@/store/applicationStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { tokenManager, JwtUtils } from "@/core/authentication/tokenManager";
import { authStorage } from "@/modules/authentication/services/authStorage";
import { gstApi } from "@/modules/gst/services/gstApi";
import { GstValidators } from "@/modules/gst/utils/gstValidators";
import {
  mapGstRegistrationPayload,
  mapDtoToGstBusinessFormData,
  mapDtoToDocuments,
} from "@/modules/gst/gst-registration/utils/gstRegistrationMapper";
import { GstBusinessFormData } from "@/modules/gst/gst-registration/components/GstBusinessStep/GstBusinessStep";
import { INITIAL_DOCUMENTS } from "@/modules/gst/gst-registration/components/GstUnifiedDocumentStep/GstUnifiedDocumentStep";
import { DocumentItem } from "@/modules/gst/gst-registration/components/GstUnifiedDocumentStep/GstUnifiedDocumentStep.types";
import { getErrorMessage } from "@/core/error-handling/errorMessage";
import { logger } from "@/core/logging/logger";

// --- CONSTANTS & HELPERS ---

export const isBackendGstId = (id?: unknown): id is string => {
  if (!id || typeof id !== "string") return false;
  const clean = id.trim();
  if (/^GST-2026-\d+/i.test(clean)) return false;
  return /^GST\d+$/i.test(clean) || (clean.startsWith("GST") && !clean.includes("-"));
};

export const extractGstId = (res: unknown): string => {
  if (!res) return "";
  if (typeof res === "string") {
    const match = res.match(/GST\d{6,14}/i) || res.match(/GST[A-Za-z0-9]+/i);
    return match ? match[0] : "";
  }
  const obj = res as Record<string, any>;
  const candidate = obj.gstId || obj.businessId || obj.id || obj.data?.gstId || obj.data?.id || "";
  return isBackendGstId(candidate) ? candidate : "";
};

export const resolveTargetGstId = (
  candidates: Array<string | undefined | null>,
): string => {
  for (const c of candidates) {
    if (isBackendGstId(c)) return c.trim();
  }
  return "";
};

const INITIAL_BUSINESS_DATA: GstBusinessFormData = {
  legalName: "", businessName: "", businessType: "", natureOfBusiness: "",
  placeOfBusiness: "", businessStartDate: "", reasonForRegistration: "",
  compositionScheme: "", businessAddress: "", city: "", district: "",
  state: "", pinCode: "", hsnCode: "", accountHolderName: "",
  bankAccountNumber: "", confirmBankAccountNumber: "", ifscCode: "",
  bankName: "", branchName: "", accountType: "", signatoryName: "",
  signatoryPan: "", signatoryDob: "", signatoryDesignation: "",
  signatoryMobile: "", signatoryEmail: "", addressProofType: "Rental Agreement",
  aadhaarConsent: false,
};

// --- MAIN HOOK ---

export const useGstRegistrationFlow = (scrollViewRef: React.RefObject<ScrollView | null>) => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    gstId?: string; id?: string; appId?: string; isEdit?: string; edit?: string; step?: string;
  }>();

  // State
  const [screenIndex, setScreenIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editSection, setEditSection] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [declared, setDeclared] = useState<boolean>(true);
  const [createdAppId, setCreatedAppId] = useState<string>("");
  const [createdGstId, setCreatedGstId] = useState<string>("");
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [businessErrors, setBusinessErrors] = useState<Record<string, string>>({});
  const [businessData, setBusinessData] = useState<GstBusinessFormData>(INITIAL_BUSINESS_DATA);
  const [isFetchingReview, setIsFetchingReview] = useState<boolean>(false);
  const hasRestoredDraftRef = useRef(false);

  // Store Hooks
  const gstDraft = useApplicationStore((s) => s.gstDraft);
  const saveGstDraft = useApplicationStore((s) => s.saveGstDraft);
  const clearGstDraft = useApplicationStore((s) => s.clearGstDraft);
  const createApplication = useApplicationStore((s) => s.createApplication);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const authCustomer = useAuthStore((s) => s.customer);
  const authUser = useAuthStore((s) => s.authenticatedUser);

  // Customer ID Resolution with Exception Handling
  const getResolvedCustomerId = useCallback(async (): Promise<string> => {
    try {
      if (businessData.customerId?.trim()) return businessData.customerId.trim();
      const storeCustId = authCustomer?.customerId || authUser?.customerId || authUser?.custId || (authCustomer as any)?.custId;
      if (storeCustId && String(storeCustId).trim()) return String(storeCustId).trim();

      const token = await tokenManager.getAccessToken();
      if (token) {
        const payload = JwtUtils.decodePayload(token);
        if (payload?.sub && typeof payload.sub === "string" && payload.sub.trim()) return payload.sub.trim();
      }
      const u = authStorage.getUser();
      const s = authStorage.getSession();
      const storageCustId = u?.customerId || u?.custId || s?.activeCustId;
      if (storageCustId && String(storageCustId).trim()) return String(storageCustId).trim();
    } catch (err) {
      logger.warn("[useGstRegistrationFlow] Error resolving customer ID:", { error: err });
    }
    return "";
  }, [authCustomer, authUser, businessData.customerId]);

  // Sync Customer ID onto Business Form (Do NOT autofill signatory details from personal profile)
  useEffect(() => {
    let isMounted = true;
    getResolvedCustomerId().then((cid) => {
      if (cid && isMounted) {
        setBusinessData((prev) => ({
          ...prev,
          customerId: prev.customerId || cid,
        }));
      }
    });
    return () => { isMounted = false; };
  }, [getResolvedCustomerId]);

  // Draft Syncing & Guard
  const hasAnyDataEntered = useCallback((): boolean => {
    const hasBusiness = Object.values(businessData).some(
      (v) => (typeof v === "string" && v.trim() !== "" && v !== "Rental Agreement") || (typeof v === "boolean" && v === true),
    );
    return hasBusiness || documents.some((d) => Boolean(d.fileUri));
  }, [businessData, documents]);

  const syncDraft = useCallback(
    (stepOverride?: number, gstIdOverride?: string, docsOverride?: DocumentItem[]) => {
      try {
        const targetGstId = gstIdOverride ?? createdGstId;
        const docsToSave = docsOverride ?? documents;
        saveGstDraft({
          id: "draft-gst",
          stepIndex: stepOverride ?? screenIndex,
          personalData: {},
          businessData: { ...businessData, ...(targetGstId ? { gstId: targetGstId } : {}) } as any,
          createdGstId: targetGstId,
          documents: docsToSave as any,
          updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          ...(documentId ? { documentId } : {}),
        });
      } catch (err) {
        logger.warn("[useGstRegistrationFlow] Failed to sync GST draft:", { error: err });
      }
    },
    [businessData, createdGstId, documentId, documents, saveGstDraft, screenIndex],
  );

  const draftGuard = useUniversalDraftGuard({
    isDirty: hasAnyDataEntered,
    onSaveDraft: syncDraft,
    onDiscardDraft: clearGstDraft,
    isSubmitted: () => screenIndex >= 3,
  });

  // Auto-restore draft & Handle Route Parameters (Runs once on mount)
  useEffect(() => {
    if (hasRestoredDraftRef.current) return;
    try {
      const rawRouteGstId = params.gstId || params.id || params.appId;
      const routeGstId = isBackendGstId(rawRouteGstId) ? rawRouteGstId : undefined;

      if (routeGstId) {
        setCreatedGstId(routeGstId);
        setBusinessData((prev) => ({ ...prev, gstId: routeGstId }));
        gstApi.getBusiness(routeGstId)
          .then((dto) => dto && setBusinessData((p) => ({ ...p, ...mapDtoToGstBusinessFormData(dto), gstId: routeGstId })))
          .catch((e) => logger.warn("[useGstRegistrationFlow] Could not fetch business details:", { error: e }));
      }

      if (params.edit === "true" || params.isEdit === "true") setIsEditMode(true);
      if (params.step) {
        const parsed = parseInt(params.step, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 3) setScreenIndex(parsed);
      }

      if (gstDraft) {
        if (gstDraft.businessData) {
          setBusinessData((prev) => ({
            ...prev,
            ...gstDraft.businessData,
            businessName: gstDraft.businessData.businessName || (gstDraft.businessData as any).registeredBusinessName || "",
            businessType: gstDraft.businessData.businessType || "",
          }));
        }
        if (Array.isArray(gstDraft.documents) && gstDraft.documents.length > 0) {
          setDocuments(gstDraft.documents as DocumentItem[]);
        }
        if (typeof gstDraft.stepIndex === "number" && gstDraft.stepIndex < 3 && !params.step) {
          setScreenIndex(gstDraft.stepIndex);
        }
        const draftGstId = gstDraft.createdGstId;
        if (isBackendGstId(draftGstId)) {
          setCreatedGstId((prev) => (isBackendGstId(prev) ? prev : draftGstId));
        } else if (isBackendGstId((gstDraft.businessData as any)?.gstId)) {
          setCreatedGstId((prev) => (isBackendGstId(prev) ? prev : (gstDraft.businessData as any).gstId));
        }
        if (gstDraft.documentId) setDocumentId(gstDraft.documentId);
      }
      hasRestoredDraftRef.current = true;
    } catch (err) {
      logger.warn("[useGstRegistrationFlow] Failed to restore GST draft/params:", { error: err });
    }
  }, [params.gstId, params.id, params.appId, params.edit, params.isEdit, params.step, gstDraft]);

  // Database Review Fetcher
  const fetchRegistrationDetails = useCallback(async (gstIdToFetch?: string, docIdToFetch?: string) => {
    const activeGstId = gstIdToFetch || createdGstId || businessData.gstId || params.gstId || params.id || (params.appId?.startsWith("GST") ? params.appId : undefined);
    if (!businessData.legalName) setIsFetchingReview(true);

    try {
      if (activeGstId) {
        const dbBusiness = await gstApi.getBusiness(activeGstId);
        if (dbBusiness) setBusinessData((prev) => ({ ...prev, ...mapDtoToGstBusinessFormData(dbBusiness), gstId: activeGstId }));
      }
      const activeDocId = docIdToFetch || documentId || gstDraft?.documentId;
      if (activeDocId) {
        const dbDocs = await gstApi.getRegistrationDocuments(activeDocId);
        if (dbDocs) setDocuments((prev) => mapDtoToDocuments(dbDocs, prev));
      }
    } catch (err) {
      logger.warn("[useGstRegistrationFlow] Could not retrieve documents from DB:", { error: getErrorMessage(err) || err });
    } finally {
      setIsFetchingReview(false);
    }
  }, [createdGstId, businessData.gstId, businessData.legalName, params.gstId, params.id, params.appId, documentId, gstDraft]);

  useEffect(() => {
    if (screenIndex === 2) fetchRegistrationDetails();
  }, [screenIndex, fetchRegistrationDetails]);

  // Form Interactions
  const handleBusinessChange = useCallback((fields: Partial<GstBusinessFormData>) => {
    setBusinessData((prev) => {
      const updated = { ...prev, ...fields };
      setBusinessErrors((prevErrors) => Object.keys(fields).reduce<Record<string, string>>((acc, k) => {
        const key = k as keyof GstBusinessFormData;
        if (acc[key]) acc[key] = GstValidators.validateBusinessField(key, typeof updated[key] === "boolean" ? String(updated[key]) : updated[key] || "");
        return acc;
      }, { ...prevErrors }));
      return updated;
    });
  }, []);

  const handleBusinessBlur = useCallback((field: keyof GstBusinessFormData) => {
    const val = businessData[field];
    const msg = GstValidators.validateBusinessField(field, typeof val === "boolean" ? String(val) : val || "");
    setBusinessErrors((prev) => ({ ...prev, [field]: msg }));
  }, [businessData]);

  const handleUpdateDocuments = useCallback((updated: DocumentItem[]) => {
    setDocuments(updated);
    syncDraft(1, undefined, updated);
  }, [syncDraft]);

  // Validations
  const validateBusinessDetails = (): boolean => {
    const errs = GstValidators.validateBusinessForm(businessData as unknown as Record<string, string>);
    setBusinessErrors(errs);
    if (Object.keys(errs).length > 0) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      Alert.alert("Required Fields Missing", "Please enter all the required fields correctly to proceed.");
      return false;
    }
    return true;
  };

  const validateDocuments = (): boolean => {
    const mandatoryMissing = documents.filter((d) => d.required && !d.fileUri);
    if (mandatoryMissing.length > 0) {
      const missingNames = mandatoryMissing.map((d) => d.name).join("\n\u2022 ");
      Alert.alert("Required Documents Missing", `Please upload:\n\n\u2022 ${missingNames}`);
      return false;
    }
    return true;
  };

  // Flow Navigation
  const handleEditStep = (targetStepIndex: number, section?: string) => {
    setIsEditMode(true);
    setEditSection(section || null);
    setScreenIndex(targetStepIndex);
    setTimeout(() => {
      const yOffset = section === "bank" ? 550 : section === "signatory" ? 1100 : 0;
      scrollViewRef.current?.scrollTo({ y: targetStepIndex === 0 ? yOffset : 0, animated: true });
    }, 100);
  };

  const handleBack = () => {
    if (isEditMode) {
      setIsEditMode(false);
      setEditSection(null);
      setScreenIndex(2);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    if (screenIndex === 4) {
      router.replace("/(main)/home");
      return;
    }
    if (screenIndex > 0) {
      setScreenIndex((prev) => prev - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    if (hasAnyDataEntered()) {
      draftGuard.openDraftModal();
    } else {
      router.back();
    }
  };

  // Unified Step Submissions
  const submitBusinessStep = async () => {
    if (!validateBusinessDetails()) return;
    const custId = await getResolvedCustomerId();
    const applications = useApplicationStore.getState().applications;
    const targetGstId = resolveTargetGstId([
      createdGstId,
      businessData.gstId,
      params.gstId,
      params.id,
      params.appId,
      gstDraft?.createdGstId,
      gstDraft?.gstId,
      (gstDraft?.businessData as any)?.gstId,
    ]);

    const payload = mapGstRegistrationPayload(businessData, custId, targetGstId);
    const nextStep = isEditMode ? 2 : 1;

    if (targetGstId) {
      await gstApi.updateRegistration(targetGstId, payload);
      setCreatedGstId(targetGstId);
      setBusinessData((prev) => ({ ...prev, gstId: targetGstId }));
      syncDraft(nextStep, targetGstId);
    } else {
      const response = await gstApi.submitRegistration(payload);
      const newGstId = extractGstId(response);
      if (newGstId) {
        setCreatedGstId(newGstId);
        setBusinessData((prev) => ({ ...prev, gstId: newGstId }));
        syncDraft(nextStep, newGstId);
      } else {
        syncDraft(nextStep);
      }
    }

    if (isEditMode) {
      setIsEditMode(false);
      setEditSection(null);
      Alert.alert("Success", "Business details updated successfully.");
    }
    setScreenIndex(nextStep);
  };

  const submitDocumentsStep = async () => {
    if (!validateDocuments()) return;
    const nextStep = 2;
    syncDraft(nextStep);

    if (documentId) {
      await gstApi.updateAllDocuments(documentId, documents, businessData.addressProofType);
    } else if (createdGstId) {
      const res = await gstApi.uploadAllDocuments(createdGstId, documents, businessData.addressProofType);
      const match = String(res).match(/Document ID:\s*([A-Za-z0-9_-]+)/i);
      if (match) setDocumentId(match[1]);
    }

    if (isEditMode) {
      setIsEditMode(false);
      setEditSection(null);
    }
    setScreenIndex(nextStep);
  };

  const submitReviewStep = async () => {
    if (!declared) {
      Alert.alert("Declaration Required", "Please accept the declaration to proceed to payment.");
      return;
    }
    syncDraft(3);
    if (createdGstId) {
      try {
        const custId = await getResolvedCustomerId();
        await gstApi.updateRegistration(createdGstId, mapGstRegistrationPayload(businessData, custId, createdGstId));
      } catch (e) {
        logger.warn("[useGstRegistrationFlow] Failed to update final registration details", { error: e });
      }
    }
    setScreenIndex(3);
  };

  const handleContinue = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const stepHandlers: Record<number, () => Promise<void>> = {
        0: submitBusinessStep,
        1: submitDocumentsStep,
        2: submitReviewStep,
      };
      const handler = stepHandlers[screenIndex];
      if (handler) await handler();
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } catch (err) {
      Alert.alert("Error", getErrorMessage(err) || "An unexpected error occurred. Please try again.");
      logger.error("[useGstRegistrationFlow] GST Flow Error:", { error: err });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (txnId: string, paymentMethod: string) => {
    try {
      const applications = useApplicationStore.getState().applications;
      const targetGstId =
        resolveTargetGstId([
          createdGstId,
          businessData.gstId,
          gstDraft?.createdGstId,
          gstDraft?.businessData?.gstId,
          params.gstId,
          params.id,
        ]) || createdGstId || businessData.gstId || "";

      const appId = createApplication(
        "gst-registration", "GST Registration", "GST",
        {
          ...businessData,
          gstId: targetGstId,
          applicantName: businessData.businessName || businessData.legalName || "Your Business",
          appliedDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          transactionId: txnId,
          paymentMethod,
          paymentAmount: 1499,
          paymentStatus: "Paid",
        },
        documents.map((d) => ({
          name: d.name, status: "Uploaded" as const, fileUri: d.fileUri, fileName: d.fileName, fileSize: d.fileSize,
        })),
        1499, "Paid", false, targetGstId || undefined,
      );

      const finalDisplayId = targetGstId || appId;
      setCreatedAppId(finalDisplayId);
      if (targetGstId) setCreatedGstId(targetGstId);

      draftGuard.markSubmitted();
      clearGstDraft();
      addNotification("GST Application Submitted", `Your GST Registration (ID: ${finalDisplayId}) has been successfully submitted and is under verification.`, "gst");
      setScreenIndex(4);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } catch (err) {
      logger.error("[useGstRegistrationFlow] Payment finalization failed:", { error: err });
      Alert.alert("Submission Failed", "Could not complete the process. Please try again.");
    }
  };

  const resolvedBackendGstId = useMemo(() => {
    return resolveTargetGstId([createdGstId, businessData.gstId, createdAppId]);
  }, [createdGstId, businessData.gstId, createdAppId]);

  return {
    screenIndex, setScreenIndex, isLoading, declared, setDeclared,
    businessData, businessErrors, documents,
    createdAppId: resolvedBackendGstId || createdAppId,
    createdGstId: resolvedBackendGstId,
    draftGuard, handleBusinessChange, handleBusinessBlur, handleUpdateDocuments,
    handleContinue, handlePaymentSuccess, handleBack,
    isEditMode, editSection, handleEditStep,
    fetchRegistrationDetails, isFetchingReview,
  };
};
