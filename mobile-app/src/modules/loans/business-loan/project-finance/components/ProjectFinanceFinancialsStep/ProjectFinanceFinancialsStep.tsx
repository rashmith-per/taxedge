import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { LoanDetailsFormData, LoanEmploymentType } from "../../../../types/loans.types";
import { styles } from "./ProjectFinanceFinancialsStep.styles";

export interface ProjectFinanceFinancialsStepProps {
  data: LoanDetailsFormData;
  onChange: (field: keyof LoanDetailsFormData, value: any) => void;
  errors?: Record<string, string>;
}

const PROJECT_TYPES = [
  "Greenfield Manufacturing Plant",
  "Brownfield Expansion Project",
  "Solar / Renewable Energy",
  "Commercial Logistics Park",
  "Hospital / Healthcare Campus",
  "Infrastructure Concession",
];

const TENURE_OPTIONS = [
  { label: "3 Yrs (36 M)", value: "36" },
  { label: "5 Yrs (60 M)", value: "60" },
  { label: "7 Yrs (84 M)", value: "84" },
  { label: "10 Yrs (120 M)", value: "120" },
  { label: "15 Yrs (180 M)", value: "180" },
];

const AMOUNT_PRESETS = [
  { label: "₹1 Crore", value: "10000000" },
  { label: "₹2.5 Crores", value: "25000000" },
  { label: "₹5 Crores", value: "50000000" },
  { label: "₹10 Crores", value: "100000000" },
  { label: "₹25 Crores", value: "250000000" },
];

const EMPLOYMENT_TYPES: { label: string; value: LoanEmploymentType }[] = [
  { label: "Corporate / Consortium", value: "Business Owner" },
  { label: "Special Purpose Vehicle (SPV)", value: "Self-Employed Professional" },
  { label: "Joint Venture / Public-Private", value: "Salaried" },
];

export const ProjectFinanceFinancialsStep: React.FC<ProjectFinanceFinancialsStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Project Capex & Debt Requirement</Text>
      <Text style={styles.sectionSubtitle}>
        Specify total term loan requirement, project classification, and structured tenure.
      </Text>

      {/* Debt Amount */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Requested Debt / Term Loan (₹) <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.requiredAmount && styles.inputError]}
          placeholder="e.g. 50000000"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={data.requiredAmount}
          onChangeText={(text) => onChange("requiredAmount", text)}
        />
        <View style={styles.chipRow}>
          {AMOUNT_PRESETS.map((item) => (
            <TouchableOpacity
              key={item.value}
              onPress={() => onChange("requiredAmount", item.value)}
              style={styles.chip}
            >
              <Text style={styles.chipText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.requiredAmount && (
          <Text style={styles.errorText}>{errors.requiredAmount}</Text>
        )}
      </View>

      {/* Project Type */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Project Scope & Classification <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.purpose && styles.inputError]}
          placeholder="e.g. Greenfield 10MW Solar Plant"
          placeholderTextColor="#94A3B8"
          value={data.purpose}
          onChangeText={(text) => onChange("purpose", text)}
        />
        <View style={styles.chipRow}>
          {PROJECT_TYPES.map((type) => {
            const isSelected = data.purpose === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => onChange("purpose", type)}
                style={[styles.chip, isSelected && styles.chipActive]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.purpose && (
          <Text style={styles.errorText}>{errors.purpose}</Text>
        )}
      </View>

      {/* Structured Repayment Tenure */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Structured Repayment Tenure (including Moratorium) <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.tenureGrid}>
          {TENURE_OPTIONS.map((item) => {
            const isSelected = data.preferredTenureMonths === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                activeOpacity={0.7}
                onPress={() => onChange("preferredTenureMonths", item.value)}
                style={[styles.tenureBox, isSelected && styles.tenureBoxActive]}
              >
                <Text
                  style={[
                    styles.tenureText,
                    isSelected && styles.tenureTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.preferredTenureMonths && (
          <Text style={styles.errorText}>{errors.preferredTenureMonths}</Text>
        )}
      </View>

      {/* Sponsor Constitution */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Borrower Constitution <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.chipRow}>
          {EMPLOYMENT_TYPES.map((emp) => {
            const isSelected = data.employmentType === emp.value;
            return (
              <TouchableOpacity
                key={emp.value}
                onPress={() => onChange("employmentType", emp.value)}
                style={[styles.chip, isSelected && styles.chipActive]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextActive,
                  ]}
                >
                  {emp.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Expected Project Inflows */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Projected Annual EBITDA / Inflows (₹) <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            errors.monthlyIncomeOrTurnover && styles.inputError,
          ]}
          placeholder="e.g. 15000000"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={data.monthlyIncomeOrTurnover}
          onChangeText={(text) => onChange("monthlyIncomeOrTurnover", text)}
        />
        {errors.monthlyIncomeOrTurnover && (
          <Text style={styles.errorText}>{errors.monthlyIncomeOrTurnover}</Text>
        )}
      </View>

      {/* Existing Corporate Debt */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Existing Corporate / Sponsor Debt?</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            onPress={() => onChange("hasExistingLoans", false)}
            style={[
              styles.toggleButton,
              !data.hasExistingLoans && styles.toggleButtonActive,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                !data.hasExistingLoans && styles.toggleTextActive,
              ]}
            >
              Debt Free Sponsor
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onChange("hasExistingLoans", true)}
            style={[
              styles.toggleButton,
              data.hasExistingLoans && styles.toggleButtonActive,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                data.hasExistingLoans && styles.toggleTextActive,
              ]}
            >
              Yes, Active Debt Lines
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Existing Debt Outgo */}
      {data.hasExistingLoans && (
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Current Annual Debt Servicing Outgo (₹) <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.existingEmi && styles.inputError]}
            placeholder="e.g. 2000000"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={data.existingEmi}
            onChangeText={(text) => onChange("existingEmi", text)}
          />
          {errors.existingEmi && (
            <Text style={styles.errorText}>{errors.existingEmi}</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default ProjectFinanceFinancialsStep;
