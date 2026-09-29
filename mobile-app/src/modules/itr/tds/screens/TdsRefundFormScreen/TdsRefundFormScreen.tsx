import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { ifscService } from "@/modules/gst/services/ifscService";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { authStorage } from "@/modules/authentication/services/authStorage";
import { useCustomerStore } from "@/modules/customer/store/customerStore";
import { authApi } from "@/modules/authentication/services/authApi";
import { ApiError } from "@/core/api/apiError";
import type { Customer } from "@/shared/types/domain";
import {
  TdsCustomerIncomeFormData,
  PersonalDetails,
} from "../../types/customerIncome.types";
import { cleanIfsc, formatCurrency } from "../../utils/tdsValidation";
import {
  validateCustomerIncomeForm,
  CustomerFormErrors,
} from "../../validation/tdsCustomerSchema";
import { tdsCalculationService } from "../../services/tdsCalculationService";
import {
  tdsDraftService,
  INITIAL_TDS_FORM_DATA,
  getTdsCustId,
} from "../../services/tdsDraftService";
import { tdsApiService } from "../../services/tdsApiService";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import {
  PersonalInfoSection,
  RefundBankAccountSection,
  IncomeTaxInfoSection,
  TdsTaxesPaidSection,
  TdsFormInputRefs,
  UpdateBankField,
  UpdateIncomeField,
} from "./TdsRefundFormSections";
import { styles } from "./TdsRefundFormScreen.styles";

/** Turns a failed TDS save into a user-facing message, keeping the backend's own message. */
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

export const TdsRefundFormScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<TdsCustomerIncomeFormData>(INITIAL_TDS_FORM_DATA);
  const [errors, setErrors] = useState<CustomerFormErrors>({});
  const [isIfscLoading, setIsIfscLoading] = useState(false);
  const [ifscError, setIfscError] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileFetchError, setProfileFetchError] = useState<string | null>(null);

  // Draft Guard & dirty tracking
  const initialSnapshotRef = useRef<string | null>(null);
  const [hasUserEdited, setHasUserEdited] = useState(false);

  // Universal Draft Guard Hook
  const {
    showDraftModal,
    markSubmitted,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
  } = useUniversalDraftGuard({
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

  // Bank & Income Input refs
  const accHolderRef = useRef<TextInput>(null);
  const accNumRef = useRef<TextInput>(null);
  const confirmAccNumRef = useRef<TextInput>(null);
  const ifscRef = useRef<TextInput>(null);
  const salaryRef = useRef<TextInput>(null);
  const otherIncomeRef = useRef<TextInput>(null);
  const interestRef = useRef<TextInput>(null);
  const tdsRef = useRef<TextInput>(null);
  const tcsRef = useRef<TextInput>(null);
  const advanceTaxRef = useRef<TextInput>(null);
  const selfTaxRef = useRef<TextInput>(null);
  const inputRefs: TdsFormInputRefs = {
    accHolderRef,
    accNumRef,
    confirmAccNumRef,
    ifscRef,
    salaryRef,
    otherIncomeRef,
    interestRef,
    tdsRef,
    tcsRef,
    advanceTaxRef,
    selfTaxRef,
  };

  // Guards against double-taps creating duplicate backend records
  const isSavingRef = useRef(false);

  // Auto-fetch profile from central Auth/Customer store & API
  const fetchAndPopulateProfile = async (): Promise<PersonalDetails | null> => {
    setIsProfileLoading(true);
    setProfileFetchError(null);
    try {
      useAuthStore.getState().syncFromDevAuth();
      const currentAuthUser = useAuthStore.getState().authenticatedUser;
      let currentCustomer = useAuthStore.getState().customer;

      const activeMobile =
        currentCustomer?.mobile ||
        (currentAuthUser as any)?.mobileNumber ||
        (currentAuthUser as any)?.mobile ||
        authStorage.getSession().activeMobile ||
        useAuthStore.getState().mobileNumber;

      const activeCustId =
        currentCustomer?.customerId ||
        (currentAuthUser as any)?.customerId ||
        (currentAuthUser as any)?.custId;

      const cleanMob = activeMobile ? String(activeMobile).replace(/\D/g, "").slice(-10) : "";

      // 1. Try fetching fresh details from Spring Boot backend first
      let apiRes: any = null;
      const lookupId = activeCustId || cleanMob;
      if (lookupId) {
        const backendRes = await authApi.getCustomerDetails(lookupId);
        if (backendRes.success && backendRes.data) {
          apiRes = backendRes.data;
        }
      }

      // 2. Fallback to authStorage local user
      if (!apiRes) {
        apiRes = (cleanMob ? authStorage.getUserByMobile(cleanMob) : null) || authStorage.getUser();
      }

      if (apiRes && (apiRes.name || apiRes.fullName || apiRes.mobileNumber || apiRes.mobile || apiRes.pan || apiRes.aadhaar)) {
        const mergedCust: Customer = {
          name: apiRes.name || apiRes.fullName || currentCustomer?.name || "",
          email: apiRes.email || currentCustomer?.email || "",
          mobile: apiRes.mobileNumber || apiRes.mobile || currentCustomer?.mobile || activeMobile || "",
          pan: apiRes.pan || currentCustomer?.pan || "",
          aadhaar: apiRes.aadhaar || currentCustomer?.aadhaar || "",
          dob: apiRes.dob || apiRes.dateOfBirth || currentCustomer?.dob || "",
          customerType: apiRes.customerType || apiRes.custType || currentCustomer?.customerType || "Individual",
          addressLine1: apiRes.addressLine1 || currentCustomer?.addressLine1 || "",
          addressLine2: apiRes.addressLine2 || currentCustomer?.addressLine2 || "",
          city: apiRes.city || currentCustomer?.city || "",
          state: apiRes.state || currentCustomer?.state || "",
          pincode: apiRes.pincode || apiRes.pinCode || currentCustomer?.pincode || "",
          address: apiRes.address || currentCustomer?.address || "",
          customerId: apiRes.custId || apiRes.customerId || currentCustomer?.customerId || activeCustId || "",
          avatarUri: currentCustomer?.avatarUri || null,
          profileCompleted: true,
          hasPasscode: currentCustomer?.hasPasscode ?? Boolean(currentAuthUser?.passcode),
        };
        currentCustomer = mergedCust;
        useAuthStore.setState({ customer: mergedCust, profileCompleted: true });
        try {
          useCustomerStore.getState().setProfile(mergedCust);
        } catch {}
      }

      if (!currentCustomer && !currentAuthUser && !apiRes) {
        setProfileFetchError("Unable to load your profile information.");
        return null;
      }

      const rawPan = apiRes?.pan || currentCustomer?.pan || (currentAuthUser as any)?.pan || "";
      const rawAadhaar = apiRes?.aadhaar || currentCustomer?.aadhaar || (currentAuthUser as any)?.aadhaar || "";
      const rawDob = apiRes?.dob || apiRes?.dateOfBirth || currentCustomer?.dob || (currentAuthUser as any)?.dob || "";
      const rawMobile = apiRes?.mobileNumber || apiRes?.mobile || currentCustomer?.mobile || (currentAuthUser as any)?.mobileNumber || "";
      const rawEmail = apiRes?.email || currentCustomer?.email || (currentAuthUser as any)?.email || "";
      const rawName = apiRes?.name || apiRes?.fullName || currentCustomer?.name || (currentAuthUser as any)?.name || "";

      let rawAddress = apiRes?.addressLine1 || currentCustomer?.addressLine1 || apiRes?.address || currentCustomer?.address || "";
      if (apiRes?.addressLine2 || currentCustomer?.addressLine2) {
        const line2 = apiRes?.addressLine2 || currentCustomer?.addressLine2;
        rawAddress = rawAddress ? `${rawAddress}, ${line2}` : line2;
      }

      const rawCity = apiRes?.city || currentCustomer?.city || "";
      const rawState = apiRes?.state || currentCustomer?.state || "";
      const rawPin = apiRes?.pincode || apiRes?.pinCode || currentCustomer?.pincode || "";

      const populatedPersonal: PersonalDetails = {
        fullName: rawName,
        pan: rawPan,
        aadhaar: rawAadhaar,
        dob: rawDob,
        mobileNumber: rawMobile,
        email: rawEmail,
        residentialAddress: rawAddress,
        city: rawCity,
        state: rawState,
        pinCode: rawPin,
      };

      setFormData((prev) => ({
        ...prev,
        personal: populatedPersonal,
        bank: {
          ...prev.bank,
          accountHolderName: prev.bank.accountHolderName || rawName,
        },
      }));

      return populatedPersonal;
    } catch (e: any) {
      setProfileFetchError(e?.message || "Failed to load profile.");
      return null;
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Restore draft or populate profile on mount
  useEffect(() => {
    async function loadData() {
      // 1. Always fetch fresh personal details from database first
      const freshPersonal = await fetchAndPopulateProfile();

      const currentMobile = useAuthStore.getState().customer?.mobile ||
        authStorage.getSession().activeMobile ||
        useAuthStore.getState().mobileNumber ||
        freshPersonal?.mobileNumber;

      const custId = getTdsCustId(freshPersonal?.mobileNumber);

      // 2. Fetch existing TDS Refund application from backend if available
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
        console.warn("[TDS Screen] Backend fetch warning:", err);
      }

      // 3. Fallback to local draft if exists
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

  // Save edited profile back to stores & backend
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

    const updatedCustomer: Customer = {
      name: normalizedPersonal.fullName,
      email: normalizedPersonal.email,
      mobile: cleanMob || normalizedPersonal.mobileNumber,
      pan: normalizedPersonal.pan,
      aadhaar: normalizedPersonal.aadhaar,
      dob: normalizedPersonal.dob,
      customerType: currentCust?.customerType || "Individual",
      addressLine1: normalizedPersonal.residentialAddress,
      addressLine2: currentCust?.addressLine2 || "",
      city: normalizedPersonal.city,
      state: normalizedPersonal.state,
      pincode: normalizedPersonal.pinCode,
      address: `${normalizedPersonal.residentialAddress}, ${normalizedPersonal.city}, ${normalizedPersonal.state} - ${normalizedPersonal.pinCode}`,
      customerId: currentCust?.customerId || (currentAuthUser as any)?.customerId || (currentAuthUser as any)?.custId || "",
      avatarUri: currentCust?.avatarUri || null,
      profileCompleted: true,
      hasPasscode: currentCust?.hasPasscode ?? Boolean(currentAuthUser?.passcode),
    };

    useAuthStore.setState({ customer: updatedCustomer, profileCompleted: true });
    try {
      useCustomerStore.getState().setProfile(updatedCustomer);
    } catch {}

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
    } catch {}

    // Hit backend PUT /customer/update endpoint
    try {
      console.log("🚀 [TDS Form] Calling authApi.updateCustomerProfile for customer:", updatedCustomer.mobile);
      const updateResult = await authApi.updateCustomerProfile({
        custId: updatedCustomer.customerId || undefined,
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        mobileNumber: updatedCustomer.mobile,
        pan: updatedCustomer.pan,
        aadhaar: updatedCustomer.aadhaar,
        dob: updatedCustomer.dob,
        addressLine1: updatedCustomer.addressLine1,
        addressLine2: updatedCustomer.addressLine2,
        city: updatedCustomer.city,
        state: updatedCustomer.state,
        pincode: updatedCustomer.pincode,
        address: updatedCustomer.address,
      });

      if (updateResult.success) {
        console.log("✅ [TDS Form] Customer profile updated successfully on backend!");
      } else {
        console.warn("⚠️ [TDS Form] Customer profile update warning from backend:", updateResult.message);
      }
    } catch (err: any) {
      console.warn("⚠️ [TDS Form] Error sending customer update to backend:", err?.message);
    }

    await tdsDraftService.saveFormDraft(nextFormState);
  };

  // Live calculation estimate
  const liveCalculation = tdsCalculationService.calculate(formData);

  // Field updater helpers
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

  // IFSC Auto-Lookup
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
      } catch {
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

  // Submit and move to Step 2 (Documents)
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

    // Keep the local draft regardless, so nothing typed is lost if the server save fails
    await tdsDraftService.saveFormDraft(formData);

    try {
      const custId = getTdsCustId(formData.personal.mobileNumber);
      const existingAppId = await tdsDraftService.getApplicationId();

      // Bank -> income -> taxes paid; any non-2xx rejects and stops the flow
      const savedTdsId = await tdsApiService.saveFullTdsApplication(
        formData,
        [],
        custId,
        existingAppId || undefined
      );
      await tdsDraftService.saveApplicationId(savedTdsId);
    } catch (err) {
      console.error("[TDS Screen] Backend save failed:", err);
      Alert.alert("Unable to Save Application", describeSaveError(err));
      return;
    } finally {
      isSavingRef.current = false;
    }

    markSubmitted();
    router.push("/service/tds-checklist" as any);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
    >
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header Bar */}
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={20} color={BrandColors.PRIMARY_BLUE_DARK} />
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>TDS Refund</Text>
          <Text style={styles.headerSubtitle}>Step 1 of 5: Customer & Income</Text>
        </View>

        <View style={styles.headerRightSpacer} />
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>

      {/* Main Form Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 85 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Dynamic Preliminary Estimate Pill */}
        <View style={styles.previewEstimateBanner}>
          <View style={styles.previewLeft}>
            <Text style={styles.previewLabel}>
              {liveCalculation.isAdditionalTaxPayable
                ? "Preliminary Tax Payable"
                : "Preliminary Estimated Refund"}
            </Text>
            <Text style={styles.previewAmount}>
              {liveCalculation.isAdditionalTaxPayable
                ? formatCurrency(liveCalculation.estimatedTaxPayable)
                : formatCurrency(liveCalculation.estimatedRefund)}
            </Text>
          </View>
          <View style={styles.previewRight}>
            <Text style={styles.previewTag}>AY 2025-26</Text>
          </View>
        </View>

        <PersonalInfoSection
          personal={formData.personal}
          isLoading={isProfileLoading}
          errorMessage={profileFetchError}
          onRetry={fetchAndPopulateProfile}
          onSaveProfile={handleSaveProfile}
        />

        <RefundBankAccountSection
          bank={formData.bank}
          errors={errors}
          inputs={inputRefs}
          isIfscLoading={isIfscLoading}
          ifscError={ifscError}
          updateBank={updateBank}
          onIfscChange={handleIfscChange}
        />

        <IncomeTaxInfoSection income={formData.income} inputs={inputRefs} updateIncome={updateIncome} />

        <TdsTaxesPaidSection
          income={formData.income}
          errors={errors}
          inputs={inputRefs}
          updateIncome={updateIncome}
        />
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 14 }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleContinue}
          style={styles.ctaButton}
        >
          <Text style={styles.ctaButtonText}>Continue to Documents</Text>
          <Ionicons name="arrow-forward" size={18} color={BrandColors.WHITE} />
        </TouchableOpacity>
      </View>

      {/* Universal Save As Draft Confirmation Modal */}
      <UniversalDraftModal
        visible={showDraftModal}
        title="Save Application Progress?"
        message="You have unsaved changes in your TDS refund application. Save your progress so you can resume anytime without re-entering details."
        saveButtonText="Save as Draft & Exit"
        discardButtonText="Discard & Exit"
        cancelButtonText="Keep Editing"
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        onCancel={handleCancel}
      />
    </KeyboardAvoidingView>
  );
};

export default TdsRefundFormScreen;
