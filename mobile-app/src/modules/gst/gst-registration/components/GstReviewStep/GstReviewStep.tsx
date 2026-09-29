/**
 * Component: GstReviewStep
 * Migrated from internal StyleSheet to external styles module.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { GstBusinessFormData } from "../GstBusinessStep/GstBusinessStep";
import { DocumentItem } from "../GstUnifiedDocumentStep/GstUnifiedDocumentStep";
import {
  styles,
  getDocProgressFillStyle,
} from "./GstReviewStep.styles";

interface GstReviewStepProps {
  businessData: GstBusinessFormData;
  documents: DocumentItem[];
  onEditStep: (stepIndex: number) => void;
  declared: boolean;
  onToggleDeclaration: () => void;
}

export const GstReviewStep: React.FC<GstReviewStepProps> = ({
  businessData,
  documents,
  onEditStep,
  declared,
  onToggleDeclaration,
}) => {
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const uploadedDocs = documents.filter((d) => Boolean(d.fileUri));
  const uploadedCount = uploadedDocs.length;
  const totalCount = documents.length;
  const progressPercent = totalCount > 0 ? (uploadedCount / totalCount) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* 1. Business Details Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Business Details</Text>
          <TouchableOpacity onPress={() => onEditStep(0)} activeOpacity={0.7}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        
        <View style={styles.row}>
          <Text style={styles.label}>Legal Name</Text>
          <Text style={styles.value}>{businessData.legalName || "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Trade Name</Text>
          <Text style={styles.value}>{businessData.businessName || "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Constitution</Text>
          <Text style={styles.value}>{businessData.businessType || "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Nature of Business</Text>
          <Text style={styles.value}>{businessData.natureOfBusiness || "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date of Commencement</Text>
          <Text style={styles.value}>{businessData.businessStartDate || "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Reason for Reg.</Text>
          <Text style={styles.value}>{businessData.reasonForRegistration || "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Composition Scheme</Text>
          <Text style={styles.value}>{businessData.compositionScheme || "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Place of Business</Text>
          <Text style={styles.value}>{businessData.placeOfBusiness || "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Address</Text>
          <Text style={[styles.value, styles.valueMultiline]} numberOfLines={2}>
            {businessData.businessAddress || "-"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Location</Text>
          <Text style={[styles.value, styles.valueMultiline]}>
            {businessData.city ? `${businessData.city}, ` : ""}{businessData.district ? `${businessData.district}, ` : ""}{businessData.state || ""} - {businessData.pinCode || ""}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>HSN / SAC Code</Text>
          <Text style={styles.value}>{businessData.hsnCode || "-"}</Text>
        </View>
      </View>

      {/* 2. Bank Details Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Bank Details</Text>
          <TouchableOpacity onPress={() => onEditStep(0)} activeOpacity={0.7}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        
        <View style={styles.row}>
          <Text style={styles.label}>Account Holder</Text>
          <Text style={styles.value}>{businessData.accountHolderName || "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Account Number</Text>
          <Text style={styles.value}>{businessData.bankAccountNumber || "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>IFSC Code</Text>
          <Text style={styles.value}>{businessData.ifscCode || "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Bank & Branch</Text>
          <Text style={[styles.value, styles.valueMultiline]}>
            {businessData.bankName || "-"} ({businessData.branchName || "-"})
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Account Type</Text>
          <Text style={styles.value}>{businessData.accountType || "-"}</Text>
        </View>
      </View>

      {/* 2.5 Authorised Signatory Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Authorised Signatory</Text>
          <TouchableOpacity onPress={() => onEditStep(0)} activeOpacity={0.7}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{businessData.signatoryName || "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>PAN</Text>
          <Text style={styles.value}>{businessData.signatoryPan || "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>DOB</Text>
          <Text style={styles.value}>{businessData.signatoryDob || "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Designation</Text>
          <Text style={styles.value}>{businessData.signatoryDesignation || "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Contact</Text>
          <Text style={[styles.value, styles.valueMultiline]}>
            {businessData.signatoryMobile ? `+91 ${businessData.signatoryMobile}` : "-"}
            {"\n"}
            {businessData.signatoryEmail || "-"}
          </Text>
        </View>
      </View>

      {/* 3. Documents Summary Card with Progress Bar */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Uploaded Documents</Text>
          <TouchableOpacity onPress={() => onEditStep(1)} activeOpacity={0.7}>
            <Text style={styles.docCountText}>
              {uploadedCount}/{totalCount} Uploaded
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.docProgressBar}>
          <View style={[styles.docProgressFill, getDocProgressFillStyle(progressPercent)]} />
        </View>

        {uploadedDocs.length > 0 ? (
          <View style={styles.uploadedDocList}>
            {uploadedDocs.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.uploadedDocItem}
                activeOpacity={0.7}
                onPress={() => setPreviewDoc(doc)}
              >
                <Ionicons name="checkmark-circle" size={18} color="#059669" />
                <View style={styles.uploadedDocTextCol}>
                  <Text style={styles.uploadedDocName} numberOfLines={1}>
                    {doc.name}
                  </Text>
                  {doc.id === "address-proof" && (
                     <Text style={styles.uploadedDocSubtitle}>
                       {doc.subtitle}
                     </Text>
                  )}
                </View>
                <View style={styles.eyeIconBox}>
                  <Ionicons name="eye-outline" size={18} color={BrandColors.PRIMARY_BLUE} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>

      {/* 4. Declaration Checkbox Card */}
      <TouchableOpacity
        style={styles.declarationCard}
        activeOpacity={0.8}
        onPress={onToggleDeclaration}
      >
        <View style={[styles.checkbox, declared && styles.checkboxActive]}>
          {declared && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
        </View>
        <Text style={styles.declarationText}>
          I hereby declare that the information provided is true and accurate to the best of my knowledge. I authorise TaxEdge Fin Solutions to file this application on my behalf.
        </Text>
      </TouchableOpacity>

      {/* Full-Screen Document Preview Modal */}
      <Modal
        visible={Boolean(previewDoc)}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewDoc(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderInfo}>
                <Text style={styles.modalDocTitle} numberOfLines={1}>
                  {previewDoc?.name}
                </Text>
                <Text style={styles.modalDocSubtitle}>
                  Uploaded document verification
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setPreviewDoc(null)}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalImageContainer}>
              {previewDoc?.fileUri ? (
                <Image
                  source={{ uri: previewDoc.fileUri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.modalPlaceholder}>
                  <Ionicons name="document-text-outline" size={60} color="#94A3B8" />
                  <Text style={styles.modalPlaceholderText}>Preview not available</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.modalFooterBtn}
              activeOpacity={0.8}
              onPress={() => setPreviewDoc(null)}
            >
              <Text style={styles.modalFooterBtnText}>Close Preview</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

