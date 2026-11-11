import React from "react";
import { TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";

interface GstReviewEditButtonProps {
  onPress?: () => void;
  label?: string;
  accessibilityLabel?: string;
}

export const GstReviewEditButton: React.FC<GstReviewEditButtonProps> = React.memo(({
  onPress,
  label = "Edit",
  accessibilityLabel,
}) => (
  <TouchableOpacity
    style={styles.button}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel || label}
  >
    <Ionicons name="pencil" size={13} color={BrandColors.PRIMARY_ORANGE} />
    <Text style={styles.text}>{label}</Text>
  </TouchableOpacity>
));

GstReviewEditButton.displayName = "GstReviewEditButton";

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#FEF0E6",
    borderWidth: 1,
    borderColor: "#FDBA74",
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  text: {
    fontSize: 12.5,
    fontWeight: "700",
    color: BrandColors.PRIMARY_ORANGE,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
    }),
  },
});
