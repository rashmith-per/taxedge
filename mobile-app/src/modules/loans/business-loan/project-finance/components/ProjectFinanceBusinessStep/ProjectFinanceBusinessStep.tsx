import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { LoanBusinessFormData } from "../../../../types/loans.types";
import { styles } from "./ProjectFinanceBusinessStep.styles";

export interface ProjectFinanceBusinessStepProps {
  data: LoanBusinessFormData;
  onChange: (field: keyof LoanBusinessFormData, value: string) => void;
  errors?: Record<string, string>;
}

const VINTAGE_OPTIONS = [
  { label: "New SPV (0 Yrs)", value: "0" },
  { label: "1 - 3 Years", value: "2" },
  { label: "4 - 7 Years", value: "5" },
  { label: "8 - 12 Years", value: "10" },
  { label: "15+ Years", value: "16" },
];

export const ProjectFinanceBusinessStep: React.FC<ProjectFinanceBusinessStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Project Entity & Sponsor Details</Text>
      <Text style={styles.sectionSubtitle}>
        Provide the implementing SPV / Company credentials, statutory registration, and group turnover.
      </Text>

      {/* Implementing Entity Name */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Project Implementing Entity / SPV Name <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.businessName && styles.inputError]}
          placeholder="e.g. Apex Infra Projects Private Limited"
          placeholderTextColor="#94A3B8"
          value={data.businessName}
          onChangeText={(text) => onChange("businessName", text)}
        />
        {errors.businessName && (
          <Text style={styles.errorText}>{errors.businessName}</Text>
        )}
      </View>

      {/* GSTIN */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Project / Entity GSTIN <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.gstin && styles.inputError]}
          placeholder="e.g. 33AABCA1234F1Z1"
          placeholderTextColor="#94A3B8"
          autoCapitalize="characters"
          maxLength={15}
          value={data.gstin}
          onChangeText={(text) => onChange("gstin", text.toUpperCase())}
        />
        {errors.gstin && <Text style={styles.errorText}>{errors.gstin}</Text>}
      </View>

      {/* Udyam Registration */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Industrial Registration / CIN{" "}
          <Text style={styles.optionalTag}>(ROC Corporate ID)</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.udyamRegistration && styles.inputError]}
          placeholder="e.g. U45200DL2020PTC123456"
          placeholderTextColor="#94A3B8"
          autoCapitalize="characters"
          value={data.udyamRegistration}
          onChangeText={(text) =>
            onChange("udyamRegistration", text.toUpperCase())
          }
        />
        {errors.udyamRegistration && (
          <Text style={styles.errorText}>{errors.udyamRegistration}</Text>
        )}
      </View>

      {/* Vintage */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Sponsor / Group Vintage (Years) <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.vintageRow}>
          {VINTAGE_OPTIONS.map((item) => {
            const isSelected = data.businessVintageYears === item.value;
            return (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.7}
                onPress={() => onChange("businessVintageYears", item.value)}
                style={[
                  styles.vintageChip,
                  isSelected && styles.vintageChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.vintageChipText,
                    isSelected && styles.vintageChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.businessVintageYears && (
          <Text style={styles.errorText}>{errors.businessVintageYears}</Text>
        )}
      </View>

      {/* Annual Group Turnover */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Sponsor Group Annual Turnover (₹) <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.annualTurnover && styles.inputError]}
          placeholder="e.g. 50000000"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={data.annualTurnover}
          onChangeText={(text) => onChange("annualTurnover", text)}
        />
        {errors.annualTurnover && (
          <Text style={styles.errorText}>{errors.annualTurnover}</Text>
        )}
      </View>

      {/* Net Profit */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Sponsor Annual Net Profit (PAT) (₹) <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.netProfit && styles.inputError]}
          placeholder="e.g. 6500000"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={data.netProfit}
          onChangeText={(text) => onChange("netProfit", text)}
        />
        {errors.netProfit && (
          <Text style={styles.errorText}>{errors.netProfit}</Text>
        )}
      </View>
    </View>
  );
};

export default ProjectFinanceBusinessStep;
