/**
 * Component: GstPaymentSuccessStep
 * Migrated from internal StyleSheet to external styles module.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "./GstPaymentSuccessStep.styles";

export interface GstPaymentSuccessStepProps {
  amount?: string;
  serviceName?: string;
  txnId?: string;
  paymentMethod?: string;
  filingPeriod?: string;
  gstin?: string;
  onViewReceipt: () => void;
  onViewApplication: () => void;
}

export const GstPaymentSuccessStep: React.FC<GstPaymentSuccessStepProps> = ({
  amount = "Amount unavailable",
  serviceName = "GST Filing (GSTR-3B)",
  txnId = "Not available",
  paymentMethod = "UPI",
  filingPeriod = "July 2026",
  gstin = "Not provided",
  onViewReceipt,
  onViewApplication,
}) => {
  const router = useRouter();

  const formattedDateTime = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={styles.container}>
      {/* Top Blue Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={32} color={BrandColors.PRIMARY_ORANGE} />
        </View>

        <Text style={styles.heroTitle}>Payment Successful!</Text>
        <Text style={styles.heroSubtitle}>Your return preparation has been initiated.</Text>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount Paid</Text>
          <Text style={styles.amountValue}>{amount}</Text>
        </View>
      </View>

      {/* Transaction Details Card */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsHeading}>Transaction Summary</Text>
        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Transaction ID</Text>
          <Text style={styles.value}>{txnId}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Service</Text>
          <Text style={styles.value}>{serviceName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>GSTIN</Text>
          <Text style={styles.value}>{gstin}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Filing Period</Text>
          <Text style={styles.value}>{filingPeriod}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Payment Method</Text>
          <Text style={styles.value}>{paymentMethod}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Date & Time</Text>
          <Text style={styles.value}>{formattedDateTime}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={14} color={BrandColors.PRIMARY_ORANGE} />
            <Text style={styles.statusText}>Successful</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons: View Receipt / View Application */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.receiptBtn}
          activeOpacity={0.8}
          onPress={onViewReceipt}
        >
          <Ionicons name="download-outline" size={16} color={BrandColors.PRIMARY_ORANGE} />
          <Text style={styles.receiptBtnText}>View Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.applicationBtn}
          activeOpacity={0.85}
          onPress={onViewApplication}
        >
          <Text style={styles.applicationBtnText}>Track Application</Text>
        </TouchableOpacity>
      </View>

      {/* Back to Home Link */}
      <TouchableOpacity
        style={styles.homeLink}
        activeOpacity={0.7}
        onPress={() => router.replace("/(main)/home")}
      >
        <Text style={styles.homeLinkText}>Back to Home Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};
