import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Sharing from "expo-sharing";
import { useTheme } from "@/shared/hooks/useTheme";
import { BrandColors } from "@/shared/theme";
import {
  styles,
  getRootThemeStyle,
  getTitleThemeStyle,
  getSubtitleThemeStyle,
  getRefCardThemeStyle,
  getRefLabelThemeStyle,
  getDividerThemeStyle,
  getNextStepsCardThemeStyle,
  getStepTextThemeStyle,
  getBottomBarThemeStyle,
  getSecondaryBtnThemeStyle,
} from "./GstComplianceSuccessScreen.styles";

export function GstComplianceSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const params = useLocalSearchParams<{
    referenceId?: string;
    requestType?: string;
    gstin?: string;
    submittedAt?: string;
    estimatedResponse?: string;
  }>();

  const refId = params.referenceId || "GSTC-2026-000123";
  const requestType = params.requestType || "Compliance Request";
  const gstin = params.gstin || "29AAAAA0000A1Z5";
  const submittedAt = params.submittedAt || "09 Sep 2026";
  const estimatedResponse = params.estimatedResponse || "Within 24 Hours";

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(cardSlideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const { BackHandler } = require("react-native");
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleGoDashboard();
      return true;
    });
    return () => sub.remove();
  }, []);

  const handleCopyRef = () => {
    Alert.alert("Reference ID Copied", `Reference ID ${refId} has been copied.`);
  };

  const handleGoDashboard = () => {
    router.replace("/(main)/home" as any);
  };

  const handleTrackRequest = () => {
    router.replace("/(main)/applications" as any);
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 20),
        },
      ]}
    >
      <FocusAwareStatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Checkmark Circle */}
        <Animated.View
          style={[
            styles.checkCircleWrap,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.outerGlow}>
            <View style={styles.middleCircle}>
              <View style={styles.innerCheckCircle}>
                <Ionicons name="checkmark" size={44} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Title & Subtitle */}
        <Animated.View
          style={[
            styles.headerCol,
            {
              transform: [{ translateY: cardSlideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Text
            style={[
              styles.successTitle,
              { color: isDark ? "#F8FAFC" : "#0F172A" },
            ]}
          >
            Request Submitted Successfully
          </Text>

          <Text
            style={[
              styles.successSubtitle,
              { color: isDark ? "#94A3B8" : "#64748B" },
            ]}
          >
            Your GST Compliance request has been submitted successfully.
            Our CA team will review your documents and contact you shortly.
          </Text>
        </Animated.View>

        {/* Reference ID Card */}
        <Animated.View
          style={[
            styles.refCard,
            {
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderColor: isDark ? "#334155" : "#E2E8F0",
              transform: [{ translateY: cardSlideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.refRow}>
            <View>
              <Text
                style={[
                  styles.refLabel,
                  { color: isDark ? "#94A3B8" : "#64748B" },
                ]}
              >
                Reference ID
              </Text>
              <Text
                style={[
                  styles.refValue,
                  { color: BrandColors.PRIMARY_BLUE_ACCENT },
                ]}
              >
                {refId}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCopyRef}
              style={[
                styles.copyButton,
                {
                  backgroundColor: isDark ? "#334155" : "#EAF1FE",
                },
              ]}
            >
              <Ionicons
                name="copy-outline"
                size={16}
                color={BrandColors.PRIMARY_BLUE_ACCENT}
              />
              <Text
                style={[
                  styles.copyText,
                  { color: BrandColors.PRIMARY_BLUE_ACCENT },
                ]}
              >
                Copy
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? "#334155" : "#F1F5F9" },
            ]}
          />

          {/* Key Details Grid */}
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <Text
                style={[
                  styles.metaLabel,
                  { color: isDark ? "#64748B" : "#94A3B8" },
                ]}
              >
                Submitted On
              </Text>
              <Text
                style={[
                  styles.metaValue,
                  { color: isDark ? "#F1F5F9" : "#1E293B" },
                ]}
              >
                {submittedAt}
              </Text>
            </View>

            <View style={styles.gridItem}>
              <Text
                style={[
                  styles.metaLabel,
                  { color: isDark ? "#64748B" : "#94A3B8" },
                ]}
              >
                Estimated Response
              </Text>
              <Text
                style={[
                  styles.metaValue,
                  { color: isDark ? "#38BDF8" : "#083B75" },
                ]}
              >
                {estimatedResponse}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? "#334155" : "#F1F5F9" },
            ]}
          />

          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <Text
                style={[
                  styles.metaLabel,
                  { color: isDark ? "#64748B" : "#94A3B8" },
                ]}
              >
                Request Type
              </Text>
              <Text
                style={[
                  styles.metaValue,
                  { color: isDark ? "#F1F5F9" : "#1E293B" },
                ]}
              >
                {requestType}
              </Text>
            </View>

            <View style={styles.gridItem}>
              <Text
                style={[
                  styles.metaLabel,
                  { color: isDark ? "#64748B" : "#94A3B8" },
                ]}
              >
                GSTIN
              </Text>
              <Text
                style={[
                  styles.metaValue,
                  { color: isDark ? "#F1F5F9" : "#1E293B" },
                ]}
              >
                {gstin}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* What Happens Next Card */}
        <Animated.View
          style={[
            styles.nextStepsCard,
            {
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderColor: isDark ? "#334155" : "#E2E8F0",
              transform: [{ translateY: cardSlideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Text
            style={[
              styles.nextStepsTitle,
              { color: isDark ? "#F8FAFC" : "#0F172A" },
            ]}
          >
            What happens next?
          </Text>

          <View style={styles.stepItem}>
            <View style={styles.stepDot} />
            <Text
              style={[
                styles.stepText,
                { color: isDark ? "#CBD5E1" : "#475569" },
              ]}
            >
              A certified Chartered Accountant will review your uploaded registers and notice details.
            </Text>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepDot} />
            <Text
              style={[
                styles.stepText,
                { color: isDark ? "#CBD5E1" : "#475569" },
              ]}
            >
              You will receive an update in your TaxEdge Notifications and WhatsApp within 24 hours.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleTrackRequest}
          style={styles.primaryBtn}
        >
          <Ionicons name="compass-outline" size={18} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>Track Request</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleGoDashboard}
          style={[
            styles.secondaryBtn,
            {
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderColor: isDark ? "#334155" : "#CBD5E1",
            },
          ]}
        >
          <Ionicons
            name="home-outline"
            size={18}
            color={isDark ? "#F8FAFC" : "#0F172A"}
          />
          <Text
            style={[
              styles.secondaryBtnText,
              { color: isDark ? "#F8FAFC" : "#0F172A" },
            ]}
          >
            Go to Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default GstComplianceSuccessScreen;

