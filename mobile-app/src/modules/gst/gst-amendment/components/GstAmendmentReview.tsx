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
  SupportingDoc,
} from "../types/gstAmendmentTypes";

interface GstAmendmentReviewProps {
  gstin: string;
  selectedSection: AmendmentSectionConfig;
  formData: AmendmentFormData;
  supportingDoc: SupportingDoc | null;
  declared: boolean;
  onToggleDeclared: () => void;
  isSubmitting: boolean;
  insets: { top: number; bottom: number };
  scrollViewRef: React.RefObject<ScrollView | null>;
  onEdit: () => void;
  onSubmit: () => void;
}

export const GstAmendmentReview: React.FC<GstAmendmentReviewProps> = ({
  gstin,
  selectedSection,
  formData,
  supportingDoc,
  declared,
  onToggleDeclared,
  isSubmitting,
  insets,
  scrollViewRef,
  onEdit,
  onSubmit,
}) => {
  const sectionId = selectedSection.id;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onEdit}
          style={styles.roundBackButton}
        >
          <Ionicons name="chevron-back" size={22} color={BrandColors.PRIMARY_BLUE} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerMainTitle}>Review Amendment</Text>
          <Text style={styles.headerSubtitle}>Review requested details</Text>
        </View>
        <View style={styles.placeholderBox} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Metadata Card */}
        <View style={styles.reviewMetaCard}>
          <View style={styles.reviewMetaRow}>
            <Text style={styles.reviewMetaKey}>GSTIN</Text>
            <Text style={styles.reviewMetaVal}>{gstin || "-"}</Text>
          </View>
          <View style={styles.reviewMetaDivider} />

          <View style={styles.reviewMetaRow}>
            <Text style={styles.reviewMetaKey}>Section</Text>
            <Text style={styles.reviewMetaVal}>{selectedSection.title}</Text>
          </View>
          <View style={styles.reviewMetaDivider} />

          <View style={styles.reviewMetaRow}>
            <Text style={styles.reviewMetaKey}>Type</Text>
            <Text
              style={[
                styles.reviewMetaVal,
                { color: selectedSection.type === "core" ? "#EA580C" : "#083B75" },
              ]}
            >
              {selectedSection.type === "core"
                ? "Core (officer approval)"
                : "Non-core (auto-approved)"}
            </Text>
          </View>
        </View>

        {/* Requested Details Card with Edit Option */}
        <View style={styles.requestedDetailsCard}>
          <View style={styles.requestedCardHeaderRow}>
            <Text style={styles.requestedCardTitle}>REQUESTED DETAILS</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onEdit}
              style={styles.editOptionBtn}
            >
              <Ionicons name="create-outline" size={15} color={BrandColors.PRIMARY_ORANGE} />
              <Text style={styles.editOptionText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.reviewMetaDivider} />

          {sectionId === "legal-name" && (
            <View style={styles.reviewFieldRow}>
              <Text style={styles.reviewFieldLabel}>Legal Business Name</Text>
              <Text style={styles.reviewFieldValue}>{formData.newLegalBusinessName || "-"}</Text>
            </View>
          )}

          {sectionId === "principal-place" && (
            <View style={styles.gap8}>
              <View style={styles.reviewFieldRow}>
                <Text style={styles.reviewFieldLabel}>Business Address</Text>
                <Text style={styles.reviewFieldValue}>{formData.newPrincipalAddress || "-"}</Text>
              </View>
              <View style={styles.reviewFieldRow}>
                <Text style={styles.reviewFieldLabel}>City</Text>
                <Text style={styles.reviewFieldValue}>{formData.newPrincipalCity || "-"}</Text>
              </View>
              <View style={styles.reviewFieldRow}>
                <Text style={styles.reviewFieldLabel}>District</Text>
                <Text style={styles.reviewFieldValue}>{formData.newPrincipalDistrict || "-"}</Text>
              </View>
              <View style={styles.reviewFieldRow}>
                <Text style={styles.reviewFieldLabel}>State / UT</Text>
                <Text style={styles.reviewFieldValue}>{formData.newPrincipalState || "-"}</Text>
              </View>
              <View style={styles.reviewFieldRow}>
                <Text style={styles.reviewFieldLabel}>PIN Code</Text>
                <Text style={styles.reviewFieldValue}>{formData.newPrincipalPincode || "-"}</Text>
              </View>
              <View style={styles.reviewFieldRow}>
                <Text style={styles.reviewFieldLabel}>Nature of Premises</Text>
                <Text style={styles.reviewFieldValue}>{formData.newPrincipalNatureOfPremises || "-"}</Text>
              </View>
            </View>
          )}

          {sectionId === "additional-place" && (
            <View style={styles.gap8}>
              <View style={styles.reviewFieldRow}>
                <Text style={styles.reviewFieldLabel}>Additional Place Address</Text>
                <Text style={styles.reviewFieldValue}>{formData.newAdditionalAddress || "-"}</Text>
              </View>
              <View style={styles.reviewFieldRow}>
                <Text style={styles.reviewFieldLabel}>City</Text>
                <Text style={styles.reviewFieldValue}>{formData.newAdditionalCity || "-"}</Text>
              </View>
              <View style={styles.reviewFieldRow}>
                <Text style={styles.reviewFieldLabel}>PIN Code</Text>
                <Text style={styles.reviewFieldValue}>{formData.newAdditionalPincode || "-"}</Text>
              </View>
              <View style={styles.reviewFieldRow}>
                <Text style={styles.reviewFieldLabel}>Nature of Premises</Text>
                <Text style={styles.reviewFieldValue}>{formData.newAdditionalNatureOfPremises || "-"}</Text>
              </View>
            </View>
          )}

          {sectionId === "bank-accounts" && (
            <View style={styles.gap8}>
              <View style={styles.reviewFieldRow}>
                <Text style={styles.reviewFieldLabel}>Bank Name</Text>
                <Text style={styles.reviewFieldValue}>{formData.newBankName || "-"}</Text>
              </View>
              <View style={styles.reviewFieldRow}>
                <Text style={styles.reviewFieldLabel}>Account Number</Text>
                <Text style={styles.reviewFieldValue}>{formData.newBankAccountNumber || "-"}</Text>
              </View>
              <View style={styles.reviewFieldRow}>
                <Text style={styles.reviewFieldLabel}>IFSC Code</Text>
                <Text style={styles.reviewFieldValue}>{formData.newIfscCode || "-"}</Text>
              </View>
              <View style={styles.reviewFieldRow}>
                <Text style={styles.reviewFieldLabel}>Account Type</Text>
                <Text style={styles.reviewFieldValue}>{formData.newAccountType || "-"}</Text>
              </View>
            </View>
          )}

          {sectionId === "authorised-signatories" && (
            <View style={styles.gap8}>
              <View style={styles.reviewFieldRow}>
                <Text style={styles.reviewFieldLabel}>Signatory Name</Text>
                <Text style={styles.reviewFieldValue}>{formData.newSignatoryName || "-"}</Text>
              </View>
              <View style={styles.reviewFieldRow}>
                <Text style={styles.reviewFieldLabel}>Signatory PAN</Text>
                <Text style={styles.reviewFieldValue}>{formData.newSignatoryPan || "-"}</Text>
              </View>
              {formData.newSignatoryDob ? (
                <View style={styles.reviewFieldRow}>
                  <Text style={styles.reviewFieldLabel}>Date of Birth</Text>
                  <Text style={styles.reviewFieldValue}>{formData.newSignatoryDob}</Text>
                </View>
              ) : null}
              {formData.newSignatoryDesignation ? (
                <View style={styles.reviewFieldRow}>
                  <Text style={styles.reviewFieldLabel}>Designation</Text>
                  <Text style={styles.reviewFieldValue}>{formData.newSignatoryDesignation}</Text>
                </View>
              ) : null}
              {formData.newSignatoryMobile ? (
                <View style={styles.reviewFieldRow}>
                  <Text style={styles.reviewFieldLabel}>Signatory Mobile</Text>
                  <Text style={styles.reviewFieldValue}>{formData.newSignatoryMobile}</Text>
                </View>
              ) : null}
              {formData.newSignatoryEmail ? (
                <View style={styles.reviewFieldRow}>
                  <Text style={styles.reviewFieldLabel}>Signatory Email</Text>
                  <Text style={styles.reviewFieldValue}>{formData.newSignatoryEmail}</Text>
                </View>
              ) : null}
            </View>
          )}

          {sectionId === "contact-details" && (
            <View style={styles.gap8}>
              <View style={styles.reviewFieldRow}>
                <Text style={styles.reviewFieldLabel}>Mobile Number</Text>
                <Text style={styles.reviewFieldValue}>{formData.newContactMobile || "-"}</Text>
              </View>
              <View style={styles.reviewFieldRow}>
                <Text style={styles.reviewFieldLabel}>Email Address</Text>
                <Text style={styles.reviewFieldValue}>{formData.newContactEmail || "-"}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Supporting Documents Card */}
        <View style={styles.reviewDocsCard}>
          <Text style={styles.reviewDocsTitle}>Supporting documents</Text>
          {supportingDoc ? (
            <View style={styles.reviewDocRow}>
              <Text style={styles.reviewDocName} numberOfLines={1}>
                {supportingDoc.name}
              </Text>
              <Text style={styles.reviewDocSize}>{supportingDoc.size}</Text>
            </View>
          ) : (
            <Text style={styles.noDocText}>No document attached</Text>
          )}
        </View>

        {/* Declaration Checkbox */}
        <TouchableOpacity
          style={styles.declarationBox}
          activeOpacity={0.85}
          onPress={onToggleDeclared}
        >
          <View style={[styles.checkbox, declared && styles.checkboxActive]}>
            {declared && <Ionicons name="checkmark" size={15} color="#FFFFFF" />}
          </View>
          <Text style={styles.declarationText}>
            I declare that the amendment details above are true and correct, and I authorise TaxEdge Fin Solutions to file this amendment on my behalf.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* FIXED BOTTOM ACTION AREA */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={[styles.primaryBtn, (!declared || isSubmitting) && { opacity: 0.65 }]}
          activeOpacity={0.85}
          onPress={onSubmit}
          disabled={isSubmitting || !declared}
        >
          <Text style={styles.primaryBtnText}>
            {isSubmitting ? "Submitting..." : "Submit Amendment Request"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
