import React from "react";
import { View, Text, TextInput } from "react-native";
import { LoanDetailsFormData } from "../../../types/loans.types";
import { Dropdown } from "../../../../../shared/components/Dropdown";
import { styles } from "./MachineryLoanFinancialsStep.styles";

export interface MachineryLoanFinancialsStepProps {
  data: LoanDetailsFormData;
  onChange: (field: keyof LoanDetailsFormData, value: any) => void;
  errors?: Record<string, string>;
}

export const MACHINERY_AMOUNT_OPTIONS = [
  { label: "₹5 Lakhs", value: "500000" },
  { label: "₹10 Lakhs", value: "1000000" },
  { label: "₹15 Lakhs", value: "1500000" },
  { label: "₹25 Lakhs", value: "2500000" },
  { label: "₹30 Lakhs", value: "3000000" },
  { label: "₹50 Lakhs", value: "5000000" },
  { label: "₹1 Crore", value: "10000000" },
  { label: "₹2.5 Crores", value: "25000000" },
];

export const MACHINERY_EQUIPMENT_OPTIONS = [
  "CNC / Automation Machinery",
  "Medical Equipment",
  "Printing / Packaging Machinery",
  "Construction Machinery",
  "Food Processing Machinery",
  "Textile Machinery",
  "Other",
];

export const MACHINERY_TENURE_OPTIONS = [
  12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48,
  51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81, 84,
].map((months) => ({
  label: `${months} Months`,
  value: String(months),
}));

export const MachineryLoanFinancialsStep: React.FC<MachineryLoanFinancialsStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const isOtherEquipment =
    data.purpose === "Other" ||
    (Boolean(data.purpose) &&
      !MACHINERY_EQUIPMENT_OPTIONS.slice(0, -1).includes(data.purpose));

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Machinery Loan Details</Text>
      <Text style={styles.sectionSubtitle}>
        Specify required loan amount, machinery category, and repayment tenure.
      </Text>

      {/* Required Loan Amount */}
      <View style={styles.fieldGroup}>
        <Dropdown
          label="Required Loan Amount"
          required
          placeholder="Select amount"
          options={MACHINERY_AMOUNT_OPTIONS}
          value={data.requiredAmount}
          onSelect={(val) => onChange("requiredAmount", val)}
          error={errors.requiredAmount}
        />
      </View>

      {/* Machinery / Equipment Type */}
      <View style={styles.fieldGroup}>
        <Dropdown
          label="Machinery / Equipment Type"
          required
          placeholder="Select equipment type"
          options={MACHINERY_EQUIPMENT_OPTIONS}
          value={isOtherEquipment && data.purpose !== "Other" ? "Other" : data.purpose}
          onSelect={(val) => {
            if (val === "Other") {
              onChange("purpose", "Other");
            } else {
              onChange("purpose", val);
              onChange("customEquipmentType", "");
            }
          }}
          error={errors.purpose}
        />

        {isOtherEquipment && (
          <View style={styles.customFieldWrapper}>
            <Text style={styles.label}>
              Specify Equipment <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors.customEquipmentType && styles.inputError,
              ]}
              placeholder="e.g. Laser Cutting & Engraving System"
              placeholderTextColor="#94A3B8"
              value={data.customEquipmentType || (data.purpose !== "Other" ? data.purpose : "")}
              onChangeText={(text) => {
                onChange("customEquipmentType", text);
                onChange("purpose", text || "Other");
              }}
            />
            {errors.customEquipmentType && (
              <Text style={styles.errorText}>{errors.customEquipmentType}</Text>
            )}
          </View>
        )}
      </View>

      {/* Repayment Tenure */}
      <View style={styles.fieldGroup}>
        <Dropdown
          label="Repayment Tenure"
          required
          placeholder="Select tenure"
          options={MACHINERY_TENURE_OPTIONS}
          value={data.preferredTenureMonths}
          onSelect={(val) => onChange("preferredTenureMonths", val)}
          error={errors.preferredTenureMonths}
        />
      </View>
    </View>
  );
};

export default MachineryLoanFinancialsStep;

