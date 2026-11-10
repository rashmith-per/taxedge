import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "./GstBusinessStep.styles";
import { GstBusinessFormData, FormErrors } from "./GstBusinessStep";

interface ConsentSectionProps {
  aadhaarConsent?: boolean;
  error?: string;
  onConsentChange: (value: boolean) => void;
  consentYRef: React.MutableRefObject<number>;
  fieldOffsetsRef: React.MutableRefObject<Record<string, number>>;
  onSectionLayout?: (section: "bank" | "signatory" | "consent", y: number) => void;
  onFieldLayout?: (field: string, y: number) => void;
}

export const GstConsentSection: React.FC<ConsentSectionProps> = React.memo(({
  aadhaarConsent,
  error,
  onConsentChange,
  consentYRef,
  fieldOffsetsRef,
  onSectionLayout,
  onFieldLayout,
}) => {
  const isChecked = Boolean(aadhaarConsent);
  return (
    <View
      style={styles.sectionCard}
      onLayout={(e) => {
        const y = e.nativeEvent.layout.y;
        consentYRef.current = y;
        fieldOffsetsRef.current.aadhaarConsent = y;
        onSectionLayout?.("consent", y);
        onFieldLayout?.("aadhaarConsent", y);
      }}
    >
      <View style={styles.consentRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onConsentChange(!isChecked)}
          style={styles.checkboxTouch}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isChecked }}
          accessibilityLabel="Aadhaar authentication consent"
        >
          <Ionicons
            name={isChecked ? "checkbox" : "square-outline"}
            size={24}
            color={isChecked ? BrandColors.PRIMARY_ORANGE : "#94A3B8"}
          />
        </TouchableOpacity>
        <Text style={styles.consentText}>
          I consent to Aadhaar authentication (e-KYC) for this GST registration.
        </Text>
      </View>
      {error ? (
        <Text style={[styles.errorText, styles.errorTextMarginBottom]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
});
GstConsentSection.displayName = "GstConsentSection";
