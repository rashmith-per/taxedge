import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  BackHandler,
  ActivityIndicator,
} from "react-native";
import { BrandColors } from "@/shared/theme";
import { KeyboardAwareScrollView } from "@/shared/components/KeyboardAwareFormLayout";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Step0CategorySelect } from "../../components/Step0CategorySelect/Step0CategorySelect";
import { ItrStepIndicator } from "../../components/ItrStepIndicator/ItrStepIndicator";
import { Step1PersonalInfo } from "../../components/Step1PersonalInfo/Step1PersonalInfo";
import { Step2IncomeSources } from "../../components/Step2IncomeSources/Step2IncomeSources";
import { Step4DocumentChecklist } from "../../components/Step4DocumentChecklist/Step4DocumentChecklist";
import { Step5TaxSummaryReview } from "../../components/Step5TaxSummaryReview/Step5TaxSummaryReview";
import { useITRStore } from "@/modules/itr/store/itrStore";
import { useApplicationStore } from "@/store/applicationStore";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { useItrFilingWorkflow } from "../../hooks/useItrFilingWorkflow";
import { styles } from "./ItrFilingScreen.styles";

export const ItrFilingScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ step?: string; resume?: string }>();
  const scrollViewRef = useRef<any>(null);
  const targetSectionRef = useRef<string | null>(null);
  const step1ContainerYRef = useRef<number | null>(null);
  const sectionRelativeYRef = useRef<Record<string, number | null>>({});
  // Set to true only when the user explicitly taps a category card.
  // Never set by auto-populated profile data, so it is safe to use as the sole
  // dirty indicator for the category selection screen.
  const categorySelectedRef = useRef(false);
  const hasUserEditedRef = useRef(false);
  const scrollAnimFrameRef = useRef<number | null>(null);

  // Store bindings
  const currentStep = useITRStore((state) => state.currentStep);
  const maxStepReached = useITRStore((state) => state.maxStepReached);
  const setStep = useITRStore((state) => state.setStep);
  const setBackendIds = useITRStore((state) => state.setBackendIds);
  const formData = useITRStore((state) => state.formData);

  const setCategory = useITRStore((state) => state.setCategory);
  const setPersonalInfo = useITRStore((state) => state.setPersonalInfo);
  const selectRefundBank = useITRStore((state) => state.selectRefundBank);
  const addBankAccount = useITRStore((state) => state.addBankAccount);
  const updateBankAccount = useITRStore((state) => state.updateBankAccount);
  const setPriorItrNotice = useITRStore((state) => state.setPriorItrNotice);
  const importPriorItrData = useITRStore((state) => state.importPriorItrData);
  const setIncomeSalary = useITRStore((state) => state.setIncomeSalary);
  const setIncomeHouseProperty = useITRStore((state) => state.setIncomeHouseProperty);
  const setIncomeBusiness = useITRStore((state) => state.setIncomeBusiness);
  const setIncomeCapitalGains = useITRStore((state) => state.setIncomeCapitalGains);
  const setIncomeOtherSources = useITRStore((state) => state.setIncomeOtherSources);
  const setDeclarationAccepted = useITRStore((state) => state.setDeclarationAccepted);
  const updateDocument = useITRStore((state) => state.updateDocument);

  const saveItrDraft = useITRStore((state) => state.saveItrDraft);
  const clearItrDraft = useITRStore((state) => state.clearItrDraft);
  const resetForm = useITRStore((state) => state.resetForm);

  const createApplication = useApplicationStore((state) => state.createApplication);

  const [isHydrating, setIsHydrating] = useState<boolean>(true);
  const [isCategoryConfirmed, setIsCategoryConfirmed] = useState<boolean>(false);

  // Wrapper around setCategory that marks the selection as user-initiated.
  // Only this handler (not auto-population) must call setCategory so that
  // categorySelectedRef accurately reflects explicit user interaction.
  const handleSelectCategory = useCallback(
    (category: Parameters<typeof setCategory>[0]) => {
      categorySelectedRef.current = true;
      hasUserEditedRef.current = true;
      setCategory(category);
    },
    [setCategory]
  );

  const handleUpdatePersonalInfo = useCallback((info: Parameters<typeof setPersonalInfo>[0]) => {
    hasUserEditedRef.current = true;
    setPersonalInfo(info);
  }, [setPersonalInfo]);

  const handleSelectRefundBank = useCallback((bank: Parameters<typeof selectRefundBank>[0]) => {
    hasUserEditedRef.current = true;
    selectRefundBank(bank);
  }, [selectRefundBank]);

  const handleAddBankAccount = useCallback((account: Parameters<typeof addBankAccount>[0]) => {
    hasUserEditedRef.current = true;
    addBankAccount(account);
  }, [addBankAccount]);

  const handleUpdateBankAccount = useCallback((account: Parameters<typeof updateBankAccount>[0]) => {
    hasUserEditedRef.current = true;
    updateBankAccount(account);
  }, [updateBankAccount]);

  const handleUpdatePriorItrNotice = useCallback((notice: Parameters<typeof setPriorItrNotice>[0]) => {
    hasUserEditedRef.current = true;
    setPriorItrNotice(notice);
  }, [setPriorItrNotice]);

  const handleImportPriorItrData = useCallback((data: Parameters<typeof importPriorItrData>[0]) => {
    hasUserEditedRef.current = true;
    importPriorItrData(data);
  }, [importPriorItrData]);

  const handleUpdateSalary = useCallback((s: Parameters<typeof setIncomeSalary>[0]) => {
    hasUserEditedRef.current = true;
    setIncomeSalary(s);
  }, [setIncomeSalary]);

  const handleUpdateHouseProperty = useCallback((hp: Parameters<typeof setIncomeHouseProperty>[0]) => {
    hasUserEditedRef.current = true;
    setIncomeHouseProperty(hp);
  }, [setIncomeHouseProperty]);

  const handleUpdateBusiness = useCallback((b: Parameters<typeof setIncomeBusiness>[0]) => {
    hasUserEditedRef.current = true;
    setIncomeBusiness(b);
  }, [setIncomeBusiness]);

  const handleUpdateCapitalGains = useCallback((cg: Parameters<typeof setIncomeCapitalGains>[0]) => {
    hasUserEditedRef.current = true;
    setIncomeCapitalGains(cg);
  }, [setIncomeCapitalGains]);

  const handleUpdateOtherSources = useCallback((os: Parameters<typeof setIncomeOtherSources>[0]) => {
    hasUserEditedRef.current = true;
    setIncomeOtherSources(os);
  }, [setIncomeOtherSources]);

  const handleUpdateDocument = useCallback((docId: string, fileInfo: any) => {
    hasUserEditedRef.current = true;
    updateDocument(docId, fileInfo);
  }, [updateDocument]);

  const isFormDirty = useCallback(() => {
    if (hasUserEditedRef.current || categorySelectedRef.current) return true;
    if (!isCategoryConfirmed) return categorySelectedRef.current;
    const p = formData.personalInfo;
    const hasAnyPersonal = Boolean(
      p.fatherSpouseName || p.gender || p.pan || p.aadhaar ||
      p.name || p.mobile || p.email || p.address || p.residentialStatus || p.filingType
    );
    const hasAnyBank = Boolean(
      formData.bankDetails?.accountNumber ||
      formData.bankDetails?.ifscCode ||
      formData.bankDetails?.bankName ||
      formData.bankAccountsList?.length > 0
    );
    const hasAnyIncome = (formData.calculation?.grossTotalIncome ?? 0) > 0 ||
      Boolean(formData.incomeSources?.salary?.grossSalary) ||
      Boolean(formData.incomeSources?.houseProperty?.annualRentReceived) ||
      Boolean(formData.incomeSources?.business?.grossTurnover) ||
      Boolean(formData.incomeSources?.otherSources?.savingsInterest);
    const hasAnyDocs = formData.documents.some((d) => Boolean(d.fileUri));
    return hasAnyPersonal || hasAnyBank || hasAnyIncome || hasAnyDocs || currentStep > 0;
  }, [formData, isCategoryConfirmed, currentStep]);

  // Universal Draft Guard Hook
  const {
    showDraftModal,
    openDraftModal,
    markSubmitted,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
  } = useUniversalDraftGuard({
    isDirty: isFormDirty,
    onSaveDraft: async () => {
      try {
        await saveItrDraft();
      } catch (error) {
        Alert.alert("Save Failed", "Could not save your draft. Please try again.");
        throw error;
      }
    },
    onDiscardDraft: () => {
      clearItrDraft();
      // resetForm() is NOT called here — the async clear sets _storageCleanFailed when needed,
      // and the next mount's init() calls resetForm() after restoreItrDraft() returns false.
    },
    isSubmitted: () => currentStep >= 4,
  });

  const {
    isSubmitting,
    handleStep1Continue,
    handleStep1Update,
    handleStep2Continue,
    handleStep2Update,
    handleStep3Continue,
    handleStep3Update,
    handleSubmitApplication,
  } = useItrFilingWorkflow({
    formData,
    setStep,
    setBackendIds,
    createApplication,
    markSubmitted,
    clearItrDraft,
    resetForm,
  });

  // Single coordinator: only scrolls when BOTH container and target section are measured for this mount
  const dispatchTargetedScrollIfReady = useCallback(() => {
    // 1. Guard against stale step (must be on Step 1)
    if (useITRStore.getState().currentStep !== 0) return;

    // 2. Guard against missing or cancelled target
    const target = targetSectionRef.current;
    if (!target) return;

    // 3. BOTH measurements must be available from the current mount
    const containerY = step1ContainerYRef.current;
    const relativeY = sectionRelativeYRef.current[target];
    if (typeof containerY !== "number" || typeof relativeY !== "number") {
      return; // Still waiting for the other layout measurement
    }

    // 4. Cancel any previous animation frame
    if (scrollAnimFrameRef.current !== null) {
      cancelAnimationFrame(scrollAnimFrameRef.current);
      scrollAnimFrameRef.current = null;
    }

    // 5. Calculate final offset relative to KeyboardAwareScrollView content container
    const finalY = containerY + relativeY;

    // 6. Clear target BEFORE scheduling the animation frame to guarantee only ONE dispatch occurs
    targetSectionRef.current = null;

    scrollAnimFrameRef.current = requestAnimationFrame(() => {
      if (useITRStore.getState().currentStep === 0) {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, finalY - 16),
          animated: true,
        });
      }
      scrollAnimFrameRef.current = null;
    });
  }, []);

  const handleSectionLayout = useCallback(
    (section: string, relativeY: number) => {
      sectionRelativeYRef.current[section] = relativeY;
      dispatchTargetedScrollIfReady();
    },
    [dispatchTargetedScrollIfReady]
  );

  const handleStep1ContainerLayout = useCallback(
    (e: { nativeEvent: { layout: { y: number } } }) => {
      step1ContainerYRef.current = e.nativeEvent.layout.y;
      dispatchTargetedScrollIfReady();
    },
    [dispatchTargetedScrollIfReady]
  );

  const handleEditStep = useCallback(
    (stepIdx: number, section?: string) => {
      if (scrollAnimFrameRef.current !== null) {
        cancelAnimationFrame(scrollAnimFrameRef.current);
        scrollAnimFrameRef.current = null;
      }
      targetSectionRef.current = section || null;
      // Invalidate measurements for the incoming mount so stale cached numbers cannot be used
      if (stepIdx === 0 && section) {
        step1ContainerYRef.current = null;
        sectionRelativeYRef.current[section] = null;
      }
      setStep(stepIdx);
    },
    [setStep]
  );

  // Scroll to top on step transition unless a section-targeted navigation is pending
  useEffect(() => {
    if (targetSectionRef.current) {
      // Targeted navigation is pending: do not scroll to 0.
      // Layout events (container + section) will coordinate the targeted scroll.
      return;
    }
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });

    return () => {
      if (scrollAnimFrameRef.current !== null) {
        cancelAnimationFrame(scrollAnimFrameRef.current);
        scrollAnimFrameRef.current = null;
      }
    };
  }, [currentStep]);

  // Restore saved draft on entry. For a fresh start, pre-fill personal info from auth profile.
  // fetchAndPopulateUserProfile is intentionally skipped when restoring a draft to avoid
  // overwriting the user's previously entered (and potentially corrected) personal details.
  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const restored = await useITRStore.getState().restoreItrDraft();
        if (!isMounted) return;
        if (restored) {
          setIsCategoryConfirmed(true);
          const state = useITRStore.getState();
          const targetStep = params.step !== undefined && !isNaN(Number(params.step))
            ? Number(params.step)
            : (state.currentStep ?? 0);
          setStep(targetStep);
        } else {
          useITRStore.getState().resetForm();
          setIsCategoryConfirmed(false);
          await useITRStore.getState().fetchAndPopulateUserProfile();
        }
      } catch {
        if (isMounted) {
          setIsCategoryConfirmed(false);
        }
      } finally {
        if (isMounted) {
          setIsHydrating(false);
        }
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, [params.step, setStep]);

  const handleBack = useCallback(() => {
    if (!isCategoryConfirmed) {
      if (isFormDirty()) {
        openDraftModal();
      } else {
        router.back();
      }
      return;
    }
    if (currentStep > 0) {
      setStep(currentStep - 1);
    } else {
      // Step 1: user wants to go back / exit the application.
      // If dirty, prompt Save as Draft modal!
      if (isFormDirty()) {
        openDraftModal();
      } else {
        setIsCategoryConfirmed(false);
      }
    }
  }, [isCategoryConfirmed, isFormDirty, openDraftModal, router, currentStep, setStep]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (!isCategoryConfirmed) {
          if (isFormDirty()) {
            openDraftModal();
            return true;
          }
          return false;
        }
        if (currentStep > 0) {
          setStep(currentStep - 1);
          return true;
        }
        if (isFormDirty()) {
          openDraftModal();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [currentStep, isCategoryConfirmed, isFormDirty, openDraftModal, setStep])
  );

  if (isHydrating) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <FocusAwareStatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={BrandColors.PRIMARY_BLUE} testID="itr-hydration-loader" />
      </View>
    );
  }

  if (!isCategoryConfirmed) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <FocusAwareStatusBar barStyle="dark-content" />
        <View style={styles.categoryHeader}>
          {currentStep === 4 ? (
            <View style={styles.headerSpacer} />
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.headerLeftBtn}
              onPress={handleBack}
            >
              <Ionicons name="chevron-back" size={20} color="#0F172A" />
            </TouchableOpacity>
          )}
          <Text style={styles.categoryHeaderTitle}>ITR Filing</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerRightBtn}
            onPress={() =>
              Alert.alert("Finsolz Support", "Need help with your ITR? Contact support@finsolz.in")
            }
          >
            <Ionicons name="settings-outline" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        <Step0CategorySelect
          selectedCategory={formData.category}
          accountType={formData.accountType}
          onSelectCategory={handleSelectCategory}
          onStartApplication={() => {
            setIsCategoryConfirmed(true);
            setStep(0);
          }}
        />

        <UniversalDraftModal
          visible={showDraftModal}
          onSaveAndExit={handleSaveAndExit}
          onDiscardAndExit={handleDiscardAndExit}
          onCancel={handleCancel}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FocusAwareStatusBar barStyle="dark-content" />

      {/* Top Header & Step Progress Bar */}
      <ItrStepIndicator
        currentStep={currentStep}
        totalSteps={4}
        stepTitle={formData.determinedForm.form}
        hideBackButton={maxStepReached >= 3 && currentStep < 3}
        onBack={handleBack}
        onSaveDraft={openDraftModal}
        onSettings={() => Alert.alert("Finsolz Support", "Need help with your ITR? Contact support@finsolz.in")}
      />

      {/* Main Content Area */}
      <KeyboardAwareScrollView
        ref={scrollViewRef as any}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Step 1: Personal Information, AY & Bank (Pre-filled from DB/GST) */}
        {currentStep === 0 && (
          <View onLayout={handleStep1ContainerLayout}>
            <Step1PersonalInfo
              isLoading={isSubmitting}
              isEditing={maxStepReached >= 3}
              personalInfo={formData.personalInfo}
              onUpdatePersonalInfo={handleUpdatePersonalInfo}
              bankDetails={formData.bankDetails}
              bankAccountsList={formData.bankAccountsList}
              onSelectRefundBank={handleSelectRefundBank}
              onAddBankAccount={handleAddBankAccount}
              onUpdateBankAccount={handleUpdateBankAccount}
              priorItrNotice={formData.priorItrNotice}
              onUpdatePriorItrNotice={handleUpdatePriorItrNotice}
              onImportPriorItrData={handleImportPriorItrData}
              onContinue={handleStep1Continue}
              onUpdateAndContinue={handleStep1Update}
              onSectionLayout={handleSectionLayout}
            />
          </View>
        )}

        {/* Step 2: Income Sources & Smart ITR Form Determination */}
        {currentStep === 1 && (
          <Step2IncomeSources
            isLoading={isSubmitting}
            isEditing={maxStepReached >= 3}
            sources={formData.incomeSources}
            determinedForm={formData.determinedForm}
            gstReconciliation={formData.gstReconciliation}
            category={formData.category}
            onSwitchCategory={handleSelectCategory}
            onUpdateSalary={handleUpdateSalary}
            onUpdateHouseProperty={handleUpdateHouseProperty}
            onUpdateBusiness={handleUpdateBusiness}
            onUpdateCapitalGains={handleUpdateCapitalGains}
            onUpdateOtherSources={handleUpdateOtherSources}
            onContinue={handleStep2Continue}
            onUpdateAndContinue={handleStep2Update}
          />
        )}

        {/* Step 3: Dynamic Document Checklist & Upload */}
        {currentStep === 2 && (
          <Step4DocumentChecklist
            isLoading={isSubmitting}
            isEditing={maxStepReached >= 3}
            documents={formData.documents}
            onUpdateDocument={handleUpdateDocument}
            onContinue={handleStep3Continue}
            onUpdateAndContinue={handleStep3Update}
          />
        )}

        {/* Step 4: Tax Calculation Engine & Pre-Submission Review */}
        {currentStep === 3 && (
          <Step5TaxSummaryReview
            formData={formData}
            isSubmitting={isSubmitting}
            onEditStep={handleEditStep}
            onToggleDeclaration={setDeclarationAccepted}
            onSubmit={handleSubmitApplication}
          />
        )}
      </KeyboardAwareScrollView>

      {/* Universal Draft Guard Modal */}
      <UniversalDraftModal
        visible={showDraftModal}
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        onCancel={handleCancel}
      />
    </View>
  );
};

export default ItrFilingScreen;
