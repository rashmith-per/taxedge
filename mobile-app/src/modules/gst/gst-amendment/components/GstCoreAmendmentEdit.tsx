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
import { INDIAN_STATES_AND_UTS, NATURE_OF_PREMISES_OPTIONS, CORE_ACCEPTED_PROOFS } from "../config/gstCoreAmendmentConfig";
import { InputField, DropdownField } from "./GstAmendmentFields";
import { GstAmendmentProofs } from "./GstAmendmentProofs";

interface GstCoreAmendmentEditProps {
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

export const GstCoreAmendmentEdit: React.FC<GstCoreAmendmentEditProps> = ({
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

            {sectionId === "legal-name" && (
              <View style={styles.currentFieldRow}>
                <Text style={styles.currentFieldLabel}>Legal Business Name</Text>
                <Text style={styles.currentFieldValue}>{registeredDetails.legalBusinessName}</Text>
              </View>
            )}

            {sectionId === "principal-place" && (
              <>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>Address</Text>
                  <Text style={styles.currentFieldValue}>{registeredDetails.principalAddress}</Text>
                </View>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>City</Text>
                  <Text style={styles.currentFieldValue}>{registeredDetails.principalCity}</Text>
                </View>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>District</Text>
                  <Text style={styles.currentFieldValue}>{registeredDetails.principalDistrict}</Text>
                </View>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>State</Text>
                  <Text style={styles.currentFieldValue}>{registeredDetails.principalState}</Text>
                </View>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>PIN Code</Text>
                  <Text style={styles.currentFieldValue}>{registeredDetails.principalPincode}</Text>
                </View>
              </>
            )}

            {sectionId === "additional-place" && (
              <>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>Address</Text>
                  <Text style={styles.currentFieldValue}>{registeredDetails.additionalAddress}</Text>
                </View>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>City</Text>
                  <Text style={styles.currentFieldValue}>{registeredDetails.additionalCity}</Text>
                </View>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>PIN Code</Text>
                  <Text style={styles.currentFieldValue}>{registeredDetails.additionalPincode}</Text>
                </View>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>Nature of Premises</Text>
                  <Text style={styles.currentFieldValue}>{registeredDetails.additionalNatureOfPremises}</Text>
                </View>
              </>
            )}
          </View>

          {/* NEW DETAILS */}
          <Text style={styles.formSectionTitle}>New details</Text>

          {sectionId === "legal-name" && (
            <InputField
              label="New Legal Business Name"
              value={formData.newLegalBusinessName}
              placeholder="As per PAN"
              error={errors.newLegalBusinessName}
              onChangeText={(t) => {
                onUpdateField("newLegalBusinessName", t);
                onClearError("newLegalBusinessName");
              }}
            />
          )}

          {sectionId === "principal-place" && (
            <>
              <InputField
                label="New Business Address"
                value={formData.newPrincipalAddress}
                placeholder="Building, street, locality"
                error={errors.newPrincipalAddress}
                onChangeText={(t) => {
                  onUpdateField("newPrincipalAddress", t);
                  onClearError("newPrincipalAddress");
                }}
              />
              <InputField
                label="City"
                value={formData.newPrincipalCity}
                placeholder="City"
                error={errors.newPrincipalCity}
                onChangeText={(t) => {
                  onUpdateField("newPrincipalCity", t);
                  onClearError("newPrincipalCity");
                }}
              />
              <InputField
                label="District"
                value={formData.newPrincipalDistrict}
                placeholder="District"
                error={errors.newPrincipalDistrict}
                onChangeText={(t) => {
                  onUpdateField("newPrincipalDistrict", t);
                  onClearError("newPrincipalDistrict");
                }}
              />
              <DropdownField
                label="State / UT"
                value={formData.newPrincipalState}
                error={errors.newPrincipalState}
                onPress={() =>
                  onOpenPicker("Select State / UT", INDIAN_STATES_AND_UTS, formData.newPrincipalState, (val) => {
                    onUpdateField("newPrincipalState", val);
                    onClearError("newPrincipalState");
                  })
                }
              />
              <InputField
                label="PIN Code"
                value={formData.newPrincipalPincode}
                placeholder="560001"
                error={errors.newPrincipalPincode}
                keyboardType="numeric"
                maxLength={6}
                counterText={`${formData.newPrincipalPincode.length} / 6 digits`}
                onChangeText={(t) => {
                  const num = t.replace(/\D/g, "").slice(0, 6);
                  onUpdateField("newPrincipalPincode", num);
                  onClearError("newPrincipalPincode");
                }}
              />
              <DropdownField
                label="Nature of Premises"
                value={formData.newPrincipalNatureOfPremises}
                error={errors.newPrincipalNatureOfPremises}
                onPress={() =>
                  onOpenPicker(
                    "Select Nature of Premises",
                    NATURE_OF_PREMISES_OPTIONS,
                    formData.newPrincipalNatureOfPremises,
                    (val) => {
                      onUpdateField("newPrincipalNatureOfPremises", val);
                      onClearError("newPrincipalNatureOfPremises");
                    }
                  )
                }
              />
            </>
          )}

          {sectionId === "additional-place" && (
            <>
              <InputField
                label="New Additional Place Address"
                value={formData.newAdditionalAddress}
                placeholder="Building, street, locality"
                error={errors.newAdditionalAddress}
                onChangeText={(t) => {
                  onUpdateField("newAdditionalAddress", t);
                  onClearError("newAdditionalAddress");
                }}
              />
              <InputField
                label="City"
                value={formData.newAdditionalCity}
                placeholder="City"
                error={errors.newAdditionalCity}
                onChangeText={(t) => {
                  onUpdateField("newAdditionalCity", t);
                  onClearError("newAdditionalCity");
                }}
              />
              <InputField
                label="PIN Code"
                value={formData.newAdditionalPincode}
                placeholder="560001"
                error={errors.newAdditionalPincode}
                keyboardType="numeric"
                maxLength={6}
                counterText={`${formData.newAdditionalPincode.length} / 6 digits`}
                onChangeText={(t) => {
                  const num = t.replace(/\D/g, "").slice(0, 6);
                  onUpdateField("newAdditionalPincode", num);
                  onClearError("newAdditionalPincode");
                }}
              />
              <DropdownField
                label="Nature of Premises"
                value={formData.newAdditionalNatureOfPremises}
                error={errors.newAdditionalNatureOfPremises}
                onPress={() =>
                  onOpenPicker(
                    "Select Nature of Premises",
                    NATURE_OF_PREMISES_OPTIONS,
                    formData.newAdditionalNatureOfPremises,
                    (val) => {
                      onUpdateField("newAdditionalNatureOfPremises", val);
                      onClearError("newAdditionalNatureOfPremises");
                    }
                  )
                }
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
            acceptedProofs={CORE_ACCEPTED_PROOFS[sectionId]}
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
