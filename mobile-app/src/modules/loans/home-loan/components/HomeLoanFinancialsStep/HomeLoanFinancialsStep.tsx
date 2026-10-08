import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "../../../../../shared/theme";
import { LoanDetailsFormData } from "../../../types/loans.types";
import { LoanAmountInput, type LoanAmountPreset } from "../../../components/LoanAmountInput";
import { styles } from "./HomeLoanFinancialsStep.styles";

export interface HomeLoanFinancialsStepProps {
  data: LoanDetailsFormData;
  onChange: (field: keyof LoanDetailsFormData, value: LoanDetailsFormData[keyof LoanDetailsFormData]) => void;
  errors?: Record<string, string>;
}

const PROPERTY_PURPOSES = [
  "New Apartment / Flat Purchase",
  "House Construction (Self-build)",
  "Resale Property Purchase",
  "Plot Purchase + Construction",
  "Home Renovation / Extension",
  "Balance Transfer (Takeover)",
  "Top-up on Existing Home Loan",
  "Others",
];

const TENURE_OPTIONS = [
  { label: "10 Yrs (120 M)", value: "120" },
  { label: "15 Yrs (180 M)", value: "180" },
  { label: "20 Yrs (240 M)", value: "240" },
  { label: "25 Yrs (300 M)", value: "300" },
  { label: "30 Yrs (360 M)", value: "360" },
];

const AMOUNT_PRESETS: readonly LoanAmountPreset[] = [
  { label: "₹25 Lakhs", value: "2500000" },
  { label: "₹50 Lakhs", value: "5000000" },
  { label: "₹75 Lakhs", value: "7500000" },
  { label: "₹1 Crore", value: "10000000" },
  { label: "₹2 Crores", value: "20000000" },
];

const PROPERTY_STAGES: (
  | "Ready to Move"
  | "Under Construction"
  | "Resale Property"
  | "Plot + Construction"
  | "Self Construction"
)[] = [
  "Ready to Move",
  "Under Construction",
  "Resale Property",
  "Plot + Construction",
  "Self Construction",
];

export const HomeLoanFinancialsStep: React.FC<HomeLoanFinancialsStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const [isPurposeModalOpen, setIsPurposeModalOpen] = useState(false);

  const isOthersSelected = data.purpose === "Others";

  const handleSelectPurpose = (item: string) => {
    onChange("purpose", item);
    setIsPurposeModalOpen(false);
    if (item !== "Others") {
      onChange("customPurpose", "");
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Required Loan Amount Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons name="cash-outline" size={20} color={BrandColors.PRIMARY_ORANGE || "#EA580C"} />
            <Text style={styles.cardTitle}>Required Home Loan Amount</Text>
          </View>
        </View>
        <Text style={styles.cardDescription}>
          Enter your required loan amount or select one of the quick presets below.
        </Text>

        <LoanAmountInput
          label="Amount (₹)"
          required
          placeholder="Enter required loan amount (₹)"
          value={data.requiredAmount}
          onChange={(value) => onChange("requiredAmount", value)}
          presets={AMOUNT_PRESETS}
          error={errors.requiredAmount}
        />
      </View>

      {/* 2. Property Intent / Purpose Card (Dropdown with Others) */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons name="business-outline" size={20} color={BrandColors.PRIMARY_ORANGE || "#EA580C"} />
            <Text style={styles.cardTitle}>Property Intent / Purpose</Text>
          </View>
        </View>
        <Text style={styles.cardDescription}>
          Select the housing requirement. Select &quot;Others&quot; if your specific property purpose is not listed.
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Select Intent / Purpose <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.dropdownSelector,
              Boolean(data.purpose) && styles.dropdownSelectorActive,
              errors.purpose && styles.inputError,
            ]}
            onPress={() => setIsPurposeModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text
              style={
                data.purpose ? styles.dropdownText : styles.dropdownPlaceholder
              }
            >
              {data.purpose || "Select Property Intent / Purpose..."}
            </Text>
            <Ionicons
              name="chevron-down"
              size={18}
              color={data.purpose ? (BrandColors.PRIMARY_ORANGE || "#EA580C") : "#64748B"}
            />
          </TouchableOpacity>
          {errors.purpose && (
            <Text style={styles.errorText}>{errors.purpose}</Text>
          )}

          {/* Conditional input if Others is selected */}
          {isOthersSelected && (
            <View style={styles.customInputContainer}>
              <Text style={styles.label}>
                Specify Custom Property Intent <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  errors.customPurpose && styles.inputError,
                ]}
                placeholder="Enter custom property intent / purpose"
                placeholderTextColor="#94A3B8"
                value={data.customPurpose || ""}
                onChangeText={(text) => onChange("customPurpose", text)}
              />
              {errors.customPurpose && (
                <Text style={styles.errorText}>{errors.customPurpose}</Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* 3. Preferred Tenure Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons name="time-outline" size={20} color={BrandColors.PRIMARY_ORANGE || "#EA580C"} />
            <Text style={styles.cardTitle}>Repayment Tenure</Text>
          </View>
        </View>
        <Text style={styles.cardDescription}>
          Select your intended loan tenure. Longer tenure lowers monthly EMI burden.
        </Text>

        <View style={styles.tenureGrid}>
          {TENURE_OPTIONS.map((item) => {
            const isSelected = Boolean(data.preferredTenureMonths) && data.preferredTenureMonths === item.value;
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

      {/* 4. Property Stage & Estimated Cost Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons name="home-outline" size={20} color={BrandColors.PRIMARY_ORANGE || "#EA580C"} />
            <Text style={styles.cardTitle}>Property Details & Valuation</Text>
          </View>
        </View>
        <Text style={styles.cardDescription}>
          Current development stage and total agreement or estimated cost of the target property.
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Property Construction Stage</Text>
          <View style={styles.stageGrid}>
            {PROPERTY_STAGES.map((stage) => {
              const isSelected = Boolean(data.propertyStage) && data.propertyStage === stage;
              return (
                <TouchableOpacity
                  key={stage}
                  activeOpacity={0.7}
                  onPress={() => onChange("propertyStage", stage)}
                  style={[styles.stagePill, isSelected && styles.stagePillActive]}
                >
                  <Text
                    style={[
                      styles.stagePillText,
                      isSelected && styles.stagePillTextActive,
                    ]}
                  >
                    {stage}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Estimated Total Property Cost / Agreement Value (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter estimated property cost / agreement value (₹)"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={data.estimatedPropertyValue || ""}
            onChangeText={(text) => onChange("estimatedPropertyValue", text)}
          />
        </View>
      </View>

      {/* Dropdown Modal for Purpose */}
      <Modal
        visible={isPurposeModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPurposeModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsPurposeModalOpen(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Select Property Intent / Purpose</Text>
              <TouchableOpacity onPress={() => setIsPurposeModalOpen(false)}>
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {PROPERTY_PURPOSES.map((purpose) => {
                const isSelected = data.purpose === purpose;
                return (
                  <TouchableOpacity
                    key={purpose}
                    style={[
                      styles.optionItem,
                      isSelected && styles.optionItemActive,
                    ]}
                    onPress={() => handleSelectPurpose(purpose)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextActive,
                      ]}
                    >
                      {purpose}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={BrandColors.PRIMARY_ORANGE || "#EA580C"}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default HomeLoanFinancialsStep;
