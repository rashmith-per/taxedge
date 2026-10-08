import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "../../../../design-system/colors";
import { Spacing } from "../../../../design-system/spacing";
import { useAuthStore } from "../../store/authStore";
import { PrimaryButton } from "../../../../shared/components/Button/PrimaryButton";
import {
  styles,
  getBackBtnPosition,
  getDynamicScrollStyle,
  getDotBoxStyle,
} from "./PasscodeScreen.styles";

const HEADER_OFFSET = Spacing.md;
const FOOTER_OFFSET = Spacing.base;
const MIN_SCROLL_PADDING = Spacing.xl + Spacing.xs;

export function PasscodeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mobileNumber, loginWithPasscode } = useAuthStore();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  const phone = mobileNumber
    ? `+91 ${mobileNumber.slice(0, 5)} ${mobileNumber.slice(5)}`
    : "+91 XXXXX XXXXX";

  const handleLoginPress = async () => {
    if (passcode.length !== 6) {
      setError("Please enter your 6-digit passcode");
      inputRef.current?.focus();
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await loginWithPasscode(passcode);
      setLoading(false);

      if (res.success) {
        router.replace("/(main)/home");
      } else {
        setError(res.error || "Incorrect passcode. Please try again.");
        setPasscode("");
        inputRef.current?.focus();
      }
    } catch {
      setLoading(false);
      setError("Incorrect passcode. Please try again.");
      setPasscode("");
      inputRef.current?.focus();
    }
  };

  const dynamicScroll = getDynamicScrollStyle(
    insets.top,
    insets.bottom,
    HEADER_OFFSET,
    FOOTER_OFFSET,
    MIN_SCROLL_PADDING
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, dynamicScroll]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={[styles.backBtn, getBackBtnPosition(insets.top, HEADER_OFFSET)]}
        >
          <Ionicons name="arrow-back" size={20} color={BrandColors.PRIMARY_BLUE} />
        </TouchableOpacity>

        <View style={styles.wrapper}>
          <View style={styles.header}>
            <Image
              source={require("../../../../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Enter Passcode</Text>
            <Text style={styles.sub}>
              Logging in as{" "}
              <Text style={styles.phoneHighlight}>{phone}</Text>
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
            style={styles.dotsTouchable}
          >
            <View style={styles.dotsRow}>
              {Array.from({ length: 6 }).map((_, i) => {
                const isFilled = i < passcode.length;
                const isCurrent = i === passcode.length;
                return (
                  <View
                    key={i}
                    style={[
                      styles.dotBox,
                      getDotBoxStyle(isCurrent, error),
                    ]}
                  >
                    {isFilled ? <View style={styles.secureDot} /> : null}
                  </View>
                );
              })}
            </View>
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            value={passcode}
            onChangeText={(text) => {
              const clean = text.replace(/[^0-9]/g, "");
              setPasscode(clean);
              if (error) setError("");
              if (clean.length === 6) {
                setTimeout(() => {
                  loginWithPasscode(clean).then((res) => {
                    if (res.success) {
                      router.replace("/(main)/home");
                    } else {
                      setError(res.error || "Incorrect passcode. Please try again.");
                      setPasscode("");
                      inputRef.current?.focus();
                    }
                  });
                }, 50);
              }
            }}
            keyboardType="number-pad"
            maxLength={6}
            secureTextEntry
            style={styles.hiddenInput}
            autoFocus
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <PrimaryButton
            title="Login"
            onPress={handleLoginPress}
            loading={loading}
            disabled={passcode.length !== 6 || loading}
            colorType="orange"
            style={styles.loginBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default PasscodeScreen;
