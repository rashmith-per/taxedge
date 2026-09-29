/**
 * Component: GstBusinessStep
 * Migrated from internal StyleSheet to external styles module.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "./GstBusinessStep.styles";

const BUSINESS_TYPES = [
  "Proprietorship",
  "Partnership Firm",
  "Limited Liability Partnership (LLP)",
  "Private Limited Company",
  "Public Limited Company",
  "HUF",
  "Society / Trust / Club",
  "AOP / BOI",
  "Government Department",
  "Foreign Company",
  "One Person Company (OPC)",
];

const NATURE_OF_BUSINESS = [
  "Trader",
  "Manufacturer",
  "Service Provider",
  "Wholesaler / Distributor",
  "Retailer",
  "Exporter / Importer",
  "Contractor / Freelancer",
];

const REASONS_FOR_REGISTRATION = [
  "Crossed turnover threshold",
  "Voluntary registration",
  "Inter-state supply",
  "E-commerce operator / seller",
  "Casual taxable person",
  "Input Service Distributor",
];

const COMPOSITION_SCHEME_OPTIONS = [
  "No - regular scheme",
  "Yes - composition scheme",
];

const PLACE_OF_BUSINESS_OPTIONS = [
  "Principal place of business",
  "Additional place of business",
];

const STATE_OPTIONS = [
  "Andhra Pradesh",
  "Delhi",
  "Gujarat",
  "Karnataka",
  "Maharashtra",
  "Tamil Nadu",
  "Telangana",
];

const BANK_OPTIONS = [
  "Axis Bank",
  "HDFC Bank",
  "ICICI Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "State Bank of India",
];

const ACCOUNT_TYPE_OPTIONS = [
  "Current",
  "Savings",
  "Cash Credit / OD",
];

const ADDRESS_PROOF_TYPES = [
  "Rental Agreement",
  "Ownership Proof",
  "Electricity Bill",
  "Other Address Proof",
];

export interface GstBusinessFormData {
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

interface GstBusinessStepProps {
  data: GstBusinessFormData;
  onChange: (fields: Partial<GstBusinessFormData>) => void;
  onBlurField?: (field: keyof GstBusinessFormData) => void;
  errors?: Record<string, string>;
}

export const GstBusinessStep: React.FC<GstBusinessStepProps> = ({
  data,
  onChange,
  onBlurField,
  errors = {},
}) => {
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showNatureModal, setShowNatureModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showCompositionModal, setShowCompositionModal] = useState(false);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showAccountTypeModal, setShowAccountTypeModal] = useState(false);

  // Accordion states
  const [isBankExpanded, setIsBankExpanded] = useState(false);
  const [isSignatoryExpanded, setIsSignatoryExpanded] = useState(false);

  // Auto-expand accordions if they contain errors (checked when submit is pressed)
  useEffect(() => {
    const hasBankError = Boolean(errors.accountHolderName || errors.bankAccountNumber || errors.confirmBankAccountNumber || errors.ifscCode || errors.bankName || errors.branchName || errors.accountType);
    if (hasBankError) setIsBankExpanded(true);
  }, [errors.accountHolderName, errors.bankAccountNumber, errors.confirmBankAccountNumber, errors.ifscCode, errors.bankName, errors.branchName, errors.accountType]);

  useEffect(() => {
    const hasSignatoryError = Boolean(errors.signatoryName || errors.signatoryPan || errors.signatoryDob || errors.signatoryDesignation || errors.signatoryMobile || errors.signatoryEmail);
    if (hasSignatoryError) setIsSignatoryExpanded(true);
  }, [errors.signatoryName, errors.signatoryPan, errors.signatoryDob, errors.signatoryDesignation, errors.signatoryMobile, errors.signatoryEmail]);

  // Calendar State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<"businessStartDate" | "signatoryDob" | null>(null);
  const [pickerYear, setPickerYear] = useState(2020);
  const [pickerMonth, setPickerMonth] = useState(0);
  const [pickerDay, setPickerDay] = useState(1);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const openCalendarModal = (target: "businessStartDate" | "signatoryDob") => {
    setDatePickerTarget(target);
    const dateValue = data[target];
    if (dateValue) {
      const parts = dateValue.split("-");
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
          setPickerDay(d);
          setPickerMonth(m);
          setPickerYear(y);
        }
      }
    } else {
      // Default to today
      const today = new Date();
      setPickerDay(today.getDate());
      setPickerMonth(today.getMonth());
      setPickerYear(today.getFullYear());
    }
    setShowDatePicker(true);
  };

  const confirmCalendarDate = () => {
    if (!datePickerTarget) return;
    const dayStr = String(pickerDay).padStart(2, "0");
    const monthStr = String(pickerMonth + 1).padStart(2, "0");
    const yearStr = String(pickerYear);
    onChange({ [datePickerTarget]: `${dayStr}-${monthStr}-${yearStr}` });
    setShowDatePicker(false);
  };

  const handleBankAccChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    onChange({ bankAccountNumber: cleaned });
  };

  const handleIfscChange = (text: string) => {
    const cleaned = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    onChange({ ifscCode: cleaned });
  };

  return (
    <View style={styles.container}>
      {/* Legal Name of Business */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Legal Name of Business (as per PAN) *</Text>
        <TextInput
          style={[styles.input, errors.legalName && styles.inputError]}
          placeholder="Exactly as on the PAN card"
          placeholderTextColor="#94A3B8"
          value={data.legalName}
          onChangeText={(t) => onChange({ legalName: t })}
          onBlur={() => onBlurField?.("legalName")}
        />
        {errors.legalName ? (
          <Text style={styles.errorText}>{errors.legalName}</Text>
        ) : null}
      </View>

      {/* Trade Name */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Trade Name *</Text>
        <TextInput
          style={[styles.input, errors.businessName && styles.inputError]}
          placeholder="Enter your business / trade name"
          placeholderTextColor="#94A3B8"
          value={data.businessName}
          onChangeText={(t) => onChange({ businessName: t })}
          onBlur={() => onBlurField?.("businessName")}
        />
        {errors.businessName ? (
          <Text style={styles.errorText}>{errors.businessName}</Text>
        ) : null}
      </View>

      {/* Constitution of Business */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Constitution of Business *</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowTypeModal(true)}
          style={[styles.selectInput, errors.businessType && styles.inputError]}
        >
          <Text style={[styles.selectText, !data.businessType && styles.placeholderText]}>
            {data.businessType || "Select business type"}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#1E293B" />
        </TouchableOpacity>
        {errors.businessType ? (
          <Text style={styles.errorText}>{errors.businessType}</Text>
        ) : null}
      </View>

      {/* Nature of Business */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Nature of Business *</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowNatureModal(true)}
          style={[styles.selectInput, errors.natureOfBusiness && styles.inputError]}
        >
          <Text style={[styles.selectText, !data.natureOfBusiness && styles.placeholderText]}>
            {data.natureOfBusiness || "Select nature of business"}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#1E293B" />
        </TouchableOpacity>
        {errors.natureOfBusiness ? (
          <Text style={styles.errorText}>{errors.natureOfBusiness}</Text>
        ) : null}
      </View>

      {/* Date of Commencement of Business */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Date of Commencement of Business *</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => openCalendarModal("businessStartDate")}
          style={[styles.dateInput, errors.businessStartDate && styles.inputError, { height: 50, paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
        >
          <Text style={[styles.selectText, !data.businessStartDate && styles.placeholderText, { flex: 1, fontSize: 13 }]} numberOfLines={1}>
            {data.businessStartDate || "DD-MM-YYYY"}
          </Text>
          <Ionicons
            name="calendar-outline"
            size={18}
            color={errors.businessStartDate ? "#DC2626" : BrandColors.PRIMARY_ORANGE}
          />
        </TouchableOpacity>
        {errors.businessStartDate ? (
          <Text style={styles.errorText}>{errors.businessStartDate}</Text>
        ) : null}
      </View>

      {/* Reason for Registration */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Reason for Registration *</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowReasonModal(true)}
          style={[styles.selectInput, errors.reasonForRegistration && styles.inputError]}
        >
          <Text style={[styles.selectText, !data.reasonForRegistration && styles.placeholderText]}>
            {data.reasonForRegistration || "Select a reason"}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#1E293B" />
        </TouchableOpacity>
        {errors.reasonForRegistration ? (
          <Text style={styles.errorText}>{errors.reasonForRegistration}</Text>
        ) : null}
      </View>

      {/* Opting for Composition Scheme? */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Opting for Composition Scheme? *</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowCompositionModal(true)}
          style={[styles.selectInput, errors.compositionScheme && styles.inputError]}
        >
          <Text style={[styles.selectText, !data.compositionScheme && styles.placeholderText]}>
            {data.compositionScheme || "Select yes or no"}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#1E293B" />
        </TouchableOpacity>
        {errors.compositionScheme ? (
          <Text style={styles.errorText}>{errors.compositionScheme}</Text>
        ) : null}
      </View>

      {/* Place of Business */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Place of Business *</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowPlaceModal(true)}
          style={[styles.selectInput, errors.placeOfBusiness && styles.inputError]}
        >
          <Text style={[styles.selectText, !data.placeOfBusiness && styles.placeholderText]}>
            {data.placeOfBusiness || "Select place type"}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#1E293B" />
        </TouchableOpacity>
        {errors.placeOfBusiness ? (
          <Text style={styles.errorText}>{errors.placeOfBusiness}</Text>
        ) : null}
      </View>

      {/* Business Address */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Business Address *</Text>
        <TextInput
          style={[styles.input, errors.businessAddress && styles.inputError]}
          placeholder="Building, street, locality"
          placeholderTextColor="#94A3B8"
          value={data.businessAddress}
          onChangeText={(t) => onChange({ businessAddress: t })}
          onBlur={() => onBlurField?.("businessAddress")}
        />
        {errors.businessAddress ? (
          <Text style={styles.errorText}>{errors.businessAddress}</Text>
        ) : null}
      </View>

      {/* City & District Row */}
      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={[styles.input, errors.city && styles.inputError]}
            placeholder="City"
            placeholderTextColor="#94A3B8"
            value={data.city}
            onChangeText={(t) => onChange({ city: t })}
            onBlur={() => onBlurField?.("city")}
          />
          {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>District *</Text>
          <TextInput
            style={[styles.input, errors.district && styles.inputError]}
            placeholder="District"
            placeholderTextColor="#94A3B8"
            value={data.district}
            onChangeText={(t) => onChange({ district: t })}
            onBlur={() => onBlurField?.("district")}
          />
          {errors.district ? <Text style={styles.errorText}>{errors.district}</Text> : null}
        </View>
      </View>

      {/* State & PIN Code Row */}
      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>State / UT *</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowStateModal(true)}
            style={[styles.selectInput, errors.state && styles.inputError]}
          >
            <Text style={[styles.selectText, !data.state && styles.placeholderText, { flex: 1, paddingRight: 4 }]} numberOfLines={1}>
              {data.state || "Select"}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#1E293B" />
          </TouchableOpacity>
          {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>PIN Code *</Text>
          <TextInput
            style={[styles.input, errors.pinCode && styles.inputError]}
            placeholder="560001"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            maxLength={6}
            value={data.pinCode}
            onChangeText={(t) => onChange({ pinCode: t.replace(/\D/g, "") })}
            onBlur={() => onBlurField?.("pinCode")}
          />
          {errors.pinCode ? <Text style={styles.errorText}>{errors.pinCode}</Text> : null}
        </View>
      </View>

      {/* Primary HSN / SAC Code */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Primary HSN / SAC Code *</Text>
        <TextInput
          style={[styles.input, errors.hsnCode && styles.inputError]}
          placeholder="e.g. 998311"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          maxLength={8}
          value={data.hsnCode}
          onChangeText={(t) => onChange({ hsnCode: t.replace(/\D/g, "") })}
          onBlur={() => onBlurField?.("hsnCode")}
        />
        {errors.hsnCode ? (
          <Text style={styles.errorText}>{errors.hsnCode}</Text>
        ) : null}
      </View>

      {/* Bank Details Section */}
      <TouchableOpacity
        style={styles.accordionHeader}
        activeOpacity={0.7}
        onPress={() => setIsBankExpanded(!isBankExpanded)}
      >
        <Text style={styles.accordionTitle}>Bank Details</Text>
        <Ionicons name={isBankExpanded ? "chevron-up" : "chevron-down"} size={20} color={BrandColors.TEXT_PRIMARY} />
      </TouchableOpacity>

      {isBankExpanded && (
        <View style={styles.accordionContent}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Account Holder Name *</Text>
            <TextInput
              style={[styles.input, errors.accountHolderName && styles.inputError]}
              placeholder="As per bank records"
              placeholderTextColor="#94A3B8"
              value={data.accountHolderName}
              onChangeText={(t) => onChange({ accountHolderName: t })}
              onBlur={() => onBlurField?.("accountHolderName")}
            />
            {errors.accountHolderName ? (
              <Text style={styles.errorText}>{errors.accountHolderName}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Bank Account Number *</Text>
            <TextInput
              style={[styles.input, errors.bankAccountNumber && styles.inputError]}
              placeholder="Enter account number"
              placeholderTextColor="#94A3B8"
              value={data.bankAccountNumber}
              onChangeText={handleBankAccChange}
              onBlur={() => onBlurField?.("bankAccountNumber")}
              keyboardType="numeric"
              maxLength={18}
            />
            {errors.bankAccountNumber ? (
              <Text style={styles.errorText}>{errors.bankAccountNumber}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm Account Number *</Text>
            <TextInput
              style={[styles.input, errors.confirmBankAccountNumber && styles.inputError]}
              placeholder="Re-enter account number"
              placeholderTextColor="#94A3B8"
              value={data.confirmBankAccountNumber}
              onChangeText={(t) => onChange({ confirmBankAccountNumber: t.replace(/\D/g, "") })}
              onBlur={() => onBlurField?.("confirmBankAccountNumber")}
              keyboardType="numeric"
              maxLength={18}
            />
            {errors.confirmBankAccountNumber ? (
              <Text style={styles.errorText}>{errors.confirmBankAccountNumber}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>IFSC Code *</Text>
            <TextInput
              style={[styles.input, errors.ifscCode && styles.inputError]}
              placeholder="e.g. HDFC0001234"
              placeholderTextColor="#94A3B8"
              value={data.ifscCode}
              onChangeText={handleIfscChange}
              onBlur={() => onBlurField?.("ifscCode")}
              autoCapitalize="characters"
              maxLength={11}
            />
            {errors.ifscCode ? (
              <Text style={styles.errorText}>{errors.ifscCode}</Text>
            ) : null}
          </View>

          {/* Bank Name & Branch */}
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Bank Name *</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowBankModal(true)}
                style={[styles.selectInput, errors.bankName && styles.inputError]}
              >
                <Text style={[styles.selectText, !data.bankName && styles.placeholderText, { flex: 1, paddingRight: 4 }]} numberOfLines={1}>
                  {data.bankName || "Select"}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#1E293B" />
              </TouchableOpacity>
              {errors.bankName ? <Text style={styles.errorText}>{errors.bankName}</Text> : null}
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Branch *</Text>
              <TextInput
                style={[styles.input, errors.branchName && styles.inputError]}
                placeholder="Branch Name"
                placeholderTextColor="#94A3B8"
                value={data.branchName}
                onChangeText={(t) => onChange({ branchName: t })}
                onBlur={() => onBlurField?.("branchName")}
              />
              {errors.branchName ? <Text style={styles.errorText}>{errors.branchName}</Text> : null}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Account Type *</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowAccountTypeModal(true)}
              style={[styles.selectInput, errors.accountType && styles.inputError]}
            >
              <Text style={[styles.selectText, !data.accountType && styles.placeholderText]}>
                {data.accountType || "Select account type"}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#1E293B" />
            </TouchableOpacity>
            {errors.accountType ? (
              <Text style={styles.errorText}>{errors.accountType}</Text>
            ) : null}
          </View>
        </View>
      )}

      {/* Authorised Signatory Section */}
      <TouchableOpacity
        style={styles.accordionHeader}
        activeOpacity={0.7}
        onPress={() => setIsSignatoryExpanded(!isSignatoryExpanded)}
      >
        <Text style={styles.accordionTitle}>Authorised Signatory</Text>
        <Ionicons name={isSignatoryExpanded ? "chevron-up" : "chevron-down"} size={20} color={BrandColors.TEXT_PRIMARY} />
      </TouchableOpacity>

      {isSignatoryExpanded && (
        <View style={styles.accordionContent}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Signatory Name *</Text>
            <TextInput
              style={[styles.input, errors.signatoryName && styles.inputError]}
              placeholder="Full name"
              placeholderTextColor="#94A3B8"
              value={data.signatoryName}
              onChangeText={(t) => onChange({ signatoryName: t })}
              onBlur={() => onBlurField?.("signatoryName")}
            />
            {errors.signatoryName ? (
              <Text style={styles.errorText}>{errors.signatoryName}</Text>
            ) : null}
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Signatory PAN *</Text>
              <TextInput
                style={[styles.input, errors.signatoryPan && styles.inputError]}
                placeholder="ABCDE1234F"
                placeholderTextColor="#94A3B8"
                value={data.signatoryPan}
                onChangeText={(t) => onChange({ signatoryPan: t.toUpperCase() })}
                onBlur={() => onBlurField?.("signatoryPan")}
                autoCapitalize="characters"
                maxLength={10}
              />
              {errors.signatoryPan ? <Text style={styles.errorText}>{errors.signatoryPan}</Text> : null}
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Date of Birth *</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => openCalendarModal("signatoryDob")}
                style={[styles.dateInput, errors.signatoryDob && styles.inputError, { height: 50, paddingHorizontal: 10 }]}
              >
                <Text style={[styles.selectText, !data.signatoryDob && styles.placeholderText, { flex: 1, fontSize: 13 }]} numberOfLines={1}>
                  {data.signatoryDob || "mm/dd/yyyy"}
                </Text>
                <Ionicons name="calendar-outline" size={18} color={errors.signatoryDob ? "#DC2626" : BrandColors.PRIMARY_ORANGE} />
              </TouchableOpacity>
              {errors.signatoryDob ? <Text style={styles.errorText}>{errors.signatoryDob}</Text> : null}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Designation *</Text>
            <TextInput
              style={[styles.input, errors.signatoryDesignation && styles.inputError]}
              placeholder="Proprietor / Director / Partner"
              placeholderTextColor="#94A3B8"
              value={data.signatoryDesignation}
              onChangeText={(t) => onChange({ signatoryDesignation: t })}
              onBlur={() => onBlurField?.("signatoryDesignation")}
            />
            {errors.signatoryDesignation ? (
              <Text style={styles.errorText}>{errors.signatoryDesignation}</Text>
            ) : null}
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Signatory Mobile *</Text>
              <TextInput
                style={[styles.input, errors.signatoryMobile && styles.inputError]}
                placeholder="10-digit"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                maxLength={10}
                value={data.signatoryMobile}
                onChangeText={(t) => onChange({ signatoryMobile: t.replace(/\D/g, "") })}
                onBlur={() => onBlurField?.("signatoryMobile")}
              />
              {errors.signatoryMobile ? <Text style={styles.errorText}>{errors.signatoryMobile}</Text> : null}
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Signatory Email *</Text>
              <TextInput
                style={[styles.input, errors.signatoryEmail && styles.inputError]}
                placeholder="email@business.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={data.signatoryEmail}
                onChangeText={(t) => onChange({ signatoryEmail: t })}
                onBlur={() => onBlurField?.("signatoryEmail")}
              />
              {errors.signatoryEmail ? <Text style={styles.errorText}>{errors.signatoryEmail}</Text> : null}
            </View>
          </View>
        </View>
      )}

      {/* Consent Checkbox */}
      <View style={styles.consentRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onChange({ aadhaarConsent: !data.aadhaarConsent })}
          style={styles.checkboxTouch}
        >
          <Ionicons
            name={data.aadhaarConsent ? "checkbox" : "square-outline"}
            size={24}
            color={data.aadhaarConsent ? BrandColors.PRIMARY_ORANGE : "#94A3B8"}
          />
        </TouchableOpacity>
        <Text style={styles.consentText}>
          I consent to Aadhaar authentication (e-KYC) for this GST registration.
        </Text>
      </View>
      {errors.aadhaarConsent ? (
        <Text style={[styles.errorText, { marginBottom: 14 }]}>{errors.aadhaarConsent}</Text>
      ) : null}

      {/* Place of Business Modal */}
      <Modal visible={showPlaceModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPlaceModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Place Type</Text>
            <FlatList
              data={PLACE_OF_BUSINESS_OPTIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalOption, data.placeOfBusiness === item && styles.modalOptionSelected]}
                  onPress={() => {
                    onChange({ placeOfBusiness: item });
                    setShowPlaceModal(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, data.placeOfBusiness === item && styles.modalOptionTextSelected]}>
                    {item}
                  </Text>
                  {data.placeOfBusiness === item && <Ionicons name="checkmark" size={18} color={BrandColors.PRIMARY_BLUE} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* State Modal */}
      <Modal visible={showStateModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStateModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select State</Text>
            <FlatList
              data={STATE_OPTIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalOption, data.state === item && styles.modalOptionSelected]}
                  onPress={() => {
                    onChange({ state: item });
                    setShowStateModal(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, data.state === item && styles.modalOptionTextSelected]}>
                    {item}
                  </Text>
                  {data.state === item && <Ionicons name="checkmark" size={18} color={BrandColors.PRIMARY_BLUE} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Bank Modal */}
      <Modal visible={showBankModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowBankModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Bank Name</Text>
            <FlatList
              data={BANK_OPTIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalOption, data.bankName === item && styles.modalOptionSelected]}
                  onPress={() => {
                    onChange({ bankName: item });
                    setShowBankModal(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, data.bankName === item && styles.modalOptionTextSelected]}>
                    {item}
                  </Text>
                  {data.bankName === item && <Ionicons name="checkmark" size={18} color={BrandColors.PRIMARY_BLUE} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Account Type Modal */}
      <Modal visible={showAccountTypeModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAccountTypeModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Account Type</Text>
            <FlatList
              data={ACCOUNT_TYPE_OPTIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalOption, data.accountType === item && styles.modalOptionSelected]}
                  onPress={() => {
                    onChange({ accountType: item });
                    setShowAccountTypeModal(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, data.accountType === item && styles.modalOptionTextSelected]}>
                    {item}
                  </Text>
                  {data.accountType === item && <Ionicons name="checkmark" size={18} color={BrandColors.PRIMARY_BLUE} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Business Type Modal */}
      <Modal visible={showTypeModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTypeModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Constitution of Business</Text>
            <FlatList
              data={BUSINESS_TYPES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    data.businessType === item && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    onChange({ businessType: item });
                    setShowTypeModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      data.businessType === item && styles.modalOptionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {data.businessType === item && (
                    <Ionicons name="checkmark" size={18} color={BrandColors.PRIMARY_BLUE} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Reason Modal */}
      <Modal visible={showReasonModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowReasonModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a reason</Text>
            <FlatList
              data={REASONS_FOR_REGISTRATION}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    data.reasonForRegistration === item && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    onChange({ reasonForRegistration: item });
                    setShowReasonModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      data.reasonForRegistration === item && styles.modalOptionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {data.reasonForRegistration === item && (
                    <Ionicons name="checkmark" size={18} color={BrandColors.PRIMARY_BLUE} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Composition Modal */}
      <Modal visible={showCompositionModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCompositionModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select yes or no</Text>
            <FlatList
              data={COMPOSITION_SCHEME_OPTIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    data.compositionScheme === item && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    onChange({ compositionScheme: item });
                    setShowCompositionModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      data.compositionScheme === item && styles.modalOptionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {data.compositionScheme === item && (
                    <Ionicons name="checkmark" size={18} color={BrandColors.PRIMARY_BLUE} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Nature Modal */}
      <Modal visible={showNatureModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowNatureModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Nature of Business</Text>
            <FlatList
              data={NATURE_OF_BUSINESS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    data.natureOfBusiness === item && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    onChange({ natureOfBusiness: item });
                    setShowNatureModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      data.natureOfBusiness === item && styles.modalOptionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {data.natureOfBusiness === item && (
                    <Ionicons name="checkmark" size={18} color={BrandColors.PRIMARY_BLUE} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Calendar Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.calendarModalContent, { backgroundColor: "#FFFFFF" }]}>
            <View style={styles.calendarHeader}>
              <Text style={[styles.calendarTitle, { color: "#083B75" }]}>
                Select Start Date
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.monthYearNav}>
              <TouchableOpacity
                onPress={() => {
                  if (pickerMonth === 0) {
                    setPickerMonth(11);
                    setPickerYear((y) => y - 1);
                  } else {
                    setPickerMonth((m) => m - 1);
                  }
                }}
                style={styles.navArrow}
              >
                <Ionicons name="chevron-back" size={18} color="#083B75" />
              </TouchableOpacity>
              <View style={styles.monthYearDisplay}>
                <Text style={[styles.monthYearText, { color: "#083B75" }]}>
                  {months[pickerMonth]} {pickerYear}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (pickerMonth === 11) {
                    setPickerMonth(0);
                    setPickerYear((y) => y + 1);
                  } else {
                    setPickerMonth((m) => m + 1);
                  }
                }}
                style={styles.navArrow}
              >
                <Ionicons name="chevron-forward" size={18} color="#083B75" />
              </TouchableOpacity>
            </View>

            <View style={styles.yearQuickRow}>
              {[-10, -5, +5, +10].map((offset) => (
                <TouchableOpacity
                  key={offset}
                  onPress={() => setPickerYear((y) => y + offset)}
                  style={styles.yearChip}
                >
                  <Text style={styles.yearChipText}>
                    {offset > 0 ? `+${offset}` : offset} Yrs
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.weekdaysRow}>
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <Text key={d} style={styles.weekdayText}>{d}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {Array.from({ length: new Date(pickerYear, pickerMonth, 1).getDay() }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.dayCellEmpty} />
              ))}
              {Array.from({ length: new Date(pickerYear, pickerMonth + 1, 0).getDate() }).map((_, i) => {
                const dayNum = i + 1;
                const isSelected = pickerDay === dayNum;
                return (
                  <TouchableOpacity
                    key={`day-${dayNum}`}
                    onPress={() => setPickerDay(dayNum)}
                    style={[styles.dayCell, isSelected && { backgroundColor: "#083B75" }]}
                  >
                    <Text style={[styles.dayCellText, { color: isSelected ? "#FFFFFF" : "#1E293B" }]}>
                      {dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={[styles.modalCancelBtn, { borderColor: "#BFDBFE" }]}
              >
                <Text style={[styles.modalCancelText, { color: "#1E293B" }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmCalendarDate}
                style={[styles.modalConfirmBtn, { backgroundColor: "#F97316" }]}
              >
                <Text style={styles.modalConfirmText}>Apply Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

