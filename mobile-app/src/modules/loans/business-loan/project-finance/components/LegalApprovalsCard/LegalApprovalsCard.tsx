import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LegalApprovalsForm } from "../../types/projectFinance.types";
import { styles } from "./LegalApprovalsCard.styles";

interface LegalApprovalsCardProps {
  data: LegalApprovalsForm;
  onChange: (field: keyof LegalApprovalsForm, value: any) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const APPROVAL_ITEMS: { key: keyof LegalApprovalsForm; label: string }[] = [
  { key: "environmentalClearance", label: "Environmental Clearance (EC)" },
  { key: "landUseConversion", label: "Land Use Conversion (if required)" },
  { key: "buildingPlanApproval", label: "Building Plan Approval" },
  { key: "powerConnectionApproval", label: "Power Connection Approval" },
  { key: "factoryLicense", label: "Factory License (if applicable)" },
  { key: "waterSupplyApproval", label: "Water Supply Approval" },
  { key: "pollutionControlBoard", label: "Pollution Control Board (PCB)" },
  { key: "otherApproval", label: "Other (Please specify)" },
];

export const LegalApprovalsCard: React.FC<LegalApprovalsCardProps> = ({
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
          <Text style={styles.cardTitle}>2. Legal & Statutory Approvals</Text>
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
            Select the approvals and licenses applicable for your project.
          </Text>

          <View style={styles.grid}>
            {APPROVAL_ITEMS.map((item) => {
              const isSelected = !!data[item.key];
              return (
                <TouchableOpacity
                  key={item.key}
                  style={styles.checkboxItem}
                  onPress={() => onChange(item.key, !isSelected)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkboxBox,
                      isSelected && styles.checkboxBoxSelected,
                    ]}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {data.otherApproval && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Other Approval Details</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter details of other approvals"
                placeholderTextColor="#94A3B8"
                value={data.otherApprovalDetails || ""}
                onChangeText={(text) => onChange("otherApprovalDetails", text)}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default LegalApprovalsCard;
