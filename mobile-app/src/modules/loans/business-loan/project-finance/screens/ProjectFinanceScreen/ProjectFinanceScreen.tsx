import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import {
  ProjectFinanceHeader,
  ProjectFinanceSuccessModal,
} from "../../components";
import { ProjectFinanceStepRenderer } from "./ProjectFinanceStepRenderer";
import { useProjectFinanceState } from "./useProjectFinanceState";
import { validateStep1, validateStep2 } from "../../utils/projectFinanceValidators";
import { validateStep3, validateStep4 } from "../../utils/step3And4Validators";
import {
  validateStep5,
  validateStep6,
  validateStep7,
} from "../../utils/step5To7Validators";
import { styles } from "./ProjectFinanceScreen.styles";

const STEP_TITLES = [
  "Applicant & Project",
  "Location, Land & Technical",
  "Cost & Funding Details",
  "Market & Financials",
  "Loan Requirement & Repayment",
  "Security & Compliance",
  "Documents, Review & Submit",
];

export const ProjectFinanceScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const state = useProjectFinanceState();

  const handleNextOrSubmit = () => {
    if (currentStepIndex === 0) {
      const err = validateStep1({
        applicantDetails: state.applicantDetails,
        registeredAddress: state.registeredAddress,
        promoters: state.promoters,
        projectClassification: state.projectClassification,
      });
      if (err) {
        Alert.alert("Missing / Invalid Information", err);
        return;
      }
    } else if (currentStepIndex === 1) {
      const err = validateStep2({
        projectLocation: state.projectLocation,
        landDetails: state.landDetails,
        parcels: state.parcels,
        rightOfWay: state.rightOfWay,
        utilities: state.utilities,
        technicalDetails: state.technicalDetails,
        capacityProduction: state.capacityProduction,
        machineries: state.machineries,
        rawMaterials: state.rawMaterials,
        epcExecution: state.epcExecution,
        milestones: state.milestones,
        manpower: state.manpower,
      });
      if (err) {
        Alert.alert("Missing / Invalid Information", err);
        return;
      }
    } else if (currentStepIndex === 2) {
      const err = validateStep3({
        projectCost: state.projectCost,
        meansOfFinance: state.meansOfFinance,
        disbursementSchedule: state.disbursementSchedule,
      });
      if (err) {
        Alert.alert("Missing / Invalid Information", err);
        return;
      }
    } else if (currentStepIndex === 3) {
      const err = validateStep4({
        products: state.products,
        marketDetails: state.marketDetails,
        customers: state.customers,
        projectionSetup: state.projectionSetup,
        workingCapital: state.workingCapital,
      });
      if (err) {
        Alert.alert("Missing / Invalid Information", err);
        return;
      }
    } else if (currentStepIndex === 4) {
      const err = validateStep5({
        loanRequirement: state.loanRequirement,
        repaymentDetails: state.repaymentDetails,
        repaymentSources: state.repaymentSources,
        totalProjectCostFromScreen3: state.projectCost.totalProjectCost,
        ownContributionFromScreen3: state.meansOfFinance.promotersEquity,
      });
      if (err) {
        Alert.alert("Missing / Invalid Information", err);
        return;
      }
    } else if (currentStepIndex === 5) {
      const err = validateStep6({
        securities: state.securities,
        regulatoryCompliance: state.regulatoryCompliance,
      });
      if (err) {
        Alert.alert("Missing / Invalid Information", err);
        return;
      }
    } else if (currentStepIndex === 6) {
      const err = validateStep7({
        documents: state.documents,
        agreeAccuracy: state.agreeAccuracy,
        agreeVerification: state.agreeVerification,
      });
      if (err) {
        Alert.alert("Missing / Invalid Information", err);
        return;
      }
      state.setShowSuccessModal(true);
      return;
    }

    setCurrentStepIndex((prev) => (prev < 6 ? prev + 1 : prev));
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* Top Header with Circle Back Button & Progress Bar matching design */}
      <ProjectFinanceHeader
        onBack={handleBack}
        title="Project Finance"
        currentStep={currentStepIndex + 1}
        totalSteps={7}
        stepTitle={STEP_TITLES[currentStepIndex]}
      />

      <View style={styles.mainContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ProjectFinanceStepRenderer
            currentStepIndex={currentStepIndex}
            state={state}
            setCurrentStepIndex={(idx) => {
              setCurrentStepIndex(idx);
              scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }}
          />
        </ScrollView>

        {/* Sticky Bottom Action Bar */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 14) },
          ]}
        >
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleNextOrSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>
              {currentStepIndex === 6 ? "Submit Application" : "Save & Continue"}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Success Modal */}
      <ProjectFinanceSuccessModal
        visible={state.showSuccessModal}
        onClose={() => {
          state.setShowSuccessModal(false);
          router.back();
        }}
      />
    </View>
  );
};

export default ProjectFinanceScreen;
