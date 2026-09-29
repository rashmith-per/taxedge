import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ProjectCostForm } from "../../types/projectFinance.types";
import { styles } from "./ProjectCostCard.styles";

interface ProjectCostCardProps {
  data: ProjectCostForm;
  onChange: (field: keyof ProjectCostForm, value: any) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const ProjectCostCard: React.FC<ProjectCostCardProps> = ({
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
            <Ionicons name="cash-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>1. Total Project Cost (Capex Breakup)</Text>
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
          {/* Land & Site Development Cost */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Land & Site Development Cost (₹) <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 15000000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.landDevelopmentCost}
              onChangeText={(text) => onChange("landDevelopmentCost", text)}
            />
          </View>

          {/* Civil Works Cost */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Civil Works & Building Construction (₹){" "}
              <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 25000000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.civilWorksCost}
              onChangeText={(text) => onChange("civilWorksCost", text)}
            />
          </View>

          {/* Plant & Machinery Cost */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Plant & Machinery / Equipment Cost (₹){" "}
              <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 40000000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.plantMachineryCost}
              onChangeText={(text) => onChange("plantMachineryCost", text)}
            />
          </View>

          {/* Engineering & Technical Knowhow Cost */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Engineering & Technical Knowhow Cost (₹){" "}
              <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5000000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.engineeringKnowhowCost}
              onChangeText={(text) => onChange("engineeringKnowhowCost", text)}
            />
          </View>

          {/* Preliminary Expenses */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Preliminary & Pre-operative Expenses (₹){" "}
              <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 3000000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.preliminaryExpenses}
              onChangeText={(text) => onChange("preliminaryExpenses", text)}
            />
          </View>

          {/* Margin Money for Working Capital */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Margin Money for Working Capital (₹){" "}
              <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2000000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.workingCapitalMargin}
              onChangeText={(text) => onChange("workingCapitalMargin", text)}
            />
          </View>

          {/* Contingency Margin */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contingency Provision (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2500000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.contingencyMargin}
              onChangeText={(text) => onChange("contingencyMargin", text)}
            />
          </View>

          {/* Total Estimated Project Cost */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Total Estimated Project Cost (₹) <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.totalInput]}
              placeholder="e.g. 92500000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.totalProjectCost}
              onChangeText={(text) => onChange("totalProjectCost", text)}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default ProjectCostCard;
