import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "../screens/GstAmendmentScreen/GstAmendmentScreen.styles";
import {
  AmendmentSectionConfig,
  AmendmentFormData,
  RegisteredDetails,
  SupportingDoc,
} from "../types/gstAmendmentTypes";
import { BANK_ACCOUNT_TYPES, NON_CORE_ACCEPTED_PROOFS } from "../config/gstNonCoreAmendmentConfig";
import { InputField, DropdownField, DateField, PhoneField } from "./GstAmendmentFields";
import { GstAmendmentProofs } from "./GstAmendmentProofs";

interface GstNonCoreAmendmentEditProps {
  selectedSection: AmendmentSectionConfig;
  registeredDetails: RegisteredDetails;
  formData: AmendmentFormData;
  errors: Record<string, string>;
  supportingDoc: SupportingDoc | null;
  isProofsExpanded: boolean;
  insets: { top: number; bottom: number };
  scrollViewRef: React.RefObject<ScrollView | null>;
  onBack: () => void;
  onUpdateField: (field: keyof AmendmentFormData, value: string) => void;
  onClearError: (key: string) => void;
  onOpenPicker: (title: string, options: string[], selectedVal: string, onSelect: (val: string) => void) => void;
  onBrowseFiles: () => void;
  onScanFile: () => void;
  onDeleteDoc: () => void;
  onToggleExpandProofs: () => void;
  onReviewChanges: () => void;
}

export const GstNonCoreAmendmentEdit: React.FC<GstNonCoreAmendmentEditProps> = ({
  selectedSection,
  registeredDetails,
  formData,
  errors,
  supportingDoc,
  isProofsExpanded,
  insets,
  scrollViewRef,
  onBack,
  onUpdateField,
  onClearError,
  onOpenPicker,
  onBrowseFiles,
  onScanFile,
  onDeleteDoc,
  onToggleExpandProofs,
  onReviewChanges,
}) => {
  const sectionId = selectedSection.id;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.roundBackButton}
        >
          <Ionicons name="chevron-back" size={22} color={BrandColors.PRIMARY_BLUE} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerMainTitle}>{selectedSection.title}</Text>
          <Text style={styles.headerSubtitle}>Current details are read-only</Text>
        </View>
        <View style={styles.placeholderBox} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.editContainer}>
          {/* CURRENTLY REGISTERED CARD (READ-ONLY) */}
          <View style={styles.currentRegisteredCard}>
            <View>
              <Text style={styles.currentRegisteredHeader}>Currently registered (read-only)</Text>
            </View>

            {sectionId === "bank-accounts" && (
              <>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>Bank Name</Text>
                  <Text style={styles.currentFieldValue}>{registeredDetails.bankName}</Text>
                </View>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>Account Number</Text>
                  <Text style={styles.currentFieldValue}>{registeredDetails.bankAccountNumber}</Text>
                </View>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>IFSC Code</Text>
                  <Text style={styles.currentFieldValue}>{registeredDetails.ifscCode}</Text>
                </View>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>Account Type</Text>
                  <Text style={styles.currentFieldValue}>{registeredDetails.accountType}</Text>
                </View>
              </>
            )}

            {sectionId === "authorised-signatories" && (
              <>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>Name</Text>
                  <Text style={styles.currentFieldValue}>{registeredDetails.signatoryName}</Text>
                </View>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>PAN</Text>
                  <Text style={styles.currentFieldValue}>{registeredDetails.signatoryPan}</Text>
                </View>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>Designation</Text>
                  <Text style={styles.currentFieldValue}>{registeredDetails.signatoryDesignation}</Text>
                </View>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>Mobile</Text>
                  <Text style={styles.currentFieldValue}>{registeredDetails.signatoryMobile}</Text>
                </View>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>Email</Text>
                  <Text style={styles.currentFieldValue}>{registeredDetails.signatoryEmail}</Text>
                </View>
              </>
            )}

            {sectionId === "contact-details" && (
              <>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>Mobile</Text>
                  <Text style={styles.currentFieldValue}>{registeredDetails.contactMobile}</Text>
                </View>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>Email</Text>
                  <Text style={styles.currentFieldValue}>{registeredDetails.contactEmail}</Text>
                </View>
              </>
            )}
          </View>

          {/* NEW DETAILS */}
          <Text style={styles.formSectionTitle}>New details</Text>

          {sectionId === "bank-accounts" && (
            <>
              <InputField
                label="New Bank Name"
                value={formData.newBankName}
                placeholder="ICICI Bank"
                error={errors.newBankName}
                onChangeText={(t) => {
                  onUpdateField("newBankName", t);
                  onClearError("newBankName");
                }}
              />
              <InputField
                label="New Account Number"
                value={formData.newBankAccountNumber}
                placeholder="Enter account number"
                error={errors.newBankAccountNumber}
                keyboardType="numeric"
                maxLength={18}
                onChangeText={(t) => {
                  onUpdateField("newBankAccountNumber", t.replace(/\D/g, ""));
                  onClearError("newBankAccountNumber");
                }}
              />
              <InputField
                label="Confirm Account Number"
                value={formData.confirmBankAccountNumber}
                placeholder="Re-enter account number"
                error={errors.confirmBankAccountNumber}
                keyboardType="numeric"
                maxLength={18}
                onChangeText={(t) => {
                  onUpdateField("confirmBankAccountNumber", t.replace(/\D/g, ""));
                  onClearError("confirmBankAccountNumber");
                }}
              />
              <InputField
                label="New IFSC Code"
                value={formData.newIfscCode}
                placeholder="ICIC0005678"
                error={errors.newIfscCode}
                autoCapitalize="characters"
                maxLength={11}
                onChangeText={(t) => {
                  onUpdateField("newIfscCode", t.replace(/[^a-zA-Z0-9]/g, "").toUpperCase());
                  onClearError("newIfscCode");
                }}
              />
              <DropdownField
                label="Account Type"
                value={formData.newAccountType}
                error={errors.newAccountType}
                onPress={() =>
                  onOpenPicker("Select Account Type", BANK_ACCOUNT_TYPES, formData.newAccountType, (val) => {
                    onUpdateField("newAccountType", val);
                    onClearError("newAccountType");
                  })
                }
              />
            </>
          )}

          {sectionId === "authorised-signatories" && (
            <>
              <InputField
                label="New Signatory Name"
                value={formData.newSignatoryName}
                placeholder="Full name"
                error={errors.newSignatoryName}
                onChangeText={(t) => {
                  onUpdateField("newSignatoryName", t);
                  onClearError("newSignatoryName");
                }}
              />
              <InputField
                label="Signatory PAN"
                value={formData.newSignatoryPan}
                placeholder="ABCDE1234F"
                error={errors.newSignatoryPan}
                autoCapitalize="characters"
                maxLength={10}
                onChangeText={(t) => {
                  onUpdateField("newSignatoryPan", t.replace(/[^a-zA-Z0-9]/g, "").toUpperCase());
                  onClearError("newSignatoryPan");
                }}
              />
              <DateField
                label="Date of Birth"
                value={formData.newSignatoryDob}
                placeholder="dd-mm-yyyy"
                error={errors.newSignatoryDob}
                onChangeText={(t) => {
                  onUpdateField("newSignatoryDob", t);
                  onClearError("newSignatoryDob");
                }}
              />
              <InputField
                label="Designation"
                value={formData.newSignatoryDesignation}
                placeholder="KENFCNKFJC"
                error={errors.newSignatoryDesignation}
                onChangeText={(t) => {
                  onUpdateField("newSignatoryDesignation", t);
                  onClearError("newSignatoryDesignation");
                }}
              />
              <InputField
                label="Signatory Mobile"
                value={formData.newSignatoryMobile}
                placeholder="8749594844"
                error={errors.newSignatoryMobile}
                keyboardType="phone-pad"
                maxLength={10}
                onChangeText={(t) => {
                  onUpdateField("newSignatoryMobile", t.replace(/\D/g, ""));
                  onClearError("newSignatoryMobile");
                }}
              />
              <InputField
                label="Signatory Email"
                value={formData.newSignatoryEmail}
                placeholder="name@business.com"
                error={errors.newSignatoryEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={(t) => {
                  onUpdateField("newSignatoryEmail", t.trim());
                  onClearError("newSignatoryEmail");
                }}
              />
            </>
          )}

          {sectionId === "contact-details" && (
            <>
              <PhoneField
                label="New Mobile Number"
                value={formData.newContactMobile}
                placeholder="XXXXX XXXXX"
                error={errors.newContactMobile}
                onChangeText={(t) => {
                  onUpdateField("newContactMobile", t.replace(/\D/g, ""));
                  onClearError("newContactMobile");
                }}
              />
              <InputField
                label="New Email Address"
                value={formData.newContactEmail}
                placeholder="name@business.com"
                error={errors.newContactEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={(t) => {
                  onUpdateField("newContactEmail", t.trim());
                  onClearError("newContactEmail");
                }}
              />
            </>
          )}

          {/* SUPPORTING PROOF */}
          <GstAmendmentProofs
            supportingDoc={supportingDoc}
            onBrowseFiles={onBrowseFiles}
            onScanFile={onScanFile}
            onDeleteDoc={onDeleteDoc}
            error={errors.supportingDoc}
            acceptedProofs={NON_CORE_ACCEPTED_PROOFS[sectionId]}
            isProofsExpanded={isProofsExpanded}
            onToggleExpandProofs={onToggleExpandProofs}
          />
        </View>
      </ScrollView>

      {/* FIXED BOTTOM ACTION AREA */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={onReviewChanges}
        >
          <Text style={styles.primaryBtnText}>Review Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
