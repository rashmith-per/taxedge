import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { LoanBusinessFormData } from "../../../types/loans.types";
import { Dropdown } from "../../../../../shared/components/Dropdown";
import { styles } from "./MachineryLoanBusinessStep.styles";

export interface MachineryLoanBusinessStepProps {
  data: LoanBusinessFormData;
  onChange: (field: keyof LoanBusinessFormData, value: any) => void;
  errors?: Record<string, string>;
}

export const BUSINESS_TYPE_OPTIONS = [
  "Proprietorship",
  "Partnership",
  "LLP",
  "Private Limited",
  "Other",
];

export const BUSINESS_VINTAGE_OPTIONS = [
  "Less than 1 year",
  "1–3 years",
  "3–5 years",
  "5–10 years",
  "10+ years",
];

export const MachineryLoanBusinessStep: React.FC<MachineryLoanBusinessStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const isOtherBusinessType =
    data.businessType === "Other" ||
    (Boolean(data.businessType) &&
      !BUSINESS_TYPE_OPTIONS.slice(0, -1).includes(data.businessType || ""));

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Business Details</Text>
      <Text style={styles.sectionSubtitle}>
        Provide essential business information and enterprise identity.
      </Text>

      {/* Business / Plant Name */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Business / Plant Name <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.businessName && styles.inputError]}
          placeholder="Enter business name"
          placeholderTextColor="#94A3B8"
          value={data.businessName}
          onChangeText={(text) => onChange("businessName", text)}
        />
        {errors.businessName && (
          <Text style={styles.errorText}>{errors.businessName}</Text>
        )}
      </View>

      {/* Business Type */}
      <View style={styles.fieldGroup}>
        <Dropdown
          label="Business Type"
          required
          placeholder="Select business type"
          options={BUSINESS_TYPE_OPTIONS}
          value={isOtherBusinessType && data.businessType !== "Other" ? "Other" : data.businessType}
          onSelect={(val) => {
            if (val === "Other") {
              onChange("businessType", "Other");
            } else {
              onChange("businessType", val);
              onChange("otherBusinessType", "");
            }
          }}
          error={errors.businessType}
        />

        {isOtherBusinessType && (
          <View style={styles.customFieldWrapper}>
            <Text style={styles.label}>
              Specify Business Type <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors.otherBusinessType && styles.inputError,
              ]}
              placeholder="e.g. Trust / Co-operative Society"
              placeholderTextColor="#94A3B8"
              value={data.otherBusinessType || (data.businessType !== "Other" ? data.businessType : "")}
              onChangeText={(text) => {
                onChange("otherBusinessType", text);
                onChange("businessType", text || "Other");
              }}
            />
            {errors.otherBusinessType && (
              <Text style={styles.errorText}>{errors.otherBusinessType}</Text>
            )}
          </View>
        )}
      </View>

      {/* Business Vintage */}
      <View style={styles.fieldGroup}>
        <Dropdown
          label="Business Vintage"
          required
          placeholder="Select vintage"
          options={BUSINESS_VINTAGE_OPTIONS}
          value={data.businessVintageYears}
          onSelect={(val) => onChange("businessVintageYears", val)}
          error={errors.businessVintageYears}
        />
      </View>

      {/* Annual Turnover */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Annual Turnover <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.annualTurnover && styles.inputError]}
          placeholder="Enter annual turnover (₹)"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={data.annualTurnover}
          onChangeText={(text) => onChange("annualTurnover", text)}
        />
        {errors.annualTurnover && (
          <Text style={styles.errorText}>{errors.annualTurnover}</Text>
        )}
      </View>

      {/* GST Registered? */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>GST Registered?</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onChange("isGstRegistered", true)}
            style={[
              styles.toggleButton,
              data.isGstRegistered && styles.toggleButtonActive,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                data.isGstRegistered && styles.toggleTextActive,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              onChange("isGstRegistered", false);
              onChange("gstin", "");
            }}
            style={[
              styles.toggleButton,
              !data.isGstRegistered && styles.toggleButtonActive,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                !data.isGstRegistered && styles.toggleTextActive,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conditional GSTIN */}
      {data.isGstRegistered && (
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            GSTIN <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.gstin && styles.inputError]}
            placeholder="Enter GSTIN (e.g. 24AABCP1234F1Z9)"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
            maxLength={15}
            value={data.gstin}
            onChangeText={(text) => onChange("gstin", text.toUpperCase())}
          />
          {errors.gstin && <Text style={styles.errorText}>{errors.gstin}</Text>}
        </View>
      )}
    </View>
  );
};

export default MachineryLoanBusinessStep;

