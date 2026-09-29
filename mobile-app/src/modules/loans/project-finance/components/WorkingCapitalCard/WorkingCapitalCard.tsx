import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { WorkingCapitalForm } from "../../types/step4Types";
import { styles } from "./WorkingCapitalCard.styles";

export interface WorkingCapitalCardProps {
  data: WorkingCapitalForm;
  onChange: (field: keyof WorkingCapitalForm, value: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const WorkingCapitalCard: React.FC<WorkingCapitalCardProps> = ({
  data,
  onChange,
  isExpanded: externalExpanded,
  onToggleExpand: externalToggle,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const isExpanded = externalExpanded !== undefined ? externalExpanded : internalExpanded;
  const onToggleExpand = externalToggle || (() => setInternalExpanded((p) => !p));
  const handleDaysChange = (field: "inventoryDays" | "receivableDays" | "payableDays", val: string) => {
    onChange(field, val);
    const inv = field === "inventoryDays" ? parseFloat(val) || 0 : parseFloat(data.inventoryDays) || 0;
    const rec = field === "receivableDays" ? parseFloat(val) || 0 : parseFloat(data.receivableDays) || 0;
    const pay = field === "payableDays" ? parseFloat(val) || 0 : parseFloat(data.payableDays) || 0;
    const cycle = inv + rec - pay;
    onChange("operatingCycleDays", cycle > 0 ? cycle.toString() : "0");
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onToggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name="refresh-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>8. Working Capital</Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#64748B"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.cardBody}>
          <Text style={styles.subtitle}>
            Enter working capital assumptions.
          </Text>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>
                Inventory Days <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter days"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={data.inventoryDays}
                onChangeText={(t) => handleDaysChange("inventoryDays", t)}
              />
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>
                Receivable Days <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter days"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={data.receivableDays}
                onChangeText={(t) => handleDaysChange("receivableDays", t)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>
                Payable Days <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter days"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={data.payableDays}
                onChangeText={(t) => handleDaysChange("payableDays", t)}
              />
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Operating Cycle (Days)</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                placeholder="Auto calculated"
                placeholderTextColor="#94A3B8"
                editable={false}
                value={data.operatingCycleDays ? `${data.operatingCycleDays} Days` : ""}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default WorkingCapitalCard;
