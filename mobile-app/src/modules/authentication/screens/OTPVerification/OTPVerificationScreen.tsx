import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "../../../../design-system/colors";
import { useAuthStore } from "../../store/authStore";
import { PrimaryButton } from "../../../../shared/components/Button/PrimaryButton";
import {
  styles,
  getOtpBoxDynamicStyle,
  getBackBtnPosition,
} from "./OTPVerificationScreen.styles";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

export function OTPVerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mobileNumber, verifyOtp, resendOtp } = useAuthStore();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otp;
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await verifyOtp(code);
      setLoading(false);
      if (res.success) {
        if (res.requiresPasscode) {
          router.replace("/(auth)/passcode");
        } else {
          router.replace("/(main)/home");
        }
      } else {
        setError(res.message || res.error || "Invalid OTP. Please check the code and try again.");
      }
    } catch (err) {
      setLoading(false);
      setError(getErrorMessage(err) || "Failed to verify OTP.");
    }
  };

  const handleResend = async () => {
    if (timer === 0) {
      setTimer(30);
      setOtp("");
      setError("");
      await resendOtp();
      Alert.alert("OTP Resent", "A new verification code has been sent.");
    }
  };

  const renderOtpBoxes = () => {
    return Array.from({ length: 6 }).map((_, i) => {
      const char = otp[i] || "";
      const isCurrent = i === otp.length;
      return (
        <View
          key={i}
          style={[
            styles.otpBox,
            getOtpBoxDynamicStyle(isCurrent, error),
          ]}
        >
          <Text style={styles.otpBoxText}>
            {char}
          </Text>
        </View>
      );
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={[styles.backBtnAbsolute, getBackBtnPosition(insets.top)]}
        >
          <Ionicons name="arrow-back" size={20} color={BrandColors.PRIMARY_BLUE} />
        </TouchableOpacity>

        <View style={styles.headerSection}>
          <Text style={styles.title}>
            Verification Code
          </Text>
          <Text style={styles.subTitle}>
            Enter the 6-digit OTP sent to {mobileNumber ? `+91 ${mobileNumber}` : "your mobile number"}
          </Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
            style={styles.otpTouchable}
          >
            <View style={styles.otpGrid}>{renderOtpBoxes()}</View>
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={(text) => {
              const clean = text.replace(/[^0-9]/g, "");
              setOtp(clean);
              if (error) setError("");
              if (clean.length === 6) {
                handleVerifyOtp(clean);
              }
            }}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.hiddenInput}
            autoFocus
          />

          {error ? (
            <Text style={styles.errorText}>
              {error}
            </Text>
          ) : null}

          <PrimaryButton
            title="Verify Code"
            onPress={handleVerifyOtp}
            loading={loading}
            colorType="orange"
            style={styles.verifyBtn}
          />

          <View style={styles.resendContainer}>
            {timer > 0 ? (
              <Text style={styles.resendText}>
                Resend code in{" "}
                <Text style={styles.timerText}>
                  0:{timer < 10 ? `0${timer}` : timer}
                </Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>
                  Resend OTP
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default OTPVerificationScreen;
