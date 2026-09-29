import React from "react";
import { View, Text, TouchableOpacity, TextInput, Switch } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { OtherComplianceForm } from "../../types/projectFinance.types";
import { styles } from "./OtherComplianceCard.styles";

interface OtherComplianceCardProps {
  data: OtherComplianceForm;
  onChange: (field: keyof OtherComplianceForm, value: any) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const OtherComplianceCard: React.FC<OtherComplianceCardProps> = ({
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
            <Ionicons name="receipt-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>5. Other Compliance</Text>
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
            Confirm compliance with other applicable regulations.
          </Text>

          {/* Labour Law Compliance */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Labour Law Compliance</Text>
            <View style={styles.switchContainer}>
              <Switch
                value={data.labourLawCompliance}
                onValueChange={(val) => onChange("labourLawCompliance", val)}
                trackColor={{ false: "#CBD5E1", true: "#F97316" }}
                thumbColor="#FFFFFF"
              />
              <Text
                style={[
                  styles.statusText,
                  { color: data.labourLawCompliance ? "#EA580C" : "#64748B" },
                ]}
              >
                {data.labourLawCompliance ? "Yes" : "No"}
              </Text>
            </View>
          </View>

          {/* Local Authority Approvals */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Local Authority Approvals</Text>
            <View style={styles.switchContainer}>
              <Switch
                value={data.localAuthorityApprovals}
                onValueChange={(val) => onChange("localAuthorityApprovals", val)}
                trackColor={{ false: "#CBD5E1", true: "#F97316" }}
                thumbColor="#FFFFFF"
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color: data.localAuthorityApprovals ? "#EA580C" : "#64748B",
                  },
                ]}
              >
                {data.localAuthorityApprovals ? "Yes" : "No"}
              </Text>
            </View>
          </View>

          {/* Health & Safety Compliance */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Health & Safety Compliance</Text>
            <View style={styles.switchContainer}>
              <Switch
                value={data.healthSafetyCompliance}
                onValueChange={(val) => onChange("healthSafetyCompliance", val)}
                trackColor={{ false: "#CBD5E1", true: "#F97316" }}
                thumbColor="#FFFFFF"
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color: data.healthSafetyCompliance ? "#EA580C" : "#64748B",
                  },
                ]}
              >
                {data.healthSafetyCompliance ? "Yes" : "No"}
              </Text>
            </View>
          </View>

          {/* Industry Specific Compliance */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Industry Specific Compliance</Text>
            <View style={styles.switchContainer}>
              <Switch
                value={data.industrySpecificCompliance}
                onValueChange={(val) =>
                  onChange("industrySpecificCompliance", val)
                }
                trackColor={{ false: "#CBD5E1", true: "#F97316" }}
                thumbColor="#FFFFFF"
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color: data.industrySpecificCompliance
                      ? "#EA580C"
                      : "#64748B",
                  },
                ]}
              >
                {data.industrySpecificCompliance ? "Yes" : "No"}
              </Text>
            </View>
          </View>

          {/* Any Pending Litigation? */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>
              Any Pending Litigation? <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={styles.switchContainer}>
              <Switch
                value={data.pendingLitigation}
                onValueChange={(val) => onChange("pendingLitigation", val)}
                trackColor={{ false: "#CBD5E1", true: "#F97316" }}
                thumbColor="#FFFFFF"
              />
              <Text
                style={[
                  styles.statusText,
                  { color: data.pendingLitigation ? "#EA580C" : "#64748B" },
                ]}
              >
                {data.pendingLitigation ? "Yes" : "No"}
              </Text>
            </View>
          </View>

          {/* If Yes, Details */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>If Yes, Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter details"
              placeholderTextColor="#94A3B8"
              value={data.litigationDetails}
              onChangeText={(text) => onChange("litigationDetails", text)}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default OtherComplianceCard;
