import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { authStorage } from "@/modules/authentication/services/authStorage";
import { useCustomerStore } from "@/modules/customer/store/customerStore";
import { useTdsProgressStore } from "../../store/tdsProgressStore";
import { authApi } from "@/modules/authentication/services/authApi";
import { ifscService } from "@/shared/services/lookup/ifscService";
import {
  TdsCustomerIncomeFormData,
  PersonalDetails,
} from "../../types/customerIncome.types";
import { cleanIfsc } from "../../utils/tdsValidation";
import {
  validateCustomerIncomeForm,
  CustomerFormErrors,
} from "../../validation/tdsCustomerSchema";
import {
  tdsDraftService,
  INITIAL_TDS_FORM_DATA,
  getTdsCustId,
} from "../../services/tdsDraftService";
import { tdsApiService } from "../../services/tdsApiService";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { logger } from "@/core/logging/logger";
import { ApiError } from "@/core/api/apiError";
import { UpdateBankField, UpdateIncomeField } from "./TdsRefundFormSections.types";
import {
  mergeFetchedCustomer,
  buildPersonalDetails,
  buildCustomerFromPersonal,
  buildCustomerProfileUpdate,
  type CustomerProfileRecord,
} from "./useTdsRefundForm.helpers";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

const describeSaveError = (err: unknown): string => {
  if (err instanceof ApiError) {
    if (err.code === "NETWORK_ERROR") return err.message;
    if (err.statusCode === 401) {
      return "Your session has expired. Please log in again and retry.";
    }
    if (err.statusCode === 403) {
      return `${err.message}\n\nThe server refused this request. Please log in again; if it persists, the TDS service may not be available on this server.`;
    }
    return err.message;
  }
  return (err as any)?.message || "Failed to save your TDS details. Please try again.";
};

export const useTdsRefundForm = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<TdsCustomerIncomeFormData>(INITIAL_TDS_FORM_DATA);
  const [errors, setErrors] = useState<CustomerFormErrors>({});
  const [isIfscLoading, setIsIfscLoading] = useState(false);
  const [ifscError, setIfscError] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileFetchError, setProfileFetchError] = useState<string | null>(null);

  const initialSnapshotRef = useRef<string | null>(null);
  const [hasUserEdited, setHasUserEdited] = useState(false);
  const isSavingRef = useRef(false);

  const draftGuard = useUniversalDraftGuard({
    isDirty: () => {
      if (!initialSnapshotRef.current) return false;
      const currentSnapshot = JSON.stringify({ bank: formData.bank, income: formData.income });
      return hasUserEdited || currentSnapshot !== initialSnapshotRef.current;
    },
    onSaveDraft: async () => {
      await tdsDraftService.saveFormDraft(formData);
    },
    onDiscardDraft: async () => {
      await tdsDraftService.clearDraft();
    },
  });

  const fetchAndPopulateProfile = async (): Promise<PersonalDetails | null> => {
    setIsProfileLoading(true);
    setProfileFetchError(null);
    try {
      useAuthStore.getState().syncFromDevAuth();
      const currentAuthUser = useAuthStore.getState().authenticatedUser;
      let currentCustomer = useAuthStore.getState().customer;

      const activeMobile =
        currentCustomer?.mobile ||
        currentAuthUser?.mobileNumber ||
        currentAuthUser?.mobile ||
        authStorage.getSession().activeMobile ||
        useAuthStore.getState().mobileNumber;

      const activeCustId =
        currentCustomer?.customerId ||
        currentAuthUser?.customerId ||
        currentAuthUser?.custId;

      const cleanMob = activeMobile ? String(activeMobile).replace(/\D/g, "").slice(-10) : "";

      let apiRes: CustomerProfileRecord | null = null;
      const lookupId = activeCustId || cleanMob;
      if (lookupId) {
        const backendRes = await authApi.getCustomerDetails(lookupId);
        if (backendRes.success && backendRes.data) {
          apiRes = backendRes.data;
        }
      }

      if (!apiRes) {
        apiRes = (cleanMob ? authStorage.getUserByMobile(cleanMob) : null) || authStorage.getUser();
      }

      if (apiRes && (apiRes.name || apiRes.fullName || apiRes.mobileNumber || apiRes.mobile || apiRes.pan || apiRes.aadhaar)) {
        const mergedCust = mergeFetchedCustomer(apiRes, currentCustomer, currentAuthUser, activeMobile, activeCustId);
        currentCustomer = mergedCust;
        useAuthStore.setState({ customer: mergedCust, profileCompleted: true });
        try {
          useCustomerStore.getState().setProfile(mergedCust);
        } catch (err) {
          logger.debug("[useTdsRefundForm] CustomerStore profile sync fallback", { error: err });
        }
      }

      if (!currentCustomer && !currentAuthUser && !apiRes) {
        setProfileFetchError("Unable to load your profile information.");
        return null;
      }

      const populatedPersonal = buildPersonalDetails(apiRes, currentCustomer, currentAuthUser);
      const rawName = populatedPersonal.fullName;

      setFormData((prev) => ({
        ...prev,
        personal: populatedPersonal,
        bank: {
          ...prev.bank,
          accountHolderName: prev.bank.accountHolderName || rawName,
        },
      }));

      return populatedPersonal;
    } catch (e) {
      setProfileFetchError(getErrorMessage(e) || "Failed to load profile.");
      return null;
    } finally {
      setIsProfileLoading(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      const freshPersonal = await fetchAndPopulateProfile();

      const currentMobile = useAuthStore.getState().customer?.mobile ||
        authStorage.getSession().activeMobile ||
        useAuthStore.getState().mobileNumber ||
        freshPersonal?.mobileNumber;

      const custId = getTdsCustId(freshPersonal?.mobileNumber);

      try {
        const existingAppId = await tdsDraftService.getApplicationId();
        const backendApp = custId
          ? await tdsApiService.fetchFullTdsApplication(custId, existingAppId || undefined)
          : null;
        if (backendApp && backendApp.bank) {
          if (backendApp.tdsRefundId) {
            await tdsDraftService.saveApplicationId(backendApp.tdsRefundId);
          }
          setFormData((prev) => ({
            ...prev,
            bank: { ...prev.bank, ...backendApp.bank },
            income: { ...prev.income, ...backendApp.income },
            personal: freshPersonal || prev.personal,
          }));
          initialSnapshotRef.current = JSON.stringify({ bank: backendApp.bank, income: backendApp.income });
          return;
        }
      } catch (err) {
        logger.warn("[useTdsRefundForm] Backend fetch warning:", { error: err });
      }

      const savedDraft = await tdsDraftService.getFormDraft();
      if (savedDraft) {
        const isSameCustomer = !savedDraft.personal?.mobileNumber ||
          !currentMobile ||
          savedDraft.personal.mobileNumber.replace(/\D/g, "") === currentMobile.replace(/\D/g, "");

        if (isSameCustomer) {
          setFormData((prev) => ({
            ...prev,
            bank: savedDraft.bank || prev.bank,
            income: savedDraft.income || prev.income,
            personal: freshPersonal || prev.personal,
          }));
          initialSnapshotRef.current = JSON.stringify({ bank: savedDraft.bank, income: savedDraft.income });
          return;
        } else {
          await tdsDraftService.clearDraft();
        }
      }

      initialSnapshotRef.current = JSON.stringify({ bank: INITIAL_TDS_FORM_DATA.bank, income: INITIAL_TDS_FORM_DATA.income });
    }
    loadData();
  }, []);

  const handleSaveProfile = async (updated: PersonalDetails) => {
    const cleanMob = updated.mobileNumber ? updated.mobileNumber.replace(/\D/g, "").slice(-10) : "";
    const normalizedPersonal: PersonalDetails = {
      ...updated,
      mobileNumber: cleanMob || updated.mobileNumber,
    };

    const nextFormState: TdsCustomerIncomeFormData = {
      ...formData,
      personal: normalizedPersonal,
      bank: {
        ...formData.bank,
        accountHolderName: formData.bank.accountHolderName || normalizedPersonal.fullName,
      },
    };

    setFormData(nextFormState);

    const currentCust = useAuthStore.getState().customer;
    const currentAuthUser = useAuthStore.getState().authenticatedUser;

    const updatedCustomer = buildCustomerFromPersonal(normalizedPersonal, cleanMob, currentCust, currentAuthUser);

    useAuthStore.setState({ customer: updatedCustomer, profileCompleted: true });
    try {
      useCustomerStore.getState().setProfile(updatedCustomer);
    } catch (err) {
      logger.debug("[useTdsRefundForm] CustomerStore profile sync fallback", { error: err });
    }

    try {
      const existingUser = authStorage.getUser() || {};
      authStorage.saveUser({
        ...existingUser,
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        mobileNumber: updatedCustomer.mobile,
        pan: updatedCustomer.pan,
        aadhaar: updatedCustomer.aadhaar,
        dob: updatedCustomer.dob,
        address: `${updatedCustomer.addressLine1 || ""} ${updatedCustomer.addressLine2 || ""}`.trim(),
        addressLine1: updatedCustomer.addressLine1,
        addressLine2: updatedCustomer.addressLine2,
        city: updatedCustomer.city,
        state: updatedCustomer.state,
        pincode: updatedCustomer.pincode,
        customerType: updatedCustomer.customerType,
      } as any);

      if (cleanMob) {
        authStorage.saveSession({
          ...authStorage.getSession(),
          isLoggedIn: true,
          activeMobile: cleanMob,
        });
      }
    } catch (err) {
      logger.warn("[useTdsRefundForm] Storage user save fallback", { error: err });
    }

    try {
      logger.debug("[useTdsRefundForm] Calling authApi.updateCustomerProfile", { hasMobile: !!updatedCustomer.mobile });
      const updateResult = await authApi.updateCustomerProfile(buildCustomerProfileUpdate(updatedCustomer));

      if (updateResult.success) {
        logger.debug("[useTdsRefundForm] Customer profile updated successfully on backend");
      } else {
        logger.warn("[useTdsRefundForm] Customer profile update warning from backend:", { message: updateResult.message });
      }
    } catch (err) {
      logger.warn("[useTdsRefundForm] Error sending customer update to backend:", { error: getErrorMessage(err) });
    }

    await tdsDraftService.saveFormDraft(nextFormState);
  };

  const updateBank: UpdateBankField = (field, value) => {
    setHasUserEdited(true);
    setFormData((prev) => ({
      ...prev,
      bank: { ...prev.bank, [field]: value },
    }));

    const errorKey = `bank.${field}` as keyof CustomerFormErrors;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  const updateIncome: UpdateIncomeField = (field, value) => {
    setHasUserEdited(true);
    setFormData((prev) => ({
      ...prev,
      income: { ...prev.income, [field]: value },
    }));

    const errorKey = `income.${field}` as keyof CustomerFormErrors;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  const handleIfscChange = async (val: string) => {
    const cleaned = cleanIfsc(val);
    updateBank("ifscCode", cleaned);

    if (cleaned.length === 11) {
      setIsIfscLoading(true);
      setIfscError(null);
      try {
        const details = await ifscService.lookup(cleaned);
        setFormData((prev) => ({
          ...prev,
          bank: {
            ...prev.bank,
            ifscCode: cleaned,
            bankName: details.bank,
            branchName: details.branch,
            isIfscVerified: true,
          },
        }));
        setIfscError(null);
      } catch (err) {
        logger.debug("[useTdsRefundForm] IFSC lookup fallback", { error: err });
        setIfscError("Invalid IFSC code. Please check branch details.");
        updateBank("isIfscVerified", false);
      } finally {
        setIsIfscLoading(false);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        bank: {
          ...prev.bank,
          bankName: "",
          branchName: "",
          isIfscVerified: false,
        },
      }));
    }
  };

  const handleContinue = async () => {
    const validation = validateCustomerIncomeForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      Alert.alert(
        "Incomplete Information",
        "Please complete all required fields correctly to proceed to document upload."
      );
      return;
    }

    if (isSavingRef.current) return;
    isSavingRef.current = true;

    await tdsDraftService.saveFormDraft(formData);

    try {
      const custId = getTdsCustId(formData.personal.mobileNumber);
      const existingAppId = await tdsDraftService.getApplicationId();

      const savedTdsId = await tdsApiService.saveFullTdsApplication(
        formData,
        [],
        custId,
        existingAppId || undefined
      );
      await tdsDraftService.saveApplicationId(savedTdsId);
    } catch (err) {
      logger.error("[useTdsRefundForm] Backend save failed:", { error: err });
      Alert.alert("Unable to Save Application", describeSaveError(err));
      return;
    } finally {
      isSavingRef.current = false;
    }

    draftGuard.markSubmitted();
    
      if (useTdsProgressStore.getState().maxStepReached >= 3) {
        router.push("/service/tds-estimate");
      } else {
        useTdsProgressStore.getState().setMaxStepReached(2);
        router.push("/service/tds-checklist");
      }
            
  };

  return {
    formData,
    errors,
    isIfscLoading,
    ifscError,
    isProfileLoading,
    profileFetchError,
    fetchAndPopulateProfile,
    handleSaveProfile,
    updateBank,
    updateIncome,
    handleIfscChange,
    handleContinue,
    draftGuard,
  };
};

