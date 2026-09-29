import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { LoanDetailsFormData } from "../../../types/loans.types";
import { styles } from "./WorkingCapitalFinancialsStep.styles";

export interface WorkingCapitalFinancialsStepProps {
  data: LoanDetailsFormData;
  onChange: (field: keyof LoanDetailsFormData, value: any) => void;
  errors?: Record<string, string>;
}

const WC_PURPOSES = [
  "Working Capital",
  "Inventory / Stock",
  "Raw Material Purchase",
  "Supplier Payments",
  "Business Operating Expenses",
  "Receivables / Cash Flow Gap",
  "Other",
];

const WC_FACILITIES = [
  "Cash Credit (CC) Facility",
  "Overdraft (OD) Line",
  "Invoice / Bill Discounting",
];

const AMOUNT_PRESETS = [
  { label: "₹10 Lakhs", value: "1000000" },
  { label: "₹25 Lakhs", value: "2500000" },
  { label: "₹50 Lakhs", value: "5000000" },
  { label: "₹1 Crore", value: "10000000" },
  { label: "₹2.5 Crores", value: "25000000" },
];

export const WorkingCapitalFinancialsStep: React.FC<WorkingCapitalFinancialsStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  return (
    <View style={styles.container}>
      {/* Card 1: Credit Limit / Loan Amount */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Required Credit Limit</Text>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Required Credit Limit / Loan Amount (₹) <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.requiredAmount && styles.inputError]}
            placeholder="Enter required credit limit (₹)"
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
                style={[
                  styles.chip,
                  data.requiredAmount === item.value && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    data.requiredAmount === item.value && styles.chipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.requiredAmount && (
            <Text style={styles.errorText}>{errors.requiredAmount}</Text>
          )}
        </View>
      </View>

      {/* Card 2: Credit Purpose */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Working Capital Purpose</Text>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Credit Purpose <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={styles.chipRow}>
            {WC_PURPOSES.map((purpose) => {
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
      </View>

      {/* Card 3: Facility Type */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Facility Type</Text>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Preferred Facility Type <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={styles.chipRow}>
            {WC_FACILITIES.map((facility) => {
              const isSelected = data.employmentType === (facility as any);
              return (
                <TouchableOpacity
                  key={facility}
                  onPress={() => onChange("employmentType", facility as any)}
                  style={[styles.chip, isSelected && styles.chipActive]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextActive,
                    ]}
                  >
                    {facility}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Card 4: Existing Active Bank Borrowings */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Existing Active Bank Borrowings?</Text>
        <View style={styles.fieldGroup}>
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
                No Existing Lines
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

        {data.hasExistingLoans && (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Total Monthly Interest / EMI Outgo (₹) <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.existingEmi && styles.inputError]}
              placeholder="e.g. 25000"
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
    </View>
  );
};

export default WorkingCapitalFinancialsStep;
