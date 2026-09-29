import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  BackHandler,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SuccessCelebrationHeader } from "../../components/success/SuccessCelebrationHeader";
import { FilingProgressTracker } from "../../components/success/FilingProgressTracker";
import { ApplicationSummaryCard } from "../../components/success/ApplicationSummaryCard";
import { WhatHappensNextCard } from "../../components/success/WhatHappensNextCard";
import { ApplicationSummaryData } from "../../types/success.types";
import {
  styles,
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
  getBottomBarInsetsStyle,
} from "./ApplicationSuccessScreen.styles";

interface ApplicationSuccessScreenProps {
  onTrackStatus?: () => void;
  onDownloadAcknowledgement?: () => void;
}

export const ApplicationSuccessScreen: React.FC<ApplicationSuccessScreenProps> = ({
  onTrackStatus,
  onDownloadAcknowledgement,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    applicationId?: string;
    serviceType?: string;
    serviceTitle?: string;
    formType?: string;
    assessmentYear?: string;
    incomeType?: string;
    regime?: string;
    uploadedDocsCount?: string;
    totalDocsCount?: string;
    refundBank?: string;
  }>();

  const isRevised = params.serviceType === "revised" || params.serviceTitle === "Revised ITR";
  const appId = params.applicationId || "Application Received";
  const incomeType = isRevised ? "Revised Return Filing" : (params.incomeType || "Declared Income");
  const formType = params.formType || (isRevised ? "Revised ITR" : "ITR Form");
  const rawAy = params.assessmentYear || "";
  const formattedAy = rawAy ? (rawAy.startsWith("AY") ? rawAy : `AY ${rawAy}`) : "Current AY";
  const uploadedCount = params.uploadedDocsCount || "0";
  const totalCount = params.totalDocsCount || "0";
  const docsUploaded = `${uploadedCount} of ${totalCount} received`;
  const refundBank = params.refundBank || "Verified Primary Bank";
  const taxRegime = params.regime || "New Tax Regime";

  const summaryData: ApplicationSummaryData = {
    applicationId: appId,
    incomeType,
    itrForm: formType,
    assessmentYear: formattedAy,
    taxRegime,
    documentsUploaded: docsUploaded,
    submissionDate: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    status: "Received",
  };

  const handleBack = () => {
    router.replace("/(main)/home" as any);
  };

  const handleGoHome = () => {
    router.replace("/(main)/home" as any);
  };

  const handleTrackStatus = () => {
    if (onTrackStatus) {
      onTrackStatus();
    } else if (appId && appId !== "Application Received" && !appId.includes(" ")) {
      router.replace(`/application/${appId}` as any);
    } else {
      router.replace("/(main)/applications" as any);
    }
  };

  React.useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
  }, []);

  const handleDownload = () => {
    if (onDownloadAcknowledgement) {
      onDownloadAcknowledgement();
    } else {
      Alert.alert(
        "Application Receipt Downloaded",
        `TaxEdge Application Receipt for ${appId} has been saved to your device.`
      );
    }
  };

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top)]}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBack}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={20} color="#0B1F3A" />
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>
            {isRevised ? "Revised ITR" : (params.serviceTitle || "ITR Filing")}
          </Text>
          <Text style={styles.headerSubtitle}>Application Received</Text>
        </View>

        <View style={styles.headerRightSpacer} />
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          getScrollContentInsetsStyle(insets.bottom),
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebration Header & ID Card */}
        <SuccessCelebrationHeader applicationId={appId} isRevised={isRevised} />

        {/* 6-Stage Progress Tracker */}
        <FilingProgressTracker isRevised={isRevised} />

        {/* What We Have Summary Card */}
        <ApplicationSummaryCard summary={summaryData} />

        {/* What Happens Next Card */}
        <WhatHappensNextCard />
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.bottomBar, getBottomBarInsetsStyle(insets.bottom)]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleTrackStatus}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Track My Application</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleGoHome}
          style={[styles.secondaryButton, { marginTop: 8 }]}
        >
          <Ionicons name="home-outline" size={18} color="#0B1F3A" />
          <Text style={[styles.secondaryButtonText, { color: "#0B1F3A" }]}>Go Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleDownload}
          style={[styles.secondaryButton, { marginTop: 8 }]}
        >
          <Ionicons name="download-outline" size={18} color="#F97316" />
          <Text style={styles.secondaryButtonText}>Download TaxEdge Application Receipt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ApplicationSuccessScreen;
