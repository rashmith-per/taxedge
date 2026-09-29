import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Animated,
  Keyboard,
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { useTheme } from "../../../hooks/use-theme";
import { Spacing, BrandColors } from "../../../shared/theme";
import { useAuthStore } from "../store/authStore";
import {
  MobileNumberSection,
  OTPSection,
  PasscodeLoginSection,
  ResetPasscodeSection,
  GoogleLoginSection,
  ErrorBanner,
} from "../components";
import { authStorage } from "../services/authStorage";
import { biometricService } from "../services/biometricService";
import { BiometricPromptModal } from "../../../shared/components/BiometricPromptModal";
import { ServerConfigModal } from "../../../shared/components/ServerConfigModal";
import {
  styles,
  getThemedStyles,
  getDynamicScrollStyle,
} from "./AuthenticationScreen.styles";

const HEADER_OFFSET = Spacing.md;
const FOOTER_OFFSET = Spacing.base;
const MIN_SCROLL_PADDING = Spacing.xl + Spacing.xs;

// Duration for the biometric → passcode slide transition (ms)
const SLIDE_DURATION = 380;

export function AuthenticationScreen() {
  const colors = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    isLoggedIn,
    authFlowState,
    mobileNumber,
    otp,
    passcode,
    confirmPasscode,
    isLoading,
    error,
    otpTimer,
    canResendOTP,
    setMobileNumber,
    setOtp,
    setPasscode,
    setConfirmPasscode,
    setError,
    decrementTimer,
    sendOtp,
    verifyOtp,
    loginWithPasscode,
    startForgotPasscode,
    verifyForgotPasscodeOtp,
    resetPasscodeAndProceed,
    resendOtp,
    changeNumber,
    setAuthFlowState,
    isBiometricEnabled,
    syncFromDevAuth,
  } = useAuthStore();

  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricType, setBiometricType] = useState("Fingerprint");
  const [showServerModal, setShowServerModal] = useState(false);

  // ─── BIOMETRIC REAUTH animation state ─────────────────────────────────────
  // Whether the passcode section is currently shown (after biometric dismissal)
  const [passcodeVisible, setPasscodeVisible] = useState(false);
  const [biometricDismissed, setBiometricDismissed] = useState(false);
  // Whether passcode auto-focus is allowed (only after the slide animation finishes)
  const [passcodeAutoFocus, setPasscodeAutoFocus] = useState(false);

  // Reanimated shared values for biometric ↔ passcode slide
  const biometricAreaY = useSharedValue(0);  // starts at natural position
  const passcodeAreaY = useSharedValue(320); // starts below the viewport
  const reauthScrollRef = useRef<ScrollView>(null);

  const biometricAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: biometricAreaY.value }],
    opacity: withTiming(biometricAreaY.value === 0 ? 1 : 0, { duration: SLIDE_DURATION }),
  }));

  const passcodeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: passcodeAreaY.value }],
    opacity: withTiming(passcodeAreaY.value < 100 ? 1 : 0, { duration: SLIDE_DURATION }),
  }));

  // ─── Guards ────────────────────────────────────────────────────────────────
  // Prevent duplicate biometric calls across re-renders
  const hasBioTriggered = useRef(false);
  // Prevent duplicate navigation calls
  const hasNavigated = useRef(false);

  // ─── Standard Animated.Value for flow transitions ─────────────────────────
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // ─── Reset guards whenever the flow state changes ─────────────────────────
  useEffect(() => {
    if (authFlowState === "BIOMETRIC_REAUTH") {
      // Reset slide state so biometric area is at top, passcode hidden
      hasBioTriggered.current = false;
      hasNavigated.current = false;
      setPasscodeVisible(false);
      setBiometricDismissed(false);
      setPasscodeAutoFocus(false);
      biometricAreaY.value = 0;
      passcodeAreaY.value = 320;
    }
  }, [authFlowState]);

  useEffect(() => {
    if (!passcodeVisible) return;
    const timer = setTimeout(() => {
      reauthScrollRef.current?.scrollToEnd({ animated: true });
    }, 500);
    return () => clearTimeout(timer);
  }, [passcodeVisible]);

  // Trigger only after the auth route is focused and its Welcome Back UI is mounted.
  useFocusEffect(
    useCallback(() => {
      if (authFlowState !== "BIOMETRIC_REAUTH" || hasBioTriggered.current) {
        return undefined;
      }

      const timer = setTimeout(() => {
        if (hasBioTriggered.current) return;
        hasBioTriggered.current = true;
        handleBiometricReauth();
      }, 2900); // Wait for the native and animated splash layers to finish.

      return () => clearTimeout(timer);
    }, [authFlowState])
  );

  // ─── If already authenticated, redirect to home ───────────────────────────
  useEffect(() => {
    if (
      isLoggedIn &&
      !showBiometricModal &&
      authFlowState !== "PASSCODE_LOGIN" &&
      authFlowState !== "BIOMETRIC_REAUTH" &&
      authFlowState !== "RESET_PASSCODE" &&
      authFlowState !== "FORGOT_PASSCODE_OTP"
    ) {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.replace("/(main)/home" as any);
      }
    }
  }, [isLoggedIn, showBiometricModal, authFlowState]);

  // ─── Timer interval ───────────────────────────────────────────────────────
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const isOtpActive =
      authFlowState === "OTP_VERIFICATION" || authFlowState === "FORGOT_PASSCODE_OTP";
    if (isOtpActive && otpTimer > 0) {
      interval = setInterval(() => {
        decrementTimer();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authFlowState, otpTimer]);

  // ─── Animate on non-biometric state transitions ───────────────────────────
  useEffect(() => {
    if (authFlowState === "BIOMETRIC_REAUTH") return; // handled separately
    fadeAnim.setValue(0.3);
    slideAnim.setValue(10);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [authFlowState]);

  // ─── BIOMETRIC REAUTH: auto-trigger after mount ────────────────────────────
  const handleBiometricReauth = useCallback(async () => {
    try {
      const typeLabel = await biometricService.getBiometricTypeLabel().catch(() => "Biometrics");
      const authRes = await biometricService.authenticate({
        promptMessage: `Authenticate with ${typeLabel}`,
        disableDeviceFallback: true,
      });

      if (authRes.success) {
        // ✅ Biometric succeeded — restore session and navigate to Dashboard
        const activeMobile = mobileNumber || authStorage.getSession().activeMobile;
        if (activeMobile) {
          authStorage.saveSession({
            isLoggedIn: true,
            activeMobile,
            lastLoginAt: new Date().toISOString(),
          });
          await useAuthStore.getState().fetchAndSyncProfile(activeMobile).catch(() => {});
          syncFromDevAuth();
        }
        if (!hasNavigated.current) {
          hasNavigated.current = true;
          router.replace("/(main)/home" as any);
        }
        return;
      }

      // Biometric dismissed/failed → slide to passcode with smooth animation
      slideToBiometricDismissed();
    } catch (e: any) {
      // On unexpected error, slide to passcode as graceful fallback
      slideToBiometricDismissed();
    }
  }, [mobileNumber]);

  // ─── Slide transition: biometric → passcode ───────────────────────────────
  const slideToBiometricDismissed = useCallback(() => {
    // Animate biometric area sliding down
    biometricAreaY.value = withTiming(320, {
      duration: SLIDE_DURATION,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });

    // Animate passcode area sliding up (with slight delay for staggered feel)
    passcodeAreaY.value = withDelay(
      80,
      withTiming(0, {
        duration: SLIDE_DURATION,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      }, (finished) => {
        if (finished) {
          // After animation: show passcode and enable auto-focus
          runOnJS(setBiometricDismissed)(true);
          runOnJS(setPasscodeVisible)(true);
          runOnJS(setPasscodeAutoFocus)(true);
        }
      })
    );

    // Mount the passcode section immediately so it animates in
    setPasscodeVisible(true);
  }, []);

  // ─── Passcode login (from BIOMETRIC_REAUTH passcode fallback) ─────────────
  const handlePasscodeFromReauth = useCallback(async () => {
    const res = await loginWithPasscode();
    if (res.success) {
      // Hide numpad immediately, then navigate
      setPasscodeAutoFocus(false);
      setPasscode("");
      Keyboard.dismiss();
      try {
        const hasHardware = await biometricService.checkHardwareSupport();
        const isEnrolled = await biometricService.checkEnrollment();
        const isAlreadyEnabled = await biometricService.isBiometricEnabled();

        if (hasHardware && isEnrolled && !isAlreadyEnabled) {
          const typeLabel = await biometricService.getBiometricTypeLabel();
          setBiometricType(typeLabel);
          setShowBiometricModal(true);
          return;
        }
      } catch { }

      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.replace("/(main)/home" as any);
      }
    }
  }, [loginWithPasscode]);

  // ─── Standard handlers ────────────────────────────────────────────────────
  const handleMobileSubmit = async () => {
    await sendOtp();
  };

  const handleOtpVerify = async (code?: string) => {
    const res = await verifyOtp(code);
    if (res.success) {
      if (res.requiresPasscode) {
        setAuthFlowState("PASSCODE_LOGIN");
      } else {
        router.replace("/(main)/home" as any);
      }
    }
  };

  const handleLoginSubmit = async () => {
    const res = await loginWithPasscode();
    if (res.success) {
      setPasscode("");
      Keyboard.dismiss();
      try {
        const hasHardware = await biometricService.checkHardwareSupport();
        const isEnrolled = await biometricService.checkEnrollment();
        const isAlreadyEnabled = await biometricService.isBiometricEnabled();

        if (hasHardware && isEnrolled && !isAlreadyEnabled) {
          const typeLabel = await biometricService.getBiometricTypeLabel();
          setBiometricType(typeLabel);
          setShowBiometricModal(true);
          return;
        }
      } catch { }

      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.replace("/(main)/home" as any);
      }
    }
  };

  const handleEnableBiometric = async () => {
    setShowBiometricModal(false);
    try {
      const authRes = await biometricService.authenticate();
      if (authRes.success) {
        await useAuthStore.getState().setBiometricEnabled(true);
      }
    } catch { }
    if (!hasNavigated.current) {
      hasNavigated.current = true;
      router.replace("/(main)/home" as any);
    }
  };

  const handleNotNowBiometric = () => {
    setShowBiometricModal(false);
    if (!hasNavigated.current) {
      hasNavigated.current = true;
      router.replace("/(main)/home" as any);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const typeLabel = await biometricService.getBiometricTypeLabel();
      const authRes = await biometricService.authenticate(`Authenticate with ${typeLabel}`);
      if (authRes.success) {
        const activeMobile = mobileNumber || authStorage.getSession().activeMobile;
        if (activeMobile) {
          authStorage.saveSession({
            isLoggedIn: true,
            activeMobile: activeMobile,
            lastLoginAt: new Date().toISOString(),
          });
          syncFromDevAuth();
          router.replace("/(main)/home" as any);
        }
      } else if (!authRes?.cancelled && authRes?.error && authRes.error !== "Authentication cancelled") {
        setError(authRes.error);
      }
    } catch (e: any) {
      setError(e?.message || "Biometric authentication failed");
    }
  };

  const handleForgotPasscode = async () => {
    await startForgotPasscode();
  };

  const handleForgotPasscodeOtpVerify = async (code?: string) => {
    await verifyForgotPasscodeOtp(code);
  };

  const handleResetPasscodeSubmit = async () => {
    await resetPasscodeAndProceed();
  };

  const isMobileReadOnly = authFlowState !== "ENTER_MOBILE";
  const themed = getThemedStyles(
    colors,
    isDark,
    insets.top,
    HEADER_OFFSET,
    MIN_SCROLL_PADDING
  );
  const dynamicScroll = getDynamicScrollStyle(
    insets.top,
    insets.bottom,
    HEADER_OFFSET,
    FOOTER_OFFSET,
    MIN_SCROLL_PADDING
  );

  // ─── BIOMETRIC_REAUTH render ───────────────────────────────────────────────
  if (authFlowState === "BIOMETRIC_REAUTH") {
    return (
      <KeyboardAvoidingView
        style={[styles.container, themed.container, { flex: 1 }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      >
        <FocusAwareStatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <ScrollView
          ref={reauthScrollRef}
          contentContainerStyle={[styles.scroll, dynamicScroll]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.wrapper}>
            {/* Header & Branding */}
            <TouchableOpacity
              activeOpacity={0.85}
              onLongPress={() => setShowServerModal(true)}
              delayLongPress={500}
              style={styles.header}
            >
              <Image
                source={require("../../../../assets/images/icon.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={[styles.brandTitle, themed.brandTitle]}>TAXEDGE</Text>
              <Text style={[styles.brandSub, themed.brandSub]}>FIN SOLUTIONS</Text>
            </TouchableOpacity>

            {/* Welcome Back heading */}
            <View style={reauthStyles.welcomeSection}>
              <Text style={[reauthStyles.welcomeTitle, { color: colors.text }]}>
                Welcome Back 👋
              </Text>
              <Text style={[reauthStyles.welcomeSub, { color: colors.textSecondary }]}>
                {mobileNumber || "Authenticate to continue"}
              </Text>
            </View>

            {/* Error Banner */}
            <ErrorBanner error={error} onDismiss={() => setError(null)} />

            {/* ── Biometric Area (slides down on dismiss) ── */}
            {!biometricDismissed && (
              <Reanimated.View style={[reauthStyles.animatedSection, biometricAnimStyle]}>
              <View style={reauthStyles.biometricCard}>
                <View style={reauthStyles.biometricIconRing}>
                  <Ionicons
                    name={
                      biometricType.toLowerCase().includes("face")
                        ? "scan-outline"
                        : "finger-print-outline"
                    }
                    size={44}
                    color={BrandColors.PRIMARY_ORANGE}
                  />
                </View>
                <Text style={[reauthStyles.biometricLabel, { color: colors.text }]}>
                  {`Authenticate with ${biometricType}`}
                </Text>
                <Text style={[reauthStyles.biometricSub, { color: colors.textSecondary }]}>
                  Use biometrics to securely access your account
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    hasBioTriggered.current = false;
                    handleBiometricReauth();
                  }}
                  activeOpacity={0.75}
                  style={[reauthStyles.retryBtn, { borderColor: BrandColors.PRIMARY_ORANGE }]}
                >
                  <Ionicons name="refresh-outline" size={15} color={BrandColors.PRIMARY_ORANGE} />
                  <Text style={[reauthStyles.retryBtnText, { color: BrandColors.PRIMARY_ORANGE }]}>
                    Try Again
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={slideToBiometricDismissed}
                  activeOpacity={0.7}
                  style={reauthStyles.switchToPasscodeBtn}
                >
                  <Text style={[reauthStyles.switchToPasscodeText, { color: colors.textSecondary }]}>
                    Use Passcode Instead
                  </Text>
                </TouchableOpacity>
              </View>
              </Reanimated.View>
            )}

            {/* ── Passcode Area (slides up after biometric dismiss) ── */}
            {passcodeVisible && (
              <Reanimated.View style={[reauthStyles.animatedSection, passcodeAnimStyle]}>
                <MobileNumberSection
                  mobile={mobileNumber}
                  onChangeMobile={setMobileNumber}
                  onSubmit={() => { }}
                  isReadOnly={true}
                  onChangeNumber={changeNumber}
                  loading={false}
                  showContinueButton={false}
                />
                <PasscodeLoginSection
                  passcode={passcode}
                  onChangePasscode={setPasscode}
                  onLogin={handlePasscodeFromReauth}
                  onForgotPasscode={handleForgotPasscode}
                  loading={isLoading}
                  onBiometricLogin={() => {
                    // Allow retrying biometric from passcode view
                    hasBioTriggered.current = false;
                    setPasscodeVisible(false);
                    setBiometricDismissed(false);
                    setPasscodeAutoFocus(false);
                    biometricAreaY.value = 0;
                    passcodeAreaY.value = 320;
                    handleBiometricReauth();
                  }}
                  isBiometricEnabled={isBiometricEnabled}
                  biometricTypeLabel={biometricType}
                  autoFocus={passcodeAutoFocus}
                />
              </Reanimated.View>
            )}
          </View>
        </ScrollView>

        {/* Biometric Enable Prompt Modal */}
        <BiometricPromptModal
          visible={showBiometricModal}
          biometricType={biometricType}
          onEnable={handleEnableBiometric}
          onNotNow={handleNotNowBiometric}
        />

        {/* Server Configuration Modal */}
        <ServerConfigModal
          visible={showServerModal}
          onClose={() => setShowServerModal(false)}
        />
      </KeyboardAvoidingView>
    );
  }

  // ─── Standard auth screen (ENTER_MOBILE / OTP / PASSCODE_LOGIN / FORGOT / RESET) ──
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, themed.container]}
    >
      <FocusAwareStatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        contentContainerStyle={[styles.scroll, dynamicScroll]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {authFlowState === "RESET_PASSCODE" && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setAuthFlowState("PASSCODE_LOGIN")}
            style={[styles.backBtnAbsolute, themed.backBtnAbsolute]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={isDark ? "#FFFFFF" : BrandColors.PRIMARY_BLUE_DARK}
            />
          </TouchableOpacity>
        )}

        <View style={styles.wrapper}>
          {/* Header & Branding (Long-press to configure server IP) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onLongPress={() => setShowServerModal(true)}
            delayLongPress={500}
            style={styles.header}
          >
            <Image
              source={require("../../../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.brandTitle, themed.brandTitle]}>TAXEDGE</Text>
            <Text style={[styles.brandSub, themed.brandSub]}>FIN SOLUTIONS</Text>
          </TouchableOpacity>

          {/* Welcome Title - Only shown on initial Mobile Number Login Screen */}
          {authFlowState === "ENTER_MOBILE" && (
            <View style={styles.welcome}>
              <Text style={[styles.welcomeTitle, themed.welcomeTitle]}>Welcome Back 👋</Text>

            </View>
          )}

          {/* Error Banner */}
          {authFlowState !== "RESET_PASSCODE" && (
            <>
              <ErrorBanner error={error} onDismiss={() => setError(null)} />
              {error && (
                error.toLowerCase().includes("server") ||
                error.toLowerCase().includes("connect") ||
                error.toLowerCase().includes("network") ||
                error.toLowerCase().includes("url") ||
                error.toLowerCase().includes("fetch")
              ) && (
                  <TouchableOpacity
                    onPress={() => setShowServerModal(true)}
                    style={styles.serverConfigBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.serverConfigBtnText}>
                      ⚙️ Tap to change Server IP / URL
                    </Text>
                  </TouchableOpacity>
                )}
            </>
          )}

          {/* Form Body with Animated Transition */}
          <Animated.View
            style={[
              styles.formBody,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* 1. ENTER_MOBILE or OTP_VERIFICATION */}
            {(authFlowState === "ENTER_MOBILE" || authFlowState === "OTP_VERIFICATION") && (
              <>
                <MobileNumberSection
                  mobile={mobileNumber}
                  onChangeMobile={setMobileNumber}
                  onSubmit={handleMobileSubmit}
                  isReadOnly={isMobileReadOnly}
                  onChangeNumber={changeNumber}
                  loading={isLoading && authFlowState === "ENTER_MOBILE"}
                  showContinueButton={authFlowState === "ENTER_MOBILE"}
                />

                {authFlowState === "OTP_VERIFICATION" && (
                  <OTPSection
                    otp={otp}
                    onChangeOtp={setOtp}
                    onVerify={handleOtpVerify}
                    onResend={resendOtp}
                    timer={otpTimer}
                    canResend={canResendOTP}
                    loading={isLoading}
                    verifyButtonTitle="Verify OTP"
                  />
                )}

                <GoogleLoginSection disabled={isLoading} />
              </>
            )}

            {/* 2. PASSCODE_LOGIN (Existing User — reached via OTP verify) */}
            {authFlowState === "PASSCODE_LOGIN" && (
              <>
                <MobileNumberSection
                  mobile={mobileNumber}
                  onChangeMobile={setMobileNumber}
                  onSubmit={() => { }}
                  isReadOnly={true}
                  onChangeNumber={changeNumber}
                  loading={false}
                  showContinueButton={false}
                />

                <PasscodeLoginSection
                  passcode={passcode}
                  onChangePasscode={setPasscode}
                  onLogin={handleLoginSubmit}
                  onForgotPasscode={handleForgotPasscode}
                  loading={isLoading}
                  onBiometricLogin={handleBiometricLogin}
                  isBiometricEnabled={isBiometricEnabled}
                  biometricTypeLabel={biometricType}
                  autoFocus={true}
                />

                <GoogleLoginSection disabled={isLoading} />
              </>
            )}

            {/* 3. FORGOT_PASSCODE_OTP */}
            {authFlowState === "FORGOT_PASSCODE_OTP" && (
              <>
                <MobileNumberSection
                  mobile={mobileNumber}
                  onChangeMobile={setMobileNumber}
                  onSubmit={() => { }}
                  isReadOnly={true}
                  onChangeNumber={() => setAuthFlowState("PASSCODE_LOGIN")}
                  loading={false}
                  showContinueButton={false}
                />

                <OTPSection
                  otp={otp}
                  onChangeOtp={setOtp}
                  onVerify={handleForgotPasscodeOtpVerify}
                  onResend={resendOtp}
                  timer={otpTimer}
                  canResend={canResendOTP}
                  loading={isLoading}
                  verifyButtonTitle="Verify Reset Code"
                />
              </>
            )}

            {/* 4. RESET_PASSCODE */}
            {authFlowState === "RESET_PASSCODE" && (
              <ResetPasscodeSection
                passcode={passcode}
                confirmPasscode={confirmPasscode}
                onChangePasscode={setPasscode}
                onChangeConfirmPasscode={setConfirmPasscode}
                onSubmit={handleResetPasscodeSubmit}
                loading={isLoading}
                error={error}
                mobileNumber={mobileNumber}
              />
            )}
          </Animated.View>
        </View>
      </ScrollView>

      {/* Biometric Enable Prompt Modal */}
      <BiometricPromptModal
        visible={showBiometricModal}
        biometricType={biometricType}
        onEnable={handleEnableBiometric}
        onNotNow={handleNotNowBiometric}
      />

      {/* Server Configuration Modal */}
      <ServerConfigModal
        visible={showServerModal}
        onClose={() => setShowServerModal(false)}
      />
    </KeyboardAvoidingView>
  );
}

// ─── Styles specific to the BIOMETRIC_REAUTH layout ──────────────────────────
const reauthStyles = StyleSheet.create({
  animatedSection: {
    width: "100%",
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  welcomeSub: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.8,
  },
  biometricCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderRadius: 20,
    backgroundColor: "rgba(2, 132, 199, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(2, 132, 199, 0.12)",
    marginBottom: Spacing.md,
  },
  biometricIconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(245, 130, 32, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(245, 130, 32, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  biometricLabel: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  biometricSub: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    opacity: 0.75,
    marginBottom: Spacing.lg,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  switchToPasscodeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  switchToPasscodeText: {
    fontSize: 13,
    fontWeight: "500",
    textDecorationLine: "underline",
    opacity: 0.75,
  },
});

export default AuthenticationScreen;
