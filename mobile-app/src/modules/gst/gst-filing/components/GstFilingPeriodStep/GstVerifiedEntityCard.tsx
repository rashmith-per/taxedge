import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./GstFilingPeriodStep.styles";

interface VerifiedEntityCardProps {
  isVerifiedEntity?: boolean;
  state?: string;
  tradeName?: string;
  businessName?: string;
  taxpayerScheme?: string;
}

export const GstVerifiedEntityCard: React.FC<VerifiedEntityCardProps> = React.memo(({
  isVerifiedEntity,
  state,
  tradeName,
  businessName,
  taxpayerScheme,
}) => {
  if (!isVerifiedEntity) return null;

  return (
    <View style={styles.verifiedCard}>
      <View style={styles.verifiedTopRow}>
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={15} color="#059669" />
          <Text style={styles.verifiedBadgeText}>
            Verified from GST Portal
          </Text>
        </View>
        <Text style={styles.verifiedStateText}>
          {state || "Active"}
        </Text>
      </View>
      <Text style={styles.verifiedTradeName}>
        {tradeName || businessName}
      </Text>
      <Text style={styles.verifiedLegalName}>{businessName}</Text>
      <View style={styles.schemePill}>
        <Text style={styles.schemePillText}>
          {taxpayerScheme || "Regular Scheme"}
        </Text>
      </View>
    </View>
  );
});
GstVerifiedEntityCard.displayName = "GstVerifiedEntityCard";
