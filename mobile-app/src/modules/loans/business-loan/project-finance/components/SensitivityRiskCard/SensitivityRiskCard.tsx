import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SensitivityRiskForm } from "../../types/projectFinance.types";
import { styles } from "./SensitivityRiskCard.styles";

interface SensitivityRiskCardProps {
  data: SensitivityRiskForm;
  onChange: (field: keyof SensitivityRiskForm, value: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const SensitivityRiskCard: React.FC<SensitivityRiskCardProps> = ({
  data,
  onChange,
  isExpanded,
  onToggleExpand,
}) => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onToggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name="document-text-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>5. Sensitivity & Risk (Optional)</Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#64748B"
        />
      </TouchableOpacity>

      {/* Body */}
      {isExpanded && (
        <View style={styles.cardBody}>
          <Text style={styles.subtitle}>
            Specify key assumptions for repayment under different scenarios.
          </Text>

          {/* Revenue Downside */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Revenue Downside (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter percentage"
              placeholderTextColor="#94A3B8"
              value={data.revenueDownside}
              onChangeText={(text) => onChange("revenueDownside", text)}
            />
          </View>

          {/* Cost Increase */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Cost Increase (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter percentage"
              placeholderTextColor="#94A3B8"
              value={data.costIncrease}
              onChangeText={(text) => onChange("costIncrease", text)}
            />
          </View>

          {/* Interest Rate Increase */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Interest Rate Increase (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter percentage"
              placeholderTextColor="#94A3B8"
              value={data.interestRateIncrease}
              onChangeText={(text) => onChange("interestRateIncrease", text)}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default SensitivityRiskCard;
