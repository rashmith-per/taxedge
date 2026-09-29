/**
 * Component: ComplianceHeader
 * Migrated from internal StyleSheet to external styles module.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/shared/hooks/useTheme";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { BrandColors } from "@/shared/theme";
import {
  styles,
  getContainerStyle,
  getBackButtonThemeStyle,
  getTitleThemeStyle,
  getInfoCardThemeStyle,
  getInfoTextThemeStyle,
} from "./ComplianceHeader.styles";

export interface ComplianceHeaderProps {
  onBackPress?: () => void;
  showProgressLine?: boolean;
}

export const ComplianceHeader: React.FC<ComplianceHeaderProps> = ({
  onBackPress,
  showProgressLine = true,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, getContainerStyle(isDark, insets.top)]}>
      <FocusAwareStatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBack}
          style={[styles.backButton, getBackButtonThemeStyle(isDark)]}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={isDark ? "#F8FAFC" : "#0F172A"}
          />
        </TouchableOpacity>

        <Text style={[styles.titleText, getTitleThemeStyle(isDark)]}>
          GST Compliance
        </Text>

        <View style={styles.placeholderBox} />
      </View>

      {/* Thin Fintech Orange Progress Line */}
      {showProgressLine && (
        <View style={styles.progressLineTrack}>
          <View style={styles.progressLineBar} />
        </View>
      )}

      {/* Information Card */}
      <View style={styles.cardWrapper}>
        <View style={[styles.infoCard, getInfoCardThemeStyle(isDark)]}>
          <View style={styles.infoIconBox}>
            <Ionicons
              name="information-circle"
              size={20}
              color={BrandColors.PRIMARY_BLUE_ACCENT}
            />
          </View>
          <Text style={[styles.infoText, getInfoTextThemeStyle(isDark)]}>
            Need help with GST compliance? Select your request type and upload the
            required documents. Our CA team will review and contact you.
          </Text>
        </View>
      </View>
    </View>
  );
};
