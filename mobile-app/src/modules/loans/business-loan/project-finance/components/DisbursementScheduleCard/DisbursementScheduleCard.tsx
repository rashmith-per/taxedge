import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DisbursementScheduleForm } from "../../types/projectFinance.types";
import { ProjectFinanceDatePicker } from "../ProjectFinanceDatePicker/ProjectFinanceDatePicker";
import { styles } from "./DisbursementScheduleCard.styles";

interface DisbursementScheduleCardProps {
  data: DisbursementScheduleForm;
  onChange: (field: keyof DisbursementScheduleForm, value: any) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const DisbursementScheduleCard: React.FC<DisbursementScheduleCardProps> = ({
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
            <Ionicons name="calendar-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>3. Disbursement Schedule & Phasing</Text>
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
          {/* Phase 1 Amount */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Phase 1 Drawdown / Investment (₹) <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 50000000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.phase1Amount}
              onChangeText={(text) => onChange("phase1Amount", text)}
            />
          </View>

          {/* Phase 1 Milestone */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Phase 1 Milestone <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Land Acquisition & Foundation Civil Works"
              placeholderTextColor="#94A3B8"
              value={data.phase1Milestone}
              onChangeText={(text) => onChange("phase1Milestone", text)}
            />
          </View>

          {/* Phase 2 Amount */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Phase 2 Drawdown / Investment (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 42500000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.phase2Amount}
              onChangeText={(text) => onChange("phase2Amount", text)}
            />
          </View>

          {/* Phase 2 Milestone */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Phase 2 Milestone</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Plant & Machinery Erection & Trial Run"
              placeholderTextColor="#94A3B8"
              value={data.phase2Milestone}
              onChangeText={(text) => onChange("phase2Milestone", text)}
            />
          </View>

          {/* Expected COD Date */}
          <ProjectFinanceDatePicker
            label="Expected Commercial Operations Date (COD)"
            required
            value={data.expectedCodDate}
            onChange={(dateStr) => onChange("expectedCodDate", dateStr)}
          />
        </View>
      )}
    </View>
  );
};

export default DisbursementScheduleCard;
