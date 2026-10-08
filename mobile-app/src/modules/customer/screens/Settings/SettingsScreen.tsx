import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ScreenLayout } from "../../../../shared/components/ScreenLayout/ScreenLayout";
import { useTheme } from "../../../../hooks/use-theme";
import { useThemeStore, type ThemeMode } from "../../../../design-system/theme/themeStore";
import { useAuthStore } from "../../../authentication/store/authStore";
import { biometricService } from "../../../authentication/services/biometricService";
import { apiClient } from "../../../../core/api/apiClient";
import { ServerConfigModal } from "../../../../shared/components";
import {
  styles,
  getCardThemedStyle,
  getSegmentContainerStyle,
  getSegmentOptionActiveStyle,
  getSegmentTextStyle,
  getActiveDotStyle,
  getLinkRowThemedStyle,
} from "./SettingsScreen.styles";

export function SettingsScreen() {
  const router = useRouter();
  const colors = useTheme();
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState("Biometric");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const [currentServerUrl, setCurrentServerUrl] = useState(apiClient.getBaseUrl());

  const isBiometricEnabledStore = useAuthStore((state) => state.isBiometricEnabled);
  const setBiometricEnabledStore = useAuthStore((state) => state.setBiometricEnabled);

  useEffect(() => {
    let isMounted = true;
    async function loadBiometrics() {
      const isEnabled = await biometricService.isBiometricEnabled();
      const label = await biometricService.getBiometricTypeLabel();
      if (isMounted) {
        setBiometricEnabled(isEnabled);
        setBiometricLabel(label);
      }
    }
    loadBiometrics();
    return () => {
      isMounted = false;
    };
  }, [isBiometricEnabledStore]);

  const handleToggleBiometric = async (value: boolean) => {
    // Prevent duplicate taps while authentication is running
    if (isAuthenticating) return;

    if (value) {
      const hasHardware = await biometricService.checkHardwareSupport();
      if (!hasHardware) {
        Alert.alert(
          "Not Supported",
          "Biometric authentication isn't supported on this device."
        );
        return;
      }

      const isEnrolled = await biometricService.checkEnrollment();
      if (!isEnrolled) {
        Alert.alert(
          "Not Configured",
          "No fingerprint or biometric has been configured.\n\nPlease add one in your device settings."
        );
        return;
      }

      try {
        setIsAuthenticating(true);
        const authRes = await biometricService.authenticate(`Confirm ${biometricLabel} to enable`);
        if (authRes && authRes.success === true) {
          const mobile =
            useAuthStore.getState().mobileNumber ||
            useAuthStore.getState().authenticatedUser?.mobileNumber;
          await setBiometricEnabledStore(true);
          await biometricService.setBiometricEnabled(true, mobile);
          setBiometricEnabled(true);
        } else {
          setBiometricEnabled(false);
          if (
            !authRes?.cancelled &&
            authRes?.error &&
            authRes.error !== "Authentication cancelled" &&
            authRes.error !== "Authentication is already in progress"
          ) {
            Alert.alert("Authentication Failed", authRes.error);
          }
        }
      } finally {
        setIsAuthenticating(false);
      }
    } else {
      await biometricService.disableBiometric();
      await setBiometricEnabledStore(false);
      setBiometricEnabled(false);
    }
  };

  const handleChangePasscode = () => {
    const mobile =
      useAuthStore.getState().mobileNumber ||
      useAuthStore.getState().authenticatedUser?.mobileNumber;
    if (mobile) {
      useAuthStore.getState().setMobileNumber(mobile);
      useAuthStore.getState().setAuthFlowState("FORGOT_PASSCODE_OTP");
      useAuthStore.getState().startForgotPasscode();
      router.push("/(auth)/login");
    } else {
      router.push("/(auth)/login");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out of your TaxEdge account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            useAuthStore.getState().logout();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  const handleSelectTheme = (mode: ThemeMode) => {
    if (mode === theme) return;
    setTheme(mode);
  };

  const cardStyle = getCardThemedStyle(colors);
  const segmentContainerStyle = getSegmentContainerStyle(theme, colors);
  const linkRowThemedStyle = getLinkRowThemedStyle(colors.border);

  return (
    <ScreenLayout title="Settings" showBack>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- Appearance Section ---------- */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="color-palette-outline" size={18} color={colors.orange} />
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              APPEARANCE
            </Text>
          </View>

          <View style={[styles.card, cardStyle]}>
            <View style={styles.themeHeaderRow}>
              <View>
                <Text style={[styles.label, { color: colors.text }]}>Theme</Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
                  Choose your preferred application appearance
                </Text>
              </View>
            </View>

            {/* Modern Segmented Control */}
            <View style={[styles.segmentedContainer, segmentContainerStyle]}>
              {/* Light Option */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSelectTheme("light")}
                style={[
                  styles.segmentOption,
                  getSegmentOptionActiveStyle("light", theme === "light"),
                ]}
                accessibilityRole="button"
                accessibilityLabel="Light theme"
                accessibilityState={{ selected: theme === "light" }}
              >
                <View style={styles.segmentContent}>
                  <Ionicons
                    name={theme === "light" ? "sunny" : "sunny-outline"}
                    size={19}
                    color={theme === "light" ? "#FF7A00" : colors.textSecondary}
                  />
                  <Text style={[styles.segmentText, getSegmentTextStyle("light", theme, colors)]}>
                    Light
                  </Text>
                </View>
                {theme === "light" && <View style={[styles.activeDot, getActiveDotStyle("light")]} />}
              </TouchableOpacity>

              {/* Dark Option */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSelectTheme("dark")}
                style={[
                  styles.segmentOption,
                  getSegmentOptionActiveStyle("dark", theme === "dark"),
                ]}
                accessibilityRole="button"
                accessibilityLabel="Dark theme"
                accessibilityState={{ selected: theme === "dark" }}
              >
                <View style={styles.segmentContent}>
                  <Ionicons
                    name={theme === "dark" ? "moon" : "moon-outline"}
                    size={18}
                    color={theme === "dark" ? "#38BDF8" : colors.textSecondary}
                  />
                  <Text style={[styles.segmentText, getSegmentTextStyle("dark", theme, colors)]}>
                    Dark
                  </Text>
                </View>
                {theme === "dark" && <View style={[styles.activeDot, getActiveDotStyle("dark")]} />}
              </TouchableOpacity>
            </View>

            <View style={styles.themeInfoFooter}>
              <Ionicons
                name="information-circle-outline"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={[styles.themeInfoText, { color: colors.textSecondary }]}>
                {theme === "light"
                  ? "Standard clean finance interface optimized for day use."
                  : "Sleek low-light interface optimized for night and OLED screens."}
              </Text>
            </View>
          </View>
        </View>

        {/* ---------- Preferences Section ---------- */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="notifications-outline" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              PREFERENCES
            </Text>
          </View>

          <View style={[styles.card, cardStyle]}>
            <View style={styles.row}>
              <View style={styles.switchLabelGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Push Notifications</Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
                  Filing alerts and deadline reminders
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#CBD5E1", true: colors.orange }}
              />
            </View>
          </View>
        </View>

        {/* ---------- Security Section ---------- */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              SECURITY
            </Text>
          </View>

          <View style={[styles.card, cardStyle]}>
            {/* Security Biometric Toggle */}
            <View style={styles.row}>
              <View style={styles.switchLabelGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Biometric Authentication</Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
                  Use {biometricLabel}
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleToggleBiometric}
                disabled={isAuthenticating}
                trackColor={{ false: "#CBD5E1", true: colors.orange }}
              />
            </View>

            {/* Change Passcode */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleChangePasscode}
              style={[styles.linkRow, linkRowThemedStyle]}
            >
              <View style={styles.switchLabelGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Change Passcode</Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
                  Update your 6-digit security PIN
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleLogout}
              style={[styles.linkRow, linkRowThemedStyle]}
            >
              <View style={styles.switchLabelGroup}>
                <Text style={[styles.label, { color: colors.error }]}>Logout</Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
                  Sign out of your active session
                </Text>
              </View>
              <Ionicons name="log-out-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ---------- App Information ---------- */}
        {__DEV__ ? (
          <TouchableOpacity
            style={styles.appInfoContainer}
            onPress={() => {
              setCurrentServerUrl(apiClient.getBaseUrl());
              setShowServerModal(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.appInfoText, { color: colors.textSecondary }]}>
              TaxEdge Fin Solutions • v1.0.0
            </Text>
            <Text style={[styles.backendStatusText, { color: colors.primary }]}>
              Backend: {currentServerUrl}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.appInfoContainer}>
            <Text style={[styles.appInfoText, { color: colors.textSecondary }]}>
              TaxEdge Fin Solutions • v1.0.0
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Server Configuration Modal — dev only */}
      {__DEV__ && (
        <ServerConfigModal
          visible={showServerModal}
          onClose={() => setShowServerModal(false)}
          onSaved={(newUrl) => setCurrentServerUrl(newUrl)}
        />
      )}
    </ScreenLayout>
  );
}

export default SettingsScreen;
