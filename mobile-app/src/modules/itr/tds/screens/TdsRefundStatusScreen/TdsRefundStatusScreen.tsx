import React, { useEffect } from "react";
import { View, ScrollView, BackHandler } from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApplicationStore } from "@/store/applicationStore";
import {
  TdsStatusTopNav,
  TdsApplicationHeaderCard,
  TdsTimelineTrackerCard,
  TdsContactSupportFooter,
} from "../../components/status";
import {
  DEFAULT_TDS_TIMELINE_STEPS,
  createApplicationSummary,
} from "../../constants/tdsStatus.constants";
import { TdsRefundStatusScreenParams } from "../../types/tdsStatus.types";
import {
  styles,
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
  getBottomBarInsetsStyle,
} from "./TdsRefundStatusScreen.styles";

export const TdsRefundStatusScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams() as unknown as TdsRefundStatusScreenParams;
  const tdsDraft = useApplicationStore((state) => state.tdsDraft);

  // Dynamic application summary built functionally - zero loops
  const applicationSummary = createApplicationSummary(
    {
      applicationId: params.applicationId,
      serviceName: params.serviceName,
      assessmentYear: params.assessmentYear,
      appliedDate: params.appliedDate,
    },
    tdsDraft?.formData
  );

  const handleBack = () => {
    router.replace("/(main)/home");
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
  }, []);

  const containerInsetsStyle = getContainerInsetsStyle(insets.top);
  const scrollContentInsetsStyle = getScrollContentInsetsStyle(insets.bottom);
  const bottomBarInsetsStyle = getBottomBarInsetsStyle(insets.bottom);

  return (
    <View style={[styles.container, containerInsetsStyle]}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#4338CA" />

      {/* Top Banner Navigation */}
      <TdsStatusTopNav
        topInset={insets.top}
        title="Application Status"
        subtitle={applicationSummary.applicationId}
        onBack={handleBack}
      />

      {/* Scrollable Main Content */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, scrollContentInsetsStyle]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Rounded Application Summary Card */}
        <TdsApplicationHeaderCard data={applicationSummary} />

        {/* 9-Step Timeline Status Tracker Card */}
        <TdsTimelineTrackerCard steps={DEFAULT_TDS_TIMELINE_STEPS} />
      </ScrollView>

      {/* Bottom Sticky Contact Support Card */}
      <TdsContactSupportFooter style={bottomBarInsetsStyle} />
    </View>
  );
};

export default TdsRefundStatusScreen;
