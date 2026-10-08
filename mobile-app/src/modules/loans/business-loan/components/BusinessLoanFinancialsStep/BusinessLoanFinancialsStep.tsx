import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LoanDetailsFormData, LoanEmploymentType } from "../../../types/loans.types";
import { BrandColors } from "../../../../../shared/theme";
import { LoanAmountInput, type LoanAmountPreset } from "../../../components/LoanAmountInput";
import { styles } from "./BusinessLoanFinancialsStep.styles";

export interface BusinessLoanFinancialsStepProps {
  data: LoanDetailsFormData;
  onChange: (field: keyof LoanDetailsFormData, value: LoanDetailsFormData[keyof LoanDetailsFormData]) => void;
  errors?: Record<string, string>;
}

const EMPLOYMENT_PROFILES: LoanEmploymentType[] = [
  "Salaried",
  "Self-Employed Professional",
  "Business Owner",
];

const AMOUNT_PRESETS: readonly LoanAmountPreset[] = [
  { label: "₹5 Lakhs", value: "500000" },
  { label: "₹10 Lakhs", value: "1000000" },
  { label: "₹25 Lakhs", value: "2500000" },
  { label: "₹50 Lakhs", value: "5000000" },
  { label: "₹1 Crore", value: "10000000" },
];

const COMMON_PURPOSES = [
  "Business Expansion",
  "Working Capital & Inventory",
  "Machinery / Equipment Purchase",
  "Home Purchase / Construction",
  "Home Renovation",
  "Vehicle Purchase",
  "Debt Consolidation",
  "Personal / Medical Emergency",
  "Others",
];

const TENURE_PRESETS = [
  { label: "12 Mos (1 Yr)", value: "12" },
  { label: "24 Mos (2 Yrs)", value: "24" },
  { label: "36 Mos (3 Yrs)", value: "36" },
  { label: "60 Mos (5 Yrs)", value: "60" },
  { label: "84 Mos (7 Yrs)", value: "84" },
  { label: "120 Mos (10 Yrs)", value: "120" },
  { label: "240 Mos (20 Yrs)", value: "240" },
];

export const formatTenureEquivalent = (monthsStr: string): string => {
  if (!monthsStr) return "";
  const months = parseInt(monthsStr, 10);
  if (isNaN(months) || months <= 0) return "";

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${months} ${months === 1 ? "month" : "months"}`;
  }

  if (remainingMonths === 0) {
    return `${months} months (${years} ${years === 1 ? "year" : "years"})`;
  }

  return `${months} months (${years} ${years === 1 ? "year" : "years"} ${remainingMonths} ${remainingMonths === 1 ? "month" : "months"})`;
};

const isPresetTenure = (val?: string) =>
  Boolean(val && TENURE_PRESETS.some((item) => item.value === val));

export const BusinessLoanFinancialsStep: React.FC<BusinessLoanFinancialsStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const [isPurposeModalOpen, setIsPurposeModalOpen] = useState(false);
  const [customPurpose, setCustomPurpose] = useState(
    data.purpose && !COMMON_PURPOSES.includes(data.purpose)
      ? data.purpose
      : ""
  );

  const [isCustomTenure, setIsCustomTenure] = useState<boolean>(() => {
    return Boolean(
      data.preferredTenureMonths && !isPresetTenure(data.preferredTenureMonths)
    );
  });
  const [customTenureValue, setCustomTenureValue] = useState<string>(() => {
    return !isPresetTenure(data.preferredTenureMonths)
      ? data.preferredTenureMonths || ""
      : "";
  });
  const [customError, setCustomError] = useState("");

  const handleSelectPreset = (val: string) => {
    setIsCustomTenure(false);
    setCustomError("");
    onChange("preferredTenureMonths", val);
  };

  const validateAndPropagateCustom = (clean: string) => {
    if (!clean) {
      setCustomError("");
      onChange("preferredTenureMonths", "");
      return;
    }
    const num = parseInt(clean, 10);
    if (num < 1) {
      setCustomError("Tenure must be at least 1 month");
      onChange("preferredTenureMonths", clean);
    } else if (num > 240) {
      setCustomError("Maximum permitted tenure is 240 months (20 years)");
      onChange("preferredTenureMonths", clean);
    } else {
      setCustomError("");
      onChange("preferredTenureMonths", clean);
    }
  };

  const handleSelectCustom = () => {
    setIsCustomTenure(true);
    if (customTenureValue) {
      validateAndPropagateCustom(customTenureValue);
    } else {
      onChange("preferredTenureMonths", "");
    }
  };

  const handleCustomTenureChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, "");
    setCustomTenureValue(clean);
    validateAndPropagateCustom(clean);
  };

  const isOthersSelected =
    data.purpose === "Others" ||
    (Boolean(data.purpose) && !COMMON_PURPOSES.includes(data.purpose));

  const handleSelectPurpose = (purpose: string) => {
    setIsPurposeModalOpen(false);
    if (purpose === "Others") {
      onChange("purpose", customPurpose || "Others");
    } else {
      onChange("purpose", purpose);
    }
  };

  const handleCustomPurposeChange = (text: string) => {
    setCustomPurpose(text);
    onChange("purpose", text);
  };

  return (
    <View style={styles.container}>
      {/* 1. Employment / Business Profile */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Ionicons name="briefcase" size={16} color={BrandColors.PRIMARY_ORANGE || "#FF7A00"} />
            </View>
            <Text style={styles.cardTitle}>
              Employment / Business Profile <Text style={styles.requiredStar}>*</Text>
            </Text>
            <Ionicons name="information-circle-outline" size={16} color="#94A3B8" style={styles.infoIcon} />
          </View>
        </View>

        <View style={styles.profileRow}>
          {EMPLOYMENT_PROFILES.map((profile) => {
            const isSelected = data.employmentType === profile;
            return (
              <TouchableOpacity
                key={profile}
                activeOpacity={0.8}
                onPress={() => onChange("employmentType", profile)}
                style={[styles.profileBtn, isSelected && styles.profileBtnActive]}
              >
                <Text style={[styles.profileBtnText, isSelected && styles.profileBtnTextActive]}>
                  {profile}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.employmentType && <Text style={styles.errorText}>{errors.employmentType}</Text>}
      </View>

      {/* 2. Required Loan Amount */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Ionicons name="wallet" size={16} color={BrandColors.PRIMARY_ORANGE || "#FF7A00"} />
            </View>
            <Text style={styles.cardTitle}>
              Required Loan Amount (₹) <Text style={styles.requiredStar}>*</Text>
            </Text>
          </View>
        </View>

        <LoanAmountInput
          placeholder="Enter your required amount"
          value={data.requiredAmount}
          onChange={(value) => onChange("requiredAmount", value)}
          presets={AMOUNT_PRESETS}
          error={errors.requiredAmount}
        />
      </View>

      {/* 3. Purpose of Loan */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Ionicons name="location" size={16} color={BrandColors.PRIMARY_ORANGE || "#FF7A00"} />
            </View>
            <Text style={styles.cardTitle}>
              Purpose of Loan <Text style={styles.requiredStar}>*</Text>
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsPurposeModalOpen(true)}
          style={[
            styles.dropdownSelector,
            Boolean(data.purpose) && styles.dropdownSelectorActive,
            errors.purpose && styles.inputError,
          ]}
        >
          <Text
            style={
              data.purpose ? styles.dropdownText : styles.dropdownPlaceholder
            }
          >
            {data.purpose || "Select Purpose of Loan..."}
          </Text>
          <Ionicons
            name="chevron-down"
            size={18}
            color={
              data.purpose
                ? BrandColors.PRIMARY_ORANGE || "#EA580C"
                : "#64748B"
            }
          />
        </TouchableOpacity>
        {errors.purpose && (
          <Text style={styles.errorText}>{errors.purpose}</Text>
        )}

        {isOthersSelected && (
          <View style={styles.customInputContainer}>
            <Text style={styles.cardTitle}>
              Specify Custom Purpose <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors.purpose && styles.inputError,
              ]}
              placeholder="e.g. Working capital, technology upgrade"
              placeholderTextColor="#94A3B8"
              value={customPurpose}
              onChangeText={handleCustomPurposeChange}
            />
          </View>
        )}
      </View>

      {/* 4. Preferred Tenure */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Ionicons name="calendar" size={16} color={BrandColors.PRIMARY_ORANGE || "#FF7A00"} />
            </View>
            <Text style={styles.cardTitle}>
              Preferred Tenure (Months) <Text style={styles.requiredStar}>*</Text>
            </Text>
          </View>
        </View>

        <View style={styles.tenureGrid}>
          {TENURE_PRESETS.map((item) => {
            const isSelected = !isCustomTenure && data.preferredTenureMonths === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                activeOpacity={0.7}
                onPress={() => handleSelectPreset(item.value)}
                style={[styles.tenureBox, isSelected && styles.tenureBoxActive]}
              >
                <Text style={[styles.tenureText, isSelected && styles.tenureTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* + Custom Option */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSelectCustom}
            style={[
              styles.tenureBox,
              styles.tenureBoxCustom,
              isCustomTenure && styles.tenureBoxCustomActive,
            ]}
          >
            <Text
              style={[
                styles.tenureText,
                styles.tenureTextCustom,
                isCustomTenure && styles.tenureTextCustomActive,
              ]}
            >
              + Custom
            </Text>
          </TouchableOpacity>
        </View>

        {/* When the user selects Custom */}
        {isCustomTenure && (
          <View style={styles.customTenureSection}>
            <Text style={styles.customTenureTitle}>
              Enter Tenure (Months) <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.customTenureInput,
                (Boolean(customError) || Boolean(errors.preferredTenureMonths)) && styles.inputError,
              ]}
              placeholder="Enter months (e.g., 48)"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={customTenureValue}
              onChangeText={handleCustomTenureChange}
              maxLength={3}
            />
            {Boolean(customTenureValue) && !customError && (
              <Text style={styles.tenureEquivalentText}>
                {formatTenureEquivalent(customTenureValue)}
              </Text>
            )}
            {Boolean(customError) && (
              <Text style={styles.errorText}>{customError}</Text>
            )}
            {!customError && Boolean(errors.preferredTenureMonths) && (
              <Text style={styles.errorText}>{errors.preferredTenureMonths}</Text>
            )}
          </View>
        )}

        {!isCustomTenure && Boolean(errors.preferredTenureMonths) && (
          <Text style={styles.errorText}>{errors.preferredTenureMonths}</Text>
        )}
      </View>

      {/* 5. Monthly / Annual Revenue / Turnover */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Ionicons name="bar-chart" size={16} color={BrandColors.PRIMARY_ORANGE || "#FF7A00"} />
            </View>
            <Text style={styles.cardTitle}>
              Monthly / Annual Revenue / Turnover (₹) <Text style={styles.requiredStar}>*</Text>
            </Text>
          </View>
        </View>

        <TextInput
          style={[styles.input, errors.monthlyIncomeOrTurnover && styles.inputError]}
          placeholder="Enter your amount"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={data.monthlyIncomeOrTurnover}
          onChangeText={(text) => onChange("monthlyIncomeOrTurnover", text.replace(/[^0-9]/g, ""))}
        />
        {errors.monthlyIncomeOrTurnover && <Text style={styles.errorText}>{errors.monthlyIncomeOrTurnover}</Text>}
      </View>

      {/* 6. Do you have any existing loans? */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Ionicons name="document-text" size={16} color={BrandColors.PRIMARY_ORANGE || "#FF7A00"} />
            </View>
            <Text style={styles.cardTitle}>
              Do you have any existing loans? <Text style={styles.requiredStar}>*</Text>
            </Text>
          </View>
        </View>

        <View style={styles.radioGroup}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onChange("hasExistingLoans", false)}
            style={[styles.radioCard, data.hasExistingLoans === false && styles.radioCardActive]}
          >
            <View style={[styles.radioOuter, data.hasExistingLoans === false && styles.radioOuterActive]}>
              {data.hasExistingLoans === false && <View style={styles.radioInner} />}
            </View>
            <View style={styles.radioContent}>
              <Text style={styles.radioTitle}>No Existing Loans</Text>
              <Text style={styles.radioSubtitle}>
                I do not have any active loans with other lenders.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onChange("hasExistingLoans", true)}
            style={[styles.radioCard, data.hasExistingLoans === true && styles.radioCardActive]}
          >
            <View style={[styles.radioOuter, data.hasExistingLoans === true && styles.radioOuterActive]}>
              {data.hasExistingLoans === true && <View style={styles.radioInner} />}
            </View>
            <View style={styles.radioContent}>
              <Text style={styles.radioTitle}>Yes, Active Loans</Text>
              <Text style={styles.radioSubtitle}>
                I have one or more active loans with other lenders.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        {errors.hasExistingLoans && <Text style={styles.errorText}>{errors.hasExistingLoans}</Text>}
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
              <Text style={styles.modalTitle}>Select Purpose of Loan</Text>
              <TouchableOpacity onPress={() => setIsPurposeModalOpen(false)}>
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {COMMON_PURPOSES.map((purpose) => {
                const isSelected =
                  data.purpose === purpose ||
                  (purpose === "Others" && isOthersSelected);
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

export default BusinessLoanFinancialsStep;
