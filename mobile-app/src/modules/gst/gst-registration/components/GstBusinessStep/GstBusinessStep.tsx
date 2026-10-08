/**
 * Component: GstBusinessStep
 * Refactored: Functional modular architecture with strict TypeScript concepts,
 * helper functions, DRY renderers, and robust exception handling (< 400 lines).
 */

import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import { View, Text, TouchableOpacity, Keyboard } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "./GstBusinessStep.styles";
import { UniversalDatePicker } from "@/shared/components/UniversalDatePicker";
import { FormInput, FormSelect } from "./GstFormElements";
import { logger } from "@/core/logging/logger";

// --- CONSTANTS WITH 'as const' FOR STRICT TYPESCRIPT INFERENCE ---

export const BUSINESS_TYPES = [
  "Proprietorship", "Partnership Firm", "Limited Liability Partnership (LLP)",
  "Private Limited Company", "Public Limited Company", "HUF",
  "Society / Trust / Club", "AOP / BOI", "Government Department",
  "Foreign Company", "One Person Company (OPC)",
] as const;

export const NATURE_OF_BUSINESS = [
  "Trader", "Manufacturer", "Service Provider", "Wholesaler / Distributor",
  "Retailer", "Exporter / Importer", "Contractor / Freelancer",
] as const;

export const REASONS = [
  "Crossed turnover threshold", "Voluntary registration", "Inter-state supply",
  "E-commerce operator / seller", "Casual taxable person", "Input Service Distributor",
] as const;

export const COMPOSITION_OPTIONS = ["No - regular scheme", "Yes - composition scheme"] as const;
export const PLACE_OPTIONS = ["Principal place of business", "Additional place of business"] as const;
export const STATE_OPTIONS = [
  "Andhra Pradesh", "Delhi", "Gujarat", "Karnataka", "Maharashtra", "Tamil Nadu", "Telangana",
] as const;
export const BANK_OPTIONS = [
  "Axis Bank", "HDFC Bank", "ICICI Bank", "Kotak Mahindra Bank", "Punjab National Bank", "State Bank of India",
] as const;
export const ACCOUNT_TYPES = ["Current", "Savings", "Cash Credit / OD"] as const;

// Derived Union Types
export type BusinessType = (typeof BUSINESS_TYPES)[number];
export type NatureOfBusiness = (typeof NATURE_OF_BUSINESS)[number];
export type ReasonForRegistration = (typeof REASONS)[number];
export type CompositionOption = (typeof COMPOSITION_OPTIONS)[number];
export type PlaceOption = (typeof PLACE_OPTIONS)[number];
export type StateOption = (typeof STATE_OPTIONS)[number];
export type BankOption = (typeof BANK_OPTIONS)[number];
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export interface GstBusinessFormData {
  gstId?: string;
  customerId?: string;
  legalName: string;
  businessName: string;
  businessType: string;
  natureOfBusiness: string;
  placeOfBusiness: string;
  businessStartDate: string;
  reasonForRegistration: string;
  compositionScheme: string;
  businessAddress: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  hsnCode: string;
  accountHolderName: string;
  bankAccountNumber: string;
  confirmBankAccountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  accountType: string;
  signatoryName: string;
  signatoryPan: string;
  signatoryDob: string;
  signatoryDesignation: string;
  signatoryMobile: string;
  signatoryEmail: string;
  addressProofType: string;
  aadhaarConsent: boolean;
}

export type FormErrors = Partial<Record<keyof GstBusinessFormData, string>>;

// Field keys for automated accordion error expansion
const BANK_FIELD_KEYS: readonly (keyof GstBusinessFormData)[] = [
  "accountHolderName", "bankAccountNumber", "confirmBankAccountNumber",
  "ifscCode", "bankName", "branchName", "accountType",
];

const SIGNATORY_FIELD_KEYS: readonly (keyof GstBusinessFormData)[] = [
  "signatoryName", "signatoryPan", "signatoryDob",
  "signatoryDesignation", "signatoryMobile", "signatoryEmail",
];

// --- EXCEPTION HANDLING & SANITIZATION UTILITIES ---

function safeTransform(value: unknown, transformer: (val: string) => string): string {
  try {
    if (value === null || value === undefined) return "";
    return transformer(typeof value === "string" ? value : String(value));
  } catch (error) {
    logger.warn("[GstBusinessStep] Input transformation fallback", { error });
    return typeof value === "string" ? value : "";
  }
}

const sanitizeDigits = (val: string): string => safeTransform(val, (s) => s.replace(/\D/g, ""));
const sanitizeAlphanumericUpper = (val: string): string => safeTransform(val, (s) => s.replace(/[^a-zA-Z0-9]/g, "").toUpperCase());
const sanitizeUpper = (val: string): string => safeTransform(val, (s) => s.toUpperCase());

// --- FUNCTIONAL CARD & ACCORDION COMPONENTS ---

interface SectionCardProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = memo(({ iconName, title, subtitle, children }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconBox}>
        <Ionicons name={iconName} size={18} color={BrandColors.PRIMARY_ORANGE} />
      </View>
      <View style={styles.sectionTitleWrap}>
        <Text style={styles.sectionMainTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
    </View>
    {children}
  </View>
));
SectionCard.displayName = "SectionCard";

interface AccordionSectionProps {
  title: string;
  subtitle?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const AccordionSection: React.FC<AccordionSectionProps> = memo(
  ({ title, subtitle, iconName, isExpanded, onToggle, children }) => (
    <View style={styles.accordionCard}>
      <TouchableOpacity
        style={styles.accordionCardHeader}
        activeOpacity={0.7}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
      >
        <View style={styles.sectionHeaderWrap}>
          <View style={styles.sectionIconBox}>
            <Ionicons name={iconName} size={18} color={BrandColors.PRIMARY_ORANGE} />
          </View>
          <View style={styles.sectionTitleWrap}>
            <Text style={styles.sectionMainTitle}>{title}</Text>
            {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
      </TouchableOpacity>
      {isExpanded && <View style={styles.accordionCardContent}>{children}</View>}
    </View>
  )
);
AccordionSection.displayName = "AccordionSection";

// --- PROPS INTERFACE ---

interface Props {
  data: GstBusinessFormData;
  onChange: (fields: Partial<GstBusinessFormData>) => void;
  onBlurField?: (field: keyof GstBusinessFormData) => void;
  errors?: FormErrors;
  onRequestScrollToSection?: (sectionKey: "bank" | "signatory", y?: number) => void;
}

// --- MAIN COMPONENT ---

export const GstBusinessStep: React.FC<Props> = ({
  data,
  onChange,
  onBlurField,
  errors = {},
  onRequestScrollToSection,
}) => {
  const [isBankExpanded, setIsBankExpanded] = useState(false);
  const [isSignatoryExpanded, setIsSignatoryExpanded] = useState(false);
  const bankYRef = useRef(0);
  const signatoryYRef = useRef(0);

  useEffect(() => {
    try {
      if (BANK_FIELD_KEYS.some((field) => Boolean(errors[field]))) setIsBankExpanded(true);
    } catch (err) {
      logger.warn("[GstBusinessStep] Failed to evaluate bank errors:", { error: err });
    }
  }, [errors]);

  useEffect(() => {
    try {
      if (SIGNATORY_FIELD_KEYS.some((field) => Boolean(errors[field]))) setIsSignatoryExpanded(true);
    } catch (err) {
      logger.warn("[GstBusinessStep] Failed to evaluate signatory errors:", { error: err });
    }
  }, [errors]);

  const updateField = useCallback(
    <K extends keyof GstBusinessFormData>(field: K, value: GstBusinessFormData[K]) => {
      try {
        onChange({ [field]: value });
      } catch (err) {
        logger.warn("[GstBusinessStep] Error updating field:", { field: String(field), error: err });
      }
    },
    [onChange],
  );

  const blurField = useCallback(
    (field: keyof GstBusinessFormData) => {
      try {
        onBlurField?.(field);
      } catch (err) {
        logger.warn("[GstBusinessStep] Error blurring field:", { field: String(field), error: err });
      }
    },
    [onBlurField],
  );

  const renderInput = useCallback(
    (
      field: keyof GstBusinessFormData,
      label: string,
      placeholder: string,
      options?: {
        keyboardType?: "default" | "numeric" | "email-address";
        maxLength?: number;
        autoCapitalize?: "none" | "sentences" | "words" | "characters";
        transform?: (val: string) => string;
      },
    ) => {
      const val = (data?.[field] as string) ?? "";
      return (
        <FormInput
          key={field}
          label={label}
          value={val}
          onChange={(t) => updateField(field, (options?.transform ? options.transform(t) : t))}
          onBlur={() => blurField(field)}
          error={errors?.[field]}
          placeholder={placeholder}
          keyboardType={options?.keyboardType}
          maxLength={options?.maxLength}
          autoCapitalize={options?.autoCapitalize}
        />
      );
    },
    [data, errors, updateField, blurField],
  );

  const renderSelect = useCallback(
    (field: keyof GstBusinessFormData, label: string, placeholder: string, options: readonly string[]) => {
      const val = (data?.[field] as string) ?? "";
      return (
        <FormSelect
          key={field}
          label={label}
          value={val}
          options={options as string[]}
          onChange={(t) => updateField(field, t)}
          error={errors?.[field]}
          placeholder={placeholder}
        />
      );
    },
    [data, errors, updateField],
  );

  const renderDatePicker = useCallback(
    (field: keyof GstBusinessFormData, label: string) => {
      const val = (data?.[field] as string) ?? "";
      return (
        <UniversalDatePicker
          key={field}
          label={label}
          value={val}
          onChange={(d) => updateField(field, d)}
          error={errors?.[field]}
          valueFormat="DD-MM-YYYY"
          placeholder="DD-MM-YYYY"
        />
      );
    },
    [data, errors, updateField],
  );

  const renderBusinessIdentity = () => (
    <SectionCard
      iconName="storefront-outline"
      title="Business Identity"
      subtitle="Legal name and constitutional details"
    >
      {renderInput("legalName", "Legal Name of Business (as per PAN) *", "Exactly as on the PAN card")}
      {renderInput("businessName", "Trade Name *", "Enter your business / trade name")}
      {renderSelect("businessType", "Constitution of Business *", "Select business type", BUSINESS_TYPES)}
      {renderSelect("natureOfBusiness", "Nature of Business *", "Select nature of business", NATURE_OF_BUSINESS)}
      {renderDatePicker("businessStartDate", "Date of Commencement of Business *")}
    </SectionCard>
  );

  const renderRegistrationScheme = () => (
    <SectionCard
      iconName="ribbon-outline"
      title="Registration & Scheme"
      subtitle="Registration purpose and tax scheme"
    >
      {renderSelect("reasonForRegistration", "Reason for Registration *", "Select a reason", REASONS)}
      {renderSelect("compositionScheme", "Opting for Composition Scheme? *", "Select yes or no", COMPOSITION_OPTIONS)}
    </SectionCard>
  );

  const renderAddressSection = () => (
    <SectionCard
      iconName="location-outline"
      title="Principal Place of Business"
      subtitle="Registered business address & HSN details"
    >
      {renderSelect("placeOfBusiness", "Place of Business *", "Select place type", PLACE_OPTIONS)}
      {renderInput("businessAddress", "Business Address *", "Building, street, locality")}
      <View style={styles.row}>
        <View style={styles.halfField}>{renderInput("city", "City *", "City")}</View>
        <View style={styles.halfField}>{renderInput("district", "District *", "District")}</View>
      </View>
      <View style={styles.row}>
        <View style={styles.halfField}>{renderSelect("state", "State / UT *", "Select", STATE_OPTIONS)}</View>
        <View style={styles.halfField}>
          {renderInput("pinCode", "PIN Code *", "560001", { keyboardType: "numeric", maxLength: 6, transform: sanitizeDigits })}
        </View>
      </View>
      {renderInput("hsnCode", "Primary HSN / SAC Code *", "e.g. 998311", { keyboardType: "numeric", maxLength: 8, transform: sanitizeDigits })}
    </SectionCard>
  );

  const renderBankDetails = () => (
    <View onLayout={(e) => { bankYRef.current = e.nativeEvent.layout.y; }}>
      <AccordionSection
        iconName="wallet-outline"
        title="Bank Details"
        subtitle="Account for refunds & credits"
        isExpanded={isBankExpanded}
        onToggle={() => {
          const next = !isBankExpanded;
          setIsBankExpanded(next);
          if (next) {
            Keyboard.dismiss();
            onRequestScrollToSection?.("bank", bankYRef.current);
          }
        }}
      >
        {renderInput("accountHolderName", "Account Holder Name *", "As per bank records")}
        {renderInput("bankAccountNumber", "Bank Account Number *", "Enter account number", { keyboardType: "numeric", maxLength: 18, transform: sanitizeDigits })}
        {renderInput("confirmBankAccountNumber", "Confirm Account Number *", "Re-enter account number", { keyboardType: "numeric", maxLength: 18, transform: sanitizeDigits })}
        {renderInput("ifscCode", "IFSC Code *", "e.g. HDFC0001234", { autoCapitalize: "characters", maxLength: 11, transform: sanitizeAlphanumericUpper })}
        <View style={styles.row}>
          <View style={styles.halfField}>{renderSelect("bankName", "Bank Name *", "Select", BANK_OPTIONS)}</View>
          <View style={styles.halfField}>{renderInput("branchName", "Branch *", "Branch Name")}</View>
        </View>
        {renderSelect("accountType", "Account Type *", "Select account type", ACCOUNT_TYPES)}
      </AccordionSection>
    </View>
  );

  const renderSignatoryDetails = () => (
    <View onLayout={(e) => { signatoryYRef.current = e.nativeEvent.layout.y; }}>
      <AccordionSection
        iconName="person-circle-outline"
        title="Authorised Signatory"
        subtitle="Primary contact & PAN verification"
        isExpanded={isSignatoryExpanded}
        onToggle={() => {
          const next = !isSignatoryExpanded;
          setIsSignatoryExpanded(next);
          if (next) {
            Keyboard.dismiss();
            onRequestScrollToSection?.("signatory", signatoryYRef.current);
          }
        }}
      >
        {renderInput("signatoryName", "Signatory Name *", "Full name")}
        <View style={styles.row}>
          <View style={styles.halfField}>
            {renderInput("signatoryPan", "Signatory PAN *", "ABCDE1234F", { autoCapitalize: "characters", maxLength: 10, transform: sanitizeUpper })}
          </View>
          <View style={styles.halfField}>{renderDatePicker("signatoryDob", "Date of Birth *")}</View>
        </View>
        {renderInput("signatoryDesignation", "Designation *", "Proprietor / Director / Partner")}
        <View style={styles.row}>
          <View style={styles.halfField}>
            {renderInput("signatoryMobile", "Signatory Mobile *", "10-digit", { keyboardType: "numeric", maxLength: 10, transform: sanitizeDigits })}
          </View>
          <View style={styles.halfField}>
            {renderInput("signatoryEmail", "Signatory Email *", "email@business.com", { keyboardType: "email-address", autoCapitalize: "none" })}
          </View>
        </View>
      </AccordionSection>
    </View>
  );

  const renderConsentSection = () => {
    const isChecked = Boolean(data?.aadhaarConsent);
    return (
      <View style={styles.sectionCard}>
        <View style={styles.consentRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => updateField("aadhaarConsent", !isChecked)}
            style={styles.checkboxTouch}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isChecked }}
          >
            <Ionicons name={isChecked ? "checkbox" : "square-outline"} size={24} color={isChecked ? BrandColors.PRIMARY_ORANGE : "#94A3B8"} />
          </TouchableOpacity>
          <Text style={styles.consentText}>I consent to Aadhaar authentication (e-KYC) for this GST registration.</Text>
        </View>
        {errors?.aadhaarConsent ? (
          <Text style={[styles.errorText, styles.errorTextMarginBottom]}>{errors.aadhaarConsent}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderBusinessIdentity()}
      {renderRegistrationScheme()}
      {renderAddressSection()}
      {renderBankDetails()}
      {renderSignatoryDetails()}
      {renderConsentSection()}
    </View>
  );
};