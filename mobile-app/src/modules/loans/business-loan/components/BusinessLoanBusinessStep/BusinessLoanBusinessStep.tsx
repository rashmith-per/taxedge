import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "../../../../../shared/theme";
import { LoanBusinessFormData } from "../../../types/loans.types";
import { styles } from "./BusinessLoanBusinessStep.styles";

export interface BusinessLoanBusinessStepProps {
  data: LoanBusinessFormData;
  onChange: (field: keyof LoanBusinessFormData, value: LoanBusinessFormData[keyof LoanBusinessFormData]) => void;
  errors?: Record<string, string>;
}

const BUSINESS_CONSTITUTIONS = [
  "Proprietorship",
  "Partnership",
  "LLP",
  "Private Limited",
  "Public Limited",
  "Others",
];

const VINTAGE_OPTIONS = [
  { label: "< 1 Year", value: "< 1 Year" },
  { label: "1 - 2 Years", value: "1 - 2 Years" },
  { label: "3 - 5 Years", value: "3 - 5 Years" },
  { label: "5 - 10 Years", value: "5 - 10 Years" },
  { label: "10+ Years", value: "10+ Years" },
];

export const BusinessLoanBusinessStep: React.FC<BusinessLoanBusinessStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const [isConstitutionModalOpen, setIsConstitutionModalOpen] = useState(false);
  const [customConstitution, setCustomConstitution] = useState(
    data.businessConstitution && !BUSINESS_CONSTITUTIONS.includes(data.businessConstitution)
      ? data.businessConstitution
      : ""
  );

  const isOthersConstitutionSelected =
    data.businessConstitution === "Others" ||
    (Boolean(data.businessConstitution) && !BUSINESS_CONSTITUTIONS.includes(data.businessConstitution as any));

  const handleSelectConstitution = (item: string) => {
    setIsConstitutionModalOpen(false);
    if (item === "Others") {
      onChange("businessConstitution", customConstitution || "Others");
    } else {
      onChange("businessConstitution", item);
    }
  };

  const handleCustomConstitutionChange = (text: string) => {
    setCustomConstitution(text);
    onChange("businessConstitution", text);
  };

  const [hasUdyamToggle, setHasUdyamToggle] = useState<boolean>(
    Boolean(data.hasUdyam)
  );

  const handleUdyamToggle = (val: boolean) => {
    setHasUdyamToggle(val);
    onChange("hasUdyam", val);
    if (!val) {
      onChange("udyamRegistration", "");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Enterprise & Commercial Profile</Text>
      <Text style={styles.sectionSubtitle}>
        Provide your firm's registration credentials and key business information.
      </Text>

      {/* 1. Registered Business / Firm Name */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Ionicons name="business" size={16} color={BrandColors.PRIMARY_ORANGE || "#FF7A00"} />
            </View>
            <Text style={styles.cardTitle}>
              Registered Business / Firm Name <Text style={styles.requiredStar}>*</Text>
            </Text>
          </View>
        </View>

        <TextInput
          style={[styles.input, errors.businessName && styles.inputError]}
          placeholder="e.g. Apex Enterprises Pvt Ltd"
          placeholderTextColor="#94A3B8"
          value={data.businessName}
          onChangeText={(text) => onChange("businessName", text)}
        />
        {errors.businessName && <Text style={styles.errorText}>{errors.businessName}</Text>}
      </View>

      {/* 2. Business Constitution / Type */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Ionicons name="git-network-outline" size={16} color={BrandColors.PRIMARY_ORANGE || "#FF7A00"} />
            </View>
            <Text style={styles.cardTitle}>
              Business Constitution / Type <Text style={styles.requiredStar}>*</Text>
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsConstitutionModalOpen(true)}
          style={[
            styles.dropdownSelector,
            Boolean(data.businessConstitution) && styles.dropdownSelectorActive,
            errors.businessConstitution && styles.inputError,
          ]}
        >
          <Text
            style={
              data.businessConstitution
                ? styles.dropdownText
                : styles.dropdownPlaceholder
            }
          >
            {data.businessConstitution || "Select Business Constitution / Type..."}
          </Text>
          <Ionicons
            name="chevron-down"
            size={18}
            color={
              data.businessConstitution
                ? BrandColors.PRIMARY_ORANGE || "#EA580C"
                : "#64748B"
            }
          />
        </TouchableOpacity>
        {errors.businessConstitution && (
          <Text style={styles.errorText}>{errors.businessConstitution}</Text>
        )}

        {/* Conditional input if Others is selected */}
        {isOthersConstitutionSelected && (
          <View style={styles.customInputContainer}>
            <Text style={styles.fieldLabel}>
              Specify Business Type / Constitution <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors.businessConstitution && styles.inputError,
              ]}
              placeholder="e.g. Trust, Society, Joint Venture"
              placeholderTextColor="#94A3B8"
              value={customConstitution}
              onChangeText={handleCustomConstitutionChange}
            />
          </View>
        )}
      </View>

      {/* 3. GSTIN */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Ionicons name="card" size={16} color={BrandColors.PRIMARY_ORANGE || "#FF7A00"} />
            </View>
            <Text style={styles.cardTitle}>
              GSTIN <Text style={styles.requiredStar}>*</Text>
            </Text>
          </View>
        </View>

        <TextInput
          style={[styles.input, errors.gstin && styles.inputError]}
          placeholder="e.g. 29ABCDE1234F1Z5"
          placeholderTextColor="#94A3B8"
          autoCapitalize="characters"
          maxLength={15}
          value={data.gstin}
          onChangeText={(text) => onChange("gstin", text.toUpperCase().trim().slice(0, 15))}
        />
        <Text style={styles.helperText}>15-character Goods & Services Tax Number</Text>
        {errors.gstin && <Text style={styles.errorText}>{errors.gstin}</Text>}
      </View>

      {/* 4. Udyam Registration Number */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Ionicons name="settings-outline" size={16} color={BrandColors.PRIMARY_ORANGE || "#FF7A00"} />
            </View>
            <Text style={styles.cardTitle}>Udyam Registration Number (MSME)</Text>
          </View>

          <View style={styles.toggleSwitch}>
            <TouchableOpacity
              onPress={() => handleUdyamToggle(true)}
              style={[styles.toggleBtn, hasUdyamToggle && styles.toggleBtnActive]}
            >
              <Text style={[styles.toggleText, hasUdyamToggle && styles.toggleTextActive]}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleUdyamToggle(false)}
              style={[styles.toggleBtn, !hasUdyamToggle && styles.toggleBtnActive]}
            >
              <Text style={[styles.toggleText, !hasUdyamToggle && styles.toggleTextActive]}>No</Text>
            </TouchableOpacity>
          </View>
        </View>

        {hasUdyamToggle && (
          <TextInput
            style={[styles.input, errors.udyamRegistration && styles.inputError]}
            placeholder="e.g. UDYAM-MH-01-0012345"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
            value={data.udyamRegistration}
            onChangeText={(text) => onChange("udyamRegistration", text.toUpperCase())}
          />
        )}
        <Text style={styles.helperText}>
          Qualifies your business for priority MSME and CGTMSE guarantee schemes.
        </Text>
        {errors.udyamRegistration && <Text style={styles.errorText}>{errors.udyamRegistration}</Text>}
      </View>

      {/* 5. Business Vintage */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Ionicons name="calendar" size={16} color={BrandColors.PRIMARY_ORANGE || "#FF7A00"} />
            </View>
            <Text style={styles.cardTitle}>
              Business Vintage (Years in Operation) <Text style={styles.requiredStar}>*</Text>
            </Text>
          </View>
        </View>

        <View style={styles.chipRow}>
          {VINTAGE_OPTIONS.map((item) => {
            const isSelected = data.businessVintageYears === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                activeOpacity={0.7}
                onPress={() => onChange("businessVintageYears", item.value)}
                style={[styles.chip, isSelected && styles.chipActive]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.businessVintageYears && <Text style={styles.errorText}>{errors.businessVintageYears}</Text>}
      </View>

      {/* 6. Annual Turnover */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Ionicons name="bar-chart" size={16} color={BrandColors.PRIMARY_ORANGE || "#FF7A00"} />
            </View>
            <Text style={styles.cardTitle}>
              Annual Turnover (FY 2024-25 / Latest) (₹) <Text style={styles.requiredStar}>*</Text>
            </Text>
          </View>
        </View>

        <TextInput
          style={[styles.input, errors.annualTurnover && styles.inputError]}
          placeholder="Enter your amount"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={data.annualTurnover}
          onChangeText={(text) => onChange("annualTurnover", text.replace(/[^0-9]/g, ""))}
        />
        {errors.annualTurnover && <Text style={styles.errorText}>{errors.annualTurnover}</Text>}
      </View>

      {/* 7. Annual Net Profit */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Ionicons name="cash-outline" size={16} color={BrandColors.PRIMARY_ORANGE || "#FF7A00"} />
            </View>
            <Text style={styles.cardTitle}>
              Annual Net Profit (After Tax) (₹) <Text style={styles.requiredStar}>*</Text>
            </Text>
          </View>
        </View>

        <TextInput
          style={[styles.input, errors.netProfit && styles.inputError]}
          placeholder="Enter your amount"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={data.netProfit}
          onChangeText={(text) => onChange("netProfit", text.replace(/[^0-9]/g, ""))}
        />
        {errors.netProfit && <Text style={styles.errorText}>{errors.netProfit}</Text>}
      </View>

      {/* 8. Authorized Signatory Details */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Ionicons name="person" size={16} color={BrandColors.PRIMARY_ORANGE || "#FF7A00"} />
            </View>
            <Text style={styles.cardTitle}>
              Authorized Signatory Details <Text style={styles.requiredStar}>*</Text>
            </Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.gridCol}>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={[styles.input, errors.signatoryName && styles.inputError]}
              placeholder="e.g. Ramesh Kumar"
              placeholderTextColor="#94A3B8"
              value={data.signatoryName}
              onChangeText={(text) => onChange("signatoryName", text)}
            />
            {errors.signatoryName && <Text style={styles.errorText}>{errors.signatoryName}</Text>}
          </View>
          <View style={styles.gridCol}>
            <Text style={styles.fieldLabel}>Designation</Text>
            <TextInput
              style={[styles.input, errors.signatoryDesignation && styles.inputError]}
              placeholder="e.g. Director / Partner / Proprietor"
              placeholderTextColor="#94A3B8"
              value={data.signatoryDesignation}
              onChangeText={(text) => onChange("signatoryDesignation", text)}
            />
            {errors.signatoryDesignation && <Text style={styles.errorText}>{errors.signatoryDesignation}</Text>}
          </View>
        </View>

        <View style={styles.emailFieldWrapper}>
          <Text style={styles.fieldLabel}>Email (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. ramesh@company.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            value={data.signatoryEmail}
            onChangeText={(text) => onChange("signatoryEmail", text)}
          />
        </View>
      </View>

      {/* Dropdown Modal for Business Constitution */}
      <Modal
        visible={isConstitutionModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsConstitutionModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsConstitutionModalOpen(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Select Business Constitution / Type</Text>
              <TouchableOpacity onPress={() => setIsConstitutionModalOpen(false)}>
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {BUSINESS_CONSTITUTIONS.map((item) => {
                const isSelected =
                  data.businessConstitution === item ||
                  (item === "Others" && isOthersConstitutionSelected);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.optionItem,
                      isSelected && styles.optionItemActive,
                    ]}
                    onPress={() => handleSelectConstitution(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextActive,
                      ]}
                    >
                      {item}
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

export default BusinessLoanBusinessStep;
