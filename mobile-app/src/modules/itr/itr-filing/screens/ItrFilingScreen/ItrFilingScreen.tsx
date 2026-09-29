import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Step0CategorySelect } from "../../components/Step0CategorySelect/Step0CategorySelect";
import { ItrStepIndicator } from "../../components/ItrStepIndicator/ItrStepIndicator";
import { Step1PersonalInfo } from "../../components/Step1PersonalInfo/Step1PersonalInfo";
import { Step2IncomeSources } from "../../components/Step2IncomeSources/Step2IncomeSources";
import { Step3RegimeAndDeductions } from "../../components/Step3RegimeAndDeductions/Step3RegimeAndDeductions";
import { Step4DocumentChecklist } from "../../components/Step4DocumentChecklist/Step4DocumentChecklist";
import { Step5TaxSummaryReview } from "../../components/Step5TaxSummaryReview/Step5TaxSummaryReview";
import { useITRStore } from "@/modules/itr/store/itrStore";
import { useApplicationStore } from "@/store/applicationStore";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { styles } from "./ItrFilingScreen.styles";

export const ItrFilingScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store bindings
  const currentStep = useITRStore((state) => state.currentStep);
  const setStep = useITRStore((state) => state.setStep);
  const formData = useITRStore((state) => state.formData);

  const setCategory = useITRStore((state) => state.setCategory);
  const setPersonalInfo = useITRStore((state) => state.setPersonalInfo);
  const selectRefundBank = useITRStore((state) => state.selectRefundBank);
  const addBankAccount = useITRStore((state) => state.addBankAccount);
  const setBankDetails = useITRStore((state) => state.setBankDetails);
  const setPriorItrNotice = useITRStore((state) => state.setPriorItrNotice);
  const importPriorItrData = useITRStore((state) => state.importPriorItrData);
  const setIncomeSalary = useITRStore((state) => state.setIncomeSalary);
  const setIncomeHouseProperty = useITRStore((state) => state.setIncomeHouseProperty);
  const setIncomeBusiness = useITRStore((state) => state.setIncomeBusiness);
  const setIncomeCapitalGains = useITRStore((state) => state.setIncomeCapitalGains);
  const setIncomeOtherSources = useITRStore((state) => state.setIncomeOtherSources);
  const setRegime = useITRStore((state) => state.setRegime);
  const setDeductions = useITRStore((state) => state.setDeductions);
  const setDeclarationAccepted = useITRStore((state) => state.setDeclarationAccepted);
  const updateDocument = useITRStore((state) => state.updateDocument);

  const saveItrDraft = useITRStore((state) => state.saveItrDraft);
  const clearItrDraft = useITRStore((state) => state.clearItrDraft);
  const resetForm = useITRStore((state) => state.resetForm);

  const createApplication = useApplicationStore((state) => state.createApplication);

  const [isCategoryConfirmed, setIsCategoryConfirmed] = useState<boolean>(() => currentStep > 0);

  // Universal Draft Guard Hook
  const {
    showDraftModal,
    openDraftModal,
    markSubmitted,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
  } = useUniversalDraftGuard({
    isDirty: () => {
      const hasIncome = formData.calculation.grossTotalIncome > 0;
      const hasDocs = formData.documents.some((d) => Boolean(d.fileUri));
      return hasIncome || hasDocs || currentStep > 0 || isCategoryConfirmed;
    },
    onSaveDraft: () => {
      saveItrDraft();
    },
    onDiscardDraft: () => {
      clearItrDraft();
      resetForm();
    },
    isSubmitted: () => currentStep >= 5,
  });

  // Scroll to top on step transition
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentStep]);

  // Restore saved draft and last saved step on entry, then sync profile
  useEffect(() => {
    async function init() {
      const restored = await useITRStore.getState().restoreItrDraft();
      if (restored) {
        const restoredStep = useITRStore.getState().currentStep;
        if (restoredStep > 0) {
          setIsCategoryConfirmed(true);
        }
      }
      await useITRStore.getState().fetchAndPopulateUserProfile();
    }
    init();
  }, []);

  const handleBack = () => {
    if (!isCategoryConfirmed) {
      const hasData = formData.calculation.grossTotalIncome > 0 || formData.documents.some((d) => Boolean(d.fileUri));
      if (hasData) {
        openDraftModal();
      } else {
        router.back();
      }
      return;
    }
    if (currentStep > 0) {
      setStep(currentStep - 1);
    } else {
      setIsCategoryConfirmed(false);
    }
  };

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    try {
      const uploadedDocItems = formData.documents
        .filter((d) => Boolean(d.fileUri) || d.isProfileVerified)
        .map((d) => ({
          id: d.id,
          name: d.name,
          fileUri: d.fileUri || "verified://profile",
          status: "Uploaded" as const,
          uploadedAt: d.uploadedAt || new Date().toISOString(),
        }));

      const serviceTitle = `ITR Filing - ${formData.determinedForm.formTitle}`;

      const generatedAppId = createApplication(
        "itr-filing",
        serviceTitle,
        "ITR",
        {
          assessmentYear: formData.personalInfo.assessmentYear,
          filingType: formData.personalInfo.filingType,
          formType: formData.determinedForm.form,
          formTitle: formData.determinedForm.formTitle,
          pan: formData.personalInfo.pan,
          name: formData.personalInfo.name,
          mobile: formData.personalInfo.mobile,
          email: formData.personalInfo.email,
          residentialStatus: formData.personalInfo.residentialStatus,
          bankName: formData.bankDetails.bankName,
          accountNumber: formData.bankDetails.accountNumber,
          ifscCode: formData.bankDetails.ifscCode,
          accountType: formData.bankDetails.accountType,
          regime: formData.regime,
          grossTotalIncome: formData.calculation.grossTotalIncome,
          totalDeductions: formData.calculation.totalDeductions,
          taxableIncome: formData.calculation.taxableIncome,
          totalTaxLiability: formData.calculation.totalTaxLiability,
          totalTaxesPaid: formData.calculation.totalTaxesPaid,
          finalAmount: formData.calculation.finalAmount,
          finalType: formData.calculation.finalType,
          hasPreviousItr: formData.priorItrNotice.hasPreviousItr,
          previousAckNumber: formData.priorItrNotice.previousAckNumber,
          hasTaxNotice: formData.priorItrNotice.hasTaxNotice,
        },
        uploadedDocItems,
        999, // service fee
        "Pending"
      );

      markSubmitted();
      clearItrDraft();
      setIsSubmitting(false);

      // Derive active income sources for summary
      const activeIncomeLabels = [
        formData.incomeSources.salary.enabled ? "Salary" : null,
        formData.incomeSources.business.enabled ? "Business" : null,
        formData.incomeSources.houseProperty.enabled ? "House Property" : null,
        formData.incomeSources.capitalGains.enabled ? "Capital Gains" : null,
        formData.incomeSources.otherSources.enabled ? "Other Income" : null,
      ].filter(Boolean) as string[];

      const incomeSourcesSummary = activeIncomeLabels.join(" • ") || "Declared Income";
      const verifiedOrUploadedCount = formData.documents.filter(
        (d) => Boolean(d.fileUri) || d.isProfileVerified
      ).length;
      const totalDocsCount = formData.documents.length;
      const maskedBank = formData.bankDetails.bankName
        ? `${formData.bankDetails.bankName} •••• ${formData.bankDetails.accountNumber.slice(-4)}`
        : "Primary Refund Bank";

      // Navigate to Success Screen with synchronized parameters
      router.replace({
        pathname: "/service/itr-success" as any,
        params: {
          applicationId: generatedAppId,
          serviceTitle,
          assessmentYear: formData.personalInfo.assessmentYear,
          formType: formData.determinedForm.form,
          incomeType: incomeSourcesSummary,
          regime: formData.regime === "new" ? "New Tax Regime" : "Old Tax Regime",
          uploadedDocsCount: String(verifiedOrUploadedCount),
          totalDocsCount: String(totalDocsCount),
          refundBank: maskedBank,
        },
      });
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert("Submission Error", err?.message || "Could not submit application. Please try again.");
    }
  };

  if (!isCategoryConfirmed) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.categoryHeader}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerLeftBtn}
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.categoryHeaderTitle}>ITR Filing</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerRightBtn}
            onPress={() =>
              Alert.alert("TaxEdge Support", "Need help with your ITR? Contact support@taxedge.in")
            }
          >
            <Ionicons name="settings-outline" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        <Step0CategorySelect
          selectedCategory={formData.category}
          accountType={formData.accountType}
          onSelectCategory={setCategory}
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
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header & Step Progress Bar */}
      <ItrStepIndicator
        currentStep={currentStep}
        totalSteps={5}
        stepTitle={formData.determinedForm.form}
        onBack={handleBack}
        onSettings={() =>
          Alert.alert("TaxEdge Support", "Need help with your ITR? Contact support@taxedge.in")
        }
      />

      {/* Main Content Area */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Step 1: Personal Information, AY & Bank (Pre-filled from DB/GST) */}
        {currentStep === 0 && (
          <Step1PersonalInfo
            personalInfo={formData.personalInfo}
            onUpdatePersonalInfo={setPersonalInfo}
            bankDetails={formData.bankDetails}
            bankAccountsList={formData.bankAccountsList}
            onSelectRefundBank={selectRefundBank}
            onAddBankAccount={addBankAccount}
            priorItrNotice={formData.priorItrNotice}
            onUpdatePriorItrNotice={setPriorItrNotice}
            onImportPriorItrData={importPriorItrData}
            onContinue={() => setStep(1)}
          />
        )}

        {/* Step 2: Income Sources & Smart ITR Form Determination */}
        {currentStep === 1 && (
          <Step2IncomeSources
            sources={formData.incomeSources}
            determinedForm={formData.determinedForm}
            gstReconciliation={formData.gstReconciliation}
            category={formData.category}
            onSwitchCategory={setCategory}
            onUpdateSalary={setIncomeSalary}
            onUpdateHouseProperty={setIncomeHouseProperty}
            onUpdateBusiness={setIncomeBusiness}
            onUpdateCapitalGains={setIncomeCapitalGains}
            onUpdateOtherSources={setIncomeOtherSources}
            onContinue={() => setStep(2)}
          />
        )}

        {/* Step 3: Tax Regime & Structured Deductions */}
        {currentStep === 2 && (
          <Step3RegimeAndDeductions
            regime={formData.regime}
            onChangeRegime={setRegime}
            deductions={formData.deductions}
            onChangeDeductions={setDeductions}
            calculation={formData.calculation}
            assessmentYear={formData.personalInfo.assessmentYear}
            onContinue={() => setStep(3)}
          />
        )}

        {/* Step 4: Dynamic Document Checklist & Upload */}
        {currentStep === 3 && (
          <Step4DocumentChecklist
            documents={formData.documents}
            onUpdateDocument={updateDocument}
            onContinue={() => setStep(4)}
          />
        )}

        {/* Step 5: Tax Calculation Engine & Pre-Submission Review */}
        {currentStep === 4 && (
          <Step5TaxSummaryReview
            formData={formData}
            isSubmitting={isSubmitting}
            onEditStep={(stepIdx) => setStep(stepIdx)}
            onToggleDeclaration={setDeclarationAccepted}
            onSubmit={handleSubmitApplication}
          />
        )}
      </ScrollView>

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
