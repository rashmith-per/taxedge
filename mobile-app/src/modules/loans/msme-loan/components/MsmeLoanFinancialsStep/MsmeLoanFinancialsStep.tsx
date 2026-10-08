import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { LoanDetailsFormData, LoanEmploymentType } from "../../../types/loans.types";
import { LoanAmountInput, type LoanAmountPreset } from "../../../components/LoanAmountInput";
import { styles } from "./MsmeLoanFinancialsStep.styles";

export interface MsmeLoanFinancialsStepProps {
  data: LoanDetailsFormData;
  onChange: (field: keyof LoanDetailsFormData, value: LoanDetailsFormData[keyof LoanDetailsFormData]) => void;
  errors?: Record<string, string>;
}

const MSME_PURPOSES = [
  "CGTMSE Collateral Free Credit",
  "Micro Enterprise Growth",
  "Working Capital & Inventory",
  "Technology Upgradation",
  "Raw Material Purchase",
  "Export Market Development",
];

const TENURE_OPTIONS = [
  { label: "12 M (1 Yr)", value: "12" },
  { label: "24 M (2 Yrs)", value: "24" },
  { label: "36 M (3 Yrs)", value: "36" },
  { label: "48 M (4 Yrs)", value: "48" },
  { label: "60 M (5 Yrs)", value: "60" },
];

const AMOUNT_PRESETS: readonly LoanAmountPreset[] = [
  { label: "₹5 Lakhs", value: "500000" },
  { label: "₹15 Lakhs", value: "1500000" },
  { label: "₹25 Lakhs", value: "2500000" },
  { label: "₹50 Lakhs", value: "5000000" },
  { label: "₹1 Crore", value: "10000000" },
];

const EMPLOYMENT_TYPES: { label: string; value: LoanEmploymentType }[] = [
  { label: "Micro Enterprise (< ₹1 Cr)", value: "Business Owner" },
  { label: "Small Enterprise (< ₹10 Cr)", value: "Self-Employed Professional" },
  { label: "Medium Enterprise (< ₹50 Cr)", value: "Salaried" },
];

export const MsmeLoanFinancialsStep: React.FC<MsmeLoanFinancialsStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>MSME Scheme Credit Facility</Text>
      <Text style={styles.sectionSubtitle}>
        Specify credit requirement under MSME / CGTMSE priority schemes without external collateral.
      </Text>

      {/* Required Loan Amount */}
      <LoanAmountInput
        label="Required Credit Limit / Loan (₹)"
        required
        placeholder="e.g. 1500000"
        value={data.requiredAmount}
        onChange={(value) => onChange("requiredAmount", value)}
        presets={AMOUNT_PRESETS}
        error={errors.requiredAmount}
      />

      {/* MSME Scheme Purpose */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Credit Purpose / Scheme <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.purpose && styles.inputError]}
          placeholder="e.g. CGTMSE Scheme Working Capital"
          placeholderTextColor="#94A3B8"
          value={data.purpose}
          onChangeText={(text) => onChange("purpose", text)}
        />
        <View style={styles.chipRow}>
          {MSME_PURPOSES.map((purpose) => {
            const isSelected = data.purpose === purpose;
            return (
              <TouchableOpacity
                key={purpose}
                onPress={() => onChange("purpose", purpose)}
                style={[styles.chip, isSelected && styles.chipActive]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextActive,
                  ]}
                >
                  {purpose}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.purpose && (
          <Text style={styles.errorText}>{errors.purpose}</Text>
        )}
      </View>

      {/* Preferred Tenure */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Sanction Period / Tenure <Text style={styles.requiredStar}>*</Text>
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

      {/* Enterprise Tier */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          MSME Classification Tier <Text style={styles.requiredStar}>*</Text>
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

      {/* Monthly Sales / Turnover */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Average Monthly Sales / Turnover (₹) <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            errors.monthlyIncomeOrTurnover && styles.inputError,
          ]}
          placeholder="e.g. 250000"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={data.monthlyIncomeOrTurnover}
          onChangeText={(text) => onChange("monthlyIncomeOrTurnover", text)}
        />
        {errors.monthlyIncomeOrTurnover && (
          <Text style={styles.errorText}>{errors.monthlyIncomeOrTurnover}</Text>
        )}
      </View>

      {/* Existing Loans */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Existing Active Bank Borrowings?</Text>
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
              Debt Free Unit
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
              Yes, Active Debts
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Existing EMI */}
      {data.hasExistingLoans && (
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Total Ongoing Monthly EMI (₹) <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.existingEmi && styles.inputError]}
            placeholder="e.g. 15000"
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

export default MsmeLoanFinancialsStep;
