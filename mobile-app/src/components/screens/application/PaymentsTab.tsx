import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "@/styles/app/application/[id].styles";
import type { RowItem } from "./types";

interface PaymentsTabProps {
  paymentRows: RowItem[];
  isGstAmendment: boolean;
  isPaid: boolean;
  totalAmount: number;
  paymentStatus: string;
}

export function PaymentsTab({
  paymentRows,
  isGstAmendment,
  isPaid,
  totalAmount,
  paymentStatus,
}: PaymentsTabProps) {
  const isCompletedOrComplimentary = isGstAmendment || isPaid;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <Ionicons name="card-outline" size={20} color="#083B75" />
        <Text style={styles.cardHeaderTitle}>Payment Summary</Text>
      </View>
      <View style={styles.paymentRowsWrap}>
        {paymentRows.map((r) => (
          <React.Fragment key={r.key}>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>{r.key}</Text>
              <Text
                style={[
                  styles.infoVal,
                  r.key === "Transaction ID"
                    ? { fontSize: 12.5, color: "#64748B" }
                    : null,
                ]}
              >
                {r.val}
              </Text>
            </View>
            <View style={styles.infoDivider} />
          </React.Fragment>
        ))}

        <View style={styles.infoRow}>
          <Text style={[styles.infoKey, styles.paymentTotalKey]}>
            Total Amount
          </Text>
          <Text style={[styles.infoVal, styles.paymentTotalVal]}>
            {isGstAmendment ? "₹0 (Free)" : `₹${totalAmount.toLocaleString()}`}
          </Text>
        </View>

        <View style={styles.infoDivider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Payment Status</Text>
          <View
            style={[
              styles.statusPillSmall,
              {
                backgroundColor: isCompletedOrComplimentary
                  ? "#ECFDF5"
                  : "#FFF1E8",
              },
            ]}
          >
            <Text
              style={[
                styles.statusPillSmallText,
                { color: isCompletedOrComplimentary ? "#059669" : "#EA580C" },
              ]}
            >
              {isGstAmendment ? "Complimentary" : paymentStatus}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
