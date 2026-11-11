import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { authStorage } from "@/modules/authentication/services/authStorage";
import { useTdsProgressStore } from "../../store/tdsProgressStore";
import {
  TdsCustomerIncomeFormData,
  PersonalDetails,
} from "../../types/customerIncome.types";
import { cleanIfsc } from "../../utils/tdsValidation";
import {
  validateCustomerIncomeForm,
  CustomerFormErrors,
} from "../../validation/tdsCustomerSchema";
import { tdsDraftService, INITIAL_TDS_FORM_DATA, getTdsCustId } from "../../services/tdsDraftService";
import { tdsApiService } from "../../services/tdsApiService";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { useTdsProfileSync } from "./useTdsProfileSync";
import { useTdsBackDraftSave } from "../../hooks/useTdsBackDraftSave";
import { describeSaveError } from "./tdsFormHelpers";
import {
  syncUpdatedCustomerProfile,
  mergeNonEmptyFields,
  validateSection,
  applyBlurValidation,
  loadDraftDocuments,
  syncApplicationBackend,
} from "./useTdsRefundForm.helpers";
import { UpdateBankField } from "./TdsRefundFormSections.types";

export const useTdsRefundForm = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<TdsCustomerIncomeFormData>(INITIAL_TDS_FORM_DATA);
  const [errors, setErrors] = useState<CustomerFormErrors>({});
  const {
    isEditing: isEditingParam,
    id: paramId,
    applicationId: paramAppId,
    section: paramSection,
  } = useLocalSearchParams<{
    isEditing?: string;
    id?: string;
    applicationId?: string;
    section?: string;
  }>();
  // BUG_B23_007: Derive isEditing directly from route params so it's always in sync
  const isEditing = isEditingParam === "true";

  const { isProfileLoading, profileFetchError, fetchAndPopulateProfile } = useTdsProfileSync(setFormData);

  const initialSnapshotRef = useRef<string | null>(null);
  const [hasUserEdited, setHasUserEdited] = useState(false);
  const isSavingRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  // False until the draft stored on the device has been applied. The form is not shown before that,
  // so empty defaults are never rendered or typed into while a saved draft is about to arrive.
  const [isHydrating, setIsHydrating] = useState(true);
  // Fields the user changed. Late server data must not overwrite them.
  const editedFieldsRef = useRef<{ business: Set<string>; bank: Set<string> }>({
    business: new Set(),
    bank: new Set(),
  });
  const personalEditedRef = useRef(false);

  const [documents, setDocuments] = useState<any[]>([]);
  const documentsRef = useRef<any[]>([]);
  // Always the newest rendered state, so Back saves what is on screen and not a stale closure.
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  const isDirtyNow = () => {
    if (hasUserEdited) return true;
    if (!initialSnapshotRef.current) return false;
    return (
      JSON.stringify({ bank: formData.bank, income: formData.income }) !== initialSnapshotRef.current
    );
  };

  const draftGuard = useUniversalDraftGuard({
    saveDestination: "/service/itr",
    discardDestination: "/service/itr",
    // Editing a single section from Review keeps the existing Save / Discard prompt.
    // Back from the first screen saves automatically (see useTdsBackDraftSave below).
    isDirty: () => isEditing && isDirtyNow(),
    onSaveDraft: async () => {
      await tdsDraftService.saveFormDraft(formDataRef.current);
      await tdsDraftService.saveDocumentsDraft(documentsRef.current);
    },
    onDiscardDraft: async () => {
      await tdsDraftService.clearDraft();
    },
    isSubmitted: () => useTdsProgressStore.getState().isSubmitted,
  });

  // Back from the first application screen saves the draft locally, then leaves. It reuses the same
  // local draft storage as the explicit save and never calls the submit APIs.
  const persistDraftOnBack = async () => {
    const latestForm = formDataRef.current;
    const latestDocs = documentsRef.current;
    await tdsDraftService.saveFormDraft(latestForm, "FORM");
    // Never overwrite stored documents with an empty list if they have not been loaded.
    if (latestDocs.length > 0) {
      await tdsDraftService.saveDocumentsDraft(latestDocs);
    }
    try {
      const appStore = (await import("@/store/applicationStore")).useApplicationStore.getState();
      appStore.saveTdsDraft?.({
        formData: latestForm,
        documents: latestDocs as any,
        step: "FORM",
        updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    } catch (storeErr) {
      console.warn("[TDS Form] appStore.saveTdsDraft warning:", storeErr);
    }
  };

  useTdsBackDraftSave({
    shouldSave: !isEditing && !isHydrating && !useTdsProgressStore.getState().isSubmitted && isDirtyNow(),
    saveDraft: persistDraftOnBack,
    isBusy: () => isSavingRef.current,
  });

  useEffect(() => {
    let cancelled = false;

    async function readStoreDraftForm(): Promise<any> {
      try {
        const appStore = (await import("@/store/applicationStore")).useApplicationStore.getState();
        return appStore.tdsDraft?.formData ?? null;
      } catch {
        return null;
      }
    }

    /** Server lookups for an existing application. Each failure is tolerated; local data still wins. */
    async function fetchRemoteApplication(existingAppId: string | undefined, custId: string) {
      let backendApp: any = null;
      let dbDetails: any = null;
      try {
        if (existingAppId || custId) {
          backendApp = await tdsApiService.fetchFullTdsApplication(custId || "", existingAppId);
        }
        if (backendApp?.tdsRefundId) {
          await tdsDraftService.saveApplicationId(backendApp.tdsRefundId);
        }
      } catch (err) {
        console.warn("[TDS Screen] Backend fetch warning:", err);
      }

      // Direct fallback to getTdsRefund if backendApp didn't provide business data
      if ((!backendApp || !backendApp.business?.legalName) && existingAppId) {
        try {
          dbDetails = await tdsApiService.getTdsRefund(existingAppId);
        } catch {}
      }
      if (!dbDetails && custId && (!backendApp || !backendApp.business?.legalName)) {
        try {
          dbDetails = await tdsApiService.getBankAccountByCustId(custId);
        } catch {}
      }

      const backendBusinessFromDb = dbDetails ? {
        legalName: dbDetails.legalBusinessName || "",
        pan: dbDetails.businessPan || "",
        aadhaar: dbDetails.aadhaarNumber || "",
        mobileNumber: dbDetails.mobileNumber || "",
      } : null;

      const backendBankFromDb = dbDetails ? {
        accountHolderName: dbDetails.accountHolderName || "",
        accountNumber: dbDetails.accountNumber || "",
        confirmAccountNumber: dbDetails.confirmAccountNumber || dbDetails.accountNumber || "",
        ifscCode: dbDetails.ifscCode || "",
        bankName: dbDetails.bankName || "",
        branchName: dbDetails.branchName || "",
        accountType: (dbDetails.accountType?.toLowerCase() === "current" ? "current" : "savings") as any,
        isIfscVerified: Boolean(dbDetails.bankName),
      } : null;

      return { backendApp, backendBusinessFromDb, backendBankFromDb };
    }

    async function loadData() {
      // Phase 1: everything already on the device, read in parallel and applied immediately.
      // Previously this waited behind the profile request and several sequential server calls.
      const currentMobile = useAuthStore.getState().customer?.mobile ||
        authStorage.getSession().activeMobile ||
        useAuthStore.getState().mobileNumber;
      const routeAppId = (paramId || paramAppId) as string | undefined;

      const [savedDraft, storeDraftForm, savedDocs, storedAppId] = await Promise.all([
        tdsDraftService.getFormDraft(),
        readStoreDraftForm(),
        loadDraftDocuments(),
        routeAppId ? Promise.resolve<string | null>(null) : tdsDraftService.getApplicationId(),
      ]);
      if (cancelled) return;

      let draftBank: any = null;
      let draftIncome: any = null;
      let draftBusiness: any = null;
      let draftPersonal: any = null;
      let docs = savedDocs;
      let knownAppId: string | null = storedAppId;

      if (savedDraft) {
        const isSameCustomer = !savedDraft.personal?.mobileNumber ||
          !currentMobile ||
          savedDraft.personal.mobileNumber.replace(/\D/g, "") === currentMobile.replace(/\D/g, "");

        if (isSameCustomer) {
          draftBank = savedDraft.bank;
          draftIncome = savedDraft.income;
          draftBusiness = savedDraft.business;
          draftPersonal = savedDraft.personal;
        } else {
          // A different customer's draft: remove it, and do not show its documents or app id.
          await tdsDraftService.clearDraft();
          useTdsProgressStore.getState().reset();
          docs = await loadDraftDocuments();
          knownAppId = null;
          if (cancelled) return;
        }
      } else if (!isEditingParam) {
        useTdsProgressStore.getState().reset();
      }

      setFormData((prev) => ({
        ...prev,
        business: mergeNonEmptyFields(prev.business, storeDraftForm?.business, draftBusiness),
        bank: mergeNonEmptyFields(prev.bank, storeDraftForm?.bank, draftBank),
        income: mergeNonEmptyFields(prev.income, storeDraftForm?.income, draftIncome),
        personal: mergeNonEmptyFields(prev.personal, storeDraftForm?.personal, draftPersonal),
      }));
      setDocuments(docs);
      documentsRef.current = docs;
      setIsHydrating(false);

      // Phase 2: refresh from the server in the background. The profile and application requests
      // run in parallel and never block or overwrite what the user is already doing.
      try {
        const existingAppId = routeAppId || knownAppId || undefined;
        if (existingAppId) {
          await tdsDraftService.saveApplicationId(existingAppId);
        }
        const custId = getTdsCustId(savedDraft?.personal?.mobileNumber);

        const [freshPersonal, remote] = await Promise.all([
          fetchAndPopulateProfile({ applyToForm: false }),
          fetchRemoteApplication(existingAppId, custId),
        ]);
        if (cancelled) return;

        const { backendApp, backendBusinessFromDb, backendBankFromDb } = remote;

        setFormData((prev) => {
          const edited = editedFieldsRef.current;
          // Fields the user touched while the server data was loading keep the user's value.
          const keepEdited = <T extends Record<string, any>>(
            section: "business" | "bank",
            merged: T
          ): T => {
            const out: Record<string, any> = { ...merged };
            edited[section].forEach((key) => {
              out[key] = (prev[section] as Record<string, any>)[key];
            });
            return out as T;
          };

          const mergedBusiness = keepEdited(
            "business",
            mergeNonEmptyFields(
              prev.business,
              backendApp?.business,
              backendBusinessFromDb,
              storeDraftForm?.business,
              draftBusiness
            )
          );

          const mergedBank = keepEdited(
            "bank",
            mergeNonEmptyFields(
              prev.bank,
              backendApp?.bank,
              backendBankFromDb,
              storeDraftForm?.bank,
              draftBank
            )
          );
          if (!mergedBank.accountHolderName && freshPersonal?.fullName && !edited.bank.has("accountHolderName")) {
            mergedBank.accountHolderName = freshPersonal.fullName;
          }

          const mergedIncome = mergeNonEmptyFields(
            prev.income,
            backendApp?.income,
            storeDraftForm?.income,
            draftIncome
          );

          const mergedPersonal = personalEditedRef.current
            ? prev.personal
            : mergeNonEmptyFields(prev.personal, freshPersonal, storeDraftForm?.personal, draftPersonal);

          // BUG_B23_001: snapshot keys must match isDirty keys ({bank, income}) — business excluded
          initialSnapshotRef.current = JSON.stringify({ bank: mergedBank, income: mergedIncome });

          return {
            ...prev,
            bank: mergedBank,
            income: mergedIncome,
            business: mergedBusiness,
            personal: mergedPersonal,
          };
        });
      } catch (err) {
        console.warn("[TDS Screen] Background refresh warning:", err);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = async (updated: PersonalDetails) => {
    const cleanMob = updated.mobileNumber ? updated.mobileNumber.replace(/\D/g, "").slice(-10) : "";
    const normalizedPersonal: PersonalDetails = {
      ...updated,
      mobileNumber: cleanMob || updated.mobileNumber,
    };

    personalEditedRef.current = true;
    const nextFormState: TdsCustomerIncomeFormData = {
      ...formData,
      personal: normalizedPersonal,
      bank: {
        ...formData.bank,
        accountHolderName: formData.bank.accountHolderName || normalizedPersonal.fullName,
      },
    };

    setFormData(nextFormState);
    setErrors((prev) => {
      const next = { ...prev };
      let hasPersonalErrors = false;
      Object.keys(next).forEach((k) => {
        if (k.startsWith("personal.")) {
          delete next[k];
          hasPersonalErrors = true;
        }
      });
      return hasPersonalErrors ? next : prev;
    });

    await syncUpdatedCustomerProfile(normalizedPersonal, cleanMob);
    await tdsDraftService.saveFormDraft(nextFormState);
  };

  const updateBank: UpdateBankField = (field, value) => {
    setHasUserEdited(true);
    editedFieldsRef.current.bank.add(field);
    setFormData((prev) => ({
      ...prev,
      bank: { ...prev.bank, [field]: value },
    }));

    const errorKey = `bank.${field}` as keyof CustomerFormErrors;
    // BUG_B23_006: when accountNumber changes, the confirmAccountNumber mismatch error is stale — clear it too
    const shouldClearConfirm = field === "accountNumber" && Boolean(errors["bank.confirmAccountNumber"]);
    if (errors[errorKey] || shouldClearConfirm) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        if (field === "accountNumber") {
          delete next["bank.confirmAccountNumber"];
        }
        return next;
      });
    }
  };


  const handleIfscChange = (val: string) => {
    updateBank("ifscCode", cleanIfsc(val));
  };

  const updateBusiness = (field: string, value: string) => {
    setHasUserEdited(true);
    editedFieldsRef.current.business.add(field);
    setFormData((prev) => ({
      ...prev,
      business: { ...prev.business, [field]: value },
    }));

    const errorKey = `business.${field}` as keyof CustomerFormErrors;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  const handleBlurField = (fieldPath: string) => {
    setErrors((prev) => applyBlurValidation(prev, fieldPath, formData));
  };

  const handleUploadSuccess = (id: string, payload: any) => {
    setHasUserEdited(true);
    setDocuments((prev) => {
      const next = prev.map((doc) => doc.id === id ? { ...doc, status: "uploaded", errorMessage: undefined, fileUri: payload.uri, fileName: payload.name, fileSize: payload.size, mimeType: payload.mimeType, fileTypeLabel: payload.fileTypeLabel } : doc);
      documentsRef.current = next;
      return next;
    });
  };
  const handleUploadError = (id: string, errorMessage: string) => {
    setHasUserEdited(true);
    setDocuments((prev) => {
      const next = prev.map((doc) => doc.id === id ? { ...doc, status: "not_uploaded", errorMessage } : doc);
      documentsRef.current = next;
      return next;
    });
  };
  const handleRemove = (id: string) => {
    setHasUserEdited(true);
    setDocuments((prev) => {
      const next = prev.map((doc) => doc.id === id ? { ...doc, status: "not_uploaded", fileUri: undefined, fileName: undefined, fileSize: undefined, mimeType: undefined, fileTypeLabel: undefined, errorMessage: undefined } : doc);
      documentsRef.current = next;
      return next;
    });
  };

  const handleContinue = async () => {
    const activeDocs =
      documentsRef.current && documentsRef.current.length > 0
        ? documentsRef.current
        : documents;

    // Validate specific section in edit mode, or full form otherwise
    const validation = isEditing && paramSection
      ? validateSection(paramSection, formData)
      : validateCustomerIncomeForm(formData);

    const hasMissingMandatoryDocs = !isEditing && activeDocs.some((doc) => doc.isMandatory && doc.status !== 'uploaded');

    if (!validation.isValid || hasMissingMandatoryDocs) {
      if (!validation.isValid) {
        setErrors(validation.errors);
        Alert.alert(
          "Incomplete Information",
          "Please complete all required fields correctly to proceed."
        );
      } else {
        Alert.alert(
          "Incomplete Documents",
          "Please upload all mandatory documents (PAN and Aadhaar) to proceed."
        );
      }
      return;
    }
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);

    try {
      // Persist to local draft storage and application store
      await tdsDraftService.saveFormDraft(formData, isEditing ? "REVIEW" : "FORM");
      await tdsDraftService.saveDocumentsDraft(activeDocs);
      try {
        const appStore = (await import("@/store/applicationStore")).useApplicationStore.getState();
        appStore.saveTdsDraft?.({
          formData,
          documents: activeDocs as any,
          step: isEditing ? "ESTIMATE" : "FORM",
          updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
      } catch (storeErr) {
        console.warn("[TDS Form] appStore.saveTdsDraft warning:", storeErr);
      }

      const custId = getTdsCustId(formData.personal.mobileNumber);
      const draftAppId = await tdsDraftService.getApplicationId();
      let targetId = ((paramId || paramAppId || draftAppId) as string | undefined)?.trim();

      // Fallback: If editing and no targetId found, attempt lookup by custId
      if (!targetId && custId) {
        try {
          const existingDb = await tdsApiService.getBankAccountByCustId(custId);
          if (existingDb?.id) {
            targetId = existingDb.id;
            await tdsDraftService.saveApplicationId(targetId);
          }
        } catch (findErr) {
          console.warn("[TDS Form] Cust ID lookup fallback warning:", findErr);
        }
      }

      console.log(`🚀 [TDS Form] handleContinue -> isEditing: ${isEditing}, targetId: ${targetId}`);

      const savedTdsId = await syncApplicationBackend(
        isEditing,
        targetId,
        custId,
        formData,
        activeDocs,
      );
      await tdsDraftService.saveApplicationId(savedTdsId || targetId || "");
    } catch (err) {
      console.error("[TDS Screen] Backend update/save failed:", err);
      Alert.alert("Unable to Save Application", describeSaveError(err));
      return;
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
    draftGuard.markSubmitted();
    setHasUserEdited(false);
    initialSnapshotRef.current = JSON.stringify({ bank: formData.bank, income: formData.income });
    if (useTdsProgressStore.getState().maxStepReached < 3) {
      useTdsProgressStore.getState().setMaxStepReached(3);
    }
    if (isEditing) {
      router.back();
    } else {
      router.push("/service/tds-estimate" as any);
    }
  };

  // Header Back. The draft is saved by useTdsBackDraftSave, which intercepts every way of leaving
  // this screen (this button, Android hardware Back and the back gesture), so this only navigates.
  const handleBack = () => {
    router.back();
  };

  return {
    formData,
    errors,
    isProfileLoading,
    isEditing,
    profileFetchError,
    fetchAndPopulateProfile,
    handleSaveProfile,
    updateBusiness,
    updateBank,
    handleIfscChange,
    handleBlurField,
    handleContinue,
    handleBack,
    isSaving,
    isHydrating,
    draftGuard,
    documents,
    handleUploadSuccess,
    handleUploadError,
    handleRemove,
  };
};
