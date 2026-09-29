import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  // dimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import {
  pickImageAssetFromGallery,
  pickImageAssetFromCamera,
} from "@/modules/gst/utils/imageUploadHelper";
import { formatFileSize } from "@/modules/gst/utils/gstValidation";
import { styles } from "./GstFilingDocumentsStep.styles";

// const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export type DocumentBadgeType = "Required" | "Recommended" | "Conditional" | "Optional";

export interface FilingDocItem {
  id: string;
  name: string;
  subtitle: string;
  required: boolean;
  badgeType?: DocumentBadgeType;
  iconName: string;
  iconBg: string;
  iconColor: string;
  category: "Sales & Outward Supplies" | "Purchases & Input Tax" | "Banking & Reconciliation" | "Statutory & Compliance";
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
}

export const INITIAL_FILING_DOCS: FilingDocItem[] = [
  {
    id: "sales-invoices",
    name: "Sales Invoices / Register",
    subtitle: "Outward supply bill book / tax invoices",
    required: true,
    badgeType: "Required",
    iconName: "document-text",
    iconBg: "#E0F2FE",
    iconColor: "#0284C7",
    category: "Sales & Outward Supplies",
  },
  {
    id: "credit-notes",
    name: "Credit Notes",
    subtitle: "Issued during the period for sales returns",
    required: false,
    badgeType: "Conditional",
    iconName: "arrow-undo",
    iconBg: "#FEF3C7",
    iconColor: "#D97706",
    category: "Sales & Outward Supplies",
  },
  {
    id: "debit-notes",
    name: "Debit Notes",
    subtitle: "Issued for rate differences or added tax",
    required: false,
    badgeType: "Conditional",
    iconName: "arrow-redo",
    iconBg: "#FEF3C7",
    iconColor: "#D97706",
    category: "Sales & Outward Supplies",
  },
  {
    id: "e-invoice",
    name: "E-Invoice Data (IRN)",
    subtitle: "JSON / PDF files where applicable for B2B",
    required: false,
    badgeType: "Conditional",
    iconName: "barcode-outline",
    iconBg: "#E0F2FE",
    iconColor: "#2563EB",
    category: "Sales & Outward Supplies",
  },
  {
    id: "e-way-bill",
    name: "E-Way Bill Data",
    subtitle: "Consolidated transit bills for goods movement",
    required: false,
    badgeType: "Conditional",
    iconName: "car-outline",
    iconBg: "#E0F2FE",
    iconColor: "#2563EB",
    category: "Sales & Outward Supplies",
  },
  {
    id: "purchase-invoices",
    name: "Purchase Invoices / Register",
    subtitle: "Inward supply tax invoices with GSTIN",
    required: true,
    badgeType: "Required",
    iconName: "file-tray-full",
    iconBg: "#DCFCE7",
    iconColor: "#16A34A",
    category: "Purchases & Input Tax",
  },
  {
    id: "gstr-2b",
    name: "GSTR-2B ITC Statement",
    subtitle: "Auto-drafted ITC statement from GST portal",
    required: true,
    badgeType: "Required",
    iconName: "shield-checkmark-outline",
    iconBg: "#DCFCE7",
    iconColor: "#16A34A",
    category: "Purchases & Input Tax",
  },
  {
    id: "expense-bills",
    name: "Expense Invoices & Vouchers",
    subtitle: "Electricity, telephone, logistics, rent",
    required: false,
    badgeType: "Recommended",
    iconName: "receipt",
    iconBg: "#F3E8FF",
    iconColor: "#7E22CE",
    category: "Purchases & Input Tax",
  },
  {
    id: "bank-statement",
    name: "Bank Statement / Passbook",
    subtitle: "Monthly statement showing sales & expense flows",
    required: false,
    badgeType: "Recommended",
    iconName: "business",
    iconBg: "#FEF0E6",
    iconColor: BrandColors.PRIMARY_ORANGE,
    category: "Banking & Reconciliation",
  },
  {
    id: "prev-gst-returns",
    name: "Previous GST Returns",
    subtitle: "Copies of previous GSTR-1 & GSTR-3B filings",
    required: false,
    badgeType: "Recommended",
    iconName: "folder-open",
    iconBg: "#E0F2FE",
    iconColor: "#2563EB",
    category: "Banking & Reconciliation",
  },
  {
    id: "prev-gst-ack",
    name: "Previous Filing Acknowledgement",
    subtitle: "ARN receipt copy for ITC balance carry-forward",
    required: false,
    badgeType: "Recommended",
    iconName: "receipt-outline",
    iconBg: "#E0F2FE",
    iconColor: "#2563EB",
    category: "Banking & Reconciliation",
  },
  {
    id: "other-docs",
    name: "Other Supporting Documents",
    subtitle: "Challans, ledgers, or CA reconciliation notes",
    required: false,
    badgeType: "Optional",
    iconName: "attach-outline",
    iconBg: "#F1F5F9",
    iconColor: "#64748B",
    category: "Statutory & Compliance",
  },
];

interface GstFilingDocumentsStepProps {
  documents?: FilingDocItem[];
  onUpdateDocuments?: (updatedDocs: FilingDocItem[]) => void;
  filingPeriodText?: string;
  filingNature?: "Regular Return" | "Nil Return";
}

export const GstFilingDocumentsStep: React.FC<GstFilingDocumentsStepProps> = ({
  documents: externalDocuments,
  onUpdateDocuments,
  filingPeriodText = "GSTR-3B — July 2026",
  filingNature = "Regular Return",
}) => {
  const [internalDocs, setInternalDocs] = useState<FilingDocItem[]>(INITIAL_FILING_DOCS);
  const [previewDoc, setPreviewDoc] = useState<FilingDocItem | null>(null);

  const documents = externalDocuments || internalDocs;

  const setDocs = (newDocs: FilingDocItem[]) => {
    if (onUpdateDocuments) {
      onUpdateDocuments(newDocs);
    } else {
      setInternalDocs(newDocs);
    }
  };

  // Pure functional calculation of progress using reduce
  const uploadedCount = documents.reduce(
    (count, doc) => (doc.fileUri ? count + 1 : count),
    0
  );
  const totalCount = documents.length;
  const progressPercent = totalCount > 0 ? (uploadedCount / totalCount) * 100 : 0;

  const categories: Array<FilingDocItem["category"]> = [
    "Sales & Outward Supplies",
    "Purchases & Input Tax",
    "Banking & Reconciliation",
    "Statutory & Compliance",
  ];

  const handleUploadOption = async (docId: string, source: "gallery" | "camera") => {
    const asset =
      source === "camera" ? await pickImageAssetFromCamera() : await pickImageAssetFromGallery();
    if (asset) {
      const updatedList = documents.map((doc) => {
        if (doc.id === docId) {
          return {
            ...doc,
            fileUri: asset.uri,
            fileName: `${doc.name.replace(/[\s/()&]/g, "_")}.jpg`,
            // Real size reported by the picker; never a made-up value.
            fileSize: asset.fileSize ? formatFileSize(asset.fileSize) : undefined,
            uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
        }
        return doc;
      });
      setDocs(updatedList);
    }
  };

  const handlePromptUpload = (docId: string) => {
    Alert.alert("Upload Document", "Choose source to select document image:", [
      { text: "Camera", onPress: () => handleUploadOption(docId, "camera") },
      { text: "Photo Gallery", onPress: () => handleUploadOption(docId, "gallery") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleRemoveDoc = (docId: string) => {
    Alert.alert(
      "Remove Document",
      "Are you sure you want to remove this uploaded filing document?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            const updated = documents.map((doc) =>
              doc.id === docId
                ? { ...doc, fileUri: undefined, fileName: undefined, fileSize: undefined }
                : doc
            );
            setDocs(updated);
            if (previewDoc?.id === docId) {
              setPreviewDoc(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Guidance Advisory */}
      <View style={styles.banner}>
        <Ionicons name="information-circle-outline" size={18} color="#083B75" />
        <Text style={styles.bannerText}>
          Upload documents for <Text style={styles.boldText}>{filingPeriodText}</Text>. Clear invoices ensure 100% accurate Input Tax Credit (ITC) claim.
        </Text>
      </View>

      {/* Nil Return Informative Banner */}
      {filingNature === "Nil Return" && (
        <View style={styles.nilBanner}>
          <Ionicons name="checkmark-done-circle" size={22} color="#15803D" />
          <View style={styles.nilBannerTextCol}>
            <Text style={styles.nilBannerTitle}>Nil Return Selected</Text>
            <Text style={styles.nilBannerSub}>
              Since you have zero sales & purchases for this period, invoice uploads are not required. You can optionally upload a bank statement or proceed directly to review.
            </Text>
          </View>
        </View>
      )}

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressRow}>
          <View>
            <Text style={styles.progressTitle}>Filing Document Checklist</Text>
            <Text style={styles.progressSubtitle}>
              Required for monthly CA reconciliation
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {uploadedCount}/{totalCount} Completed
            </Text>
          </View>
        </View>

        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      {/* Document Categories */}
      {categories.map((category) => {
        const categoryDocs = documents.filter((doc) => doc.category === category);
        if (categoryDocs.length === 0) return null;

        return (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>

            <View style={styles.docsList}>
              {categoryDocs.map((doc) => {
                const isUploaded = Boolean(doc.fileUri);

                return (
                  <View
                    key={doc.id}
                    style={[styles.docCard, isUploaded && styles.docCardUploaded]}
                  >
                    <View style={styles.cardTopRow}>
                      {/* Icon */}
                      <View style={[styles.iconBox, { backgroundColor: doc.iconBg }]}>
                        <Ionicons
                          name={doc.iconName as any}
                          size={20}
                          color={doc.iconColor}
                        />
                      </View>

                      {/* Text Info */}
                      <View style={styles.docInfoCol}>
                        <View style={styles.titleRow}>
                          <Text style={styles.docName}>{doc.name}</Text>
                          {doc.required && (
                            <Text style={styles.requiredAsterisk}> *</Text>
                          )}
                        </View>
                        <Text style={styles.docSubtitle} numberOfLines={1}>
                          {isUploaded
                            ? `${doc.fileName} (${doc.fileSize})`
                            : doc.subtitle}
                        </Text>
                      </View>

                      {/* Status Badge */}
                      <View
                        style={[
                          styles.statusBadge,
                          isUploaded
                            ? styles.statusUploaded
                            : doc.badgeType === "Recommended"
                            ? styles.statusRecommended
                            : doc.badgeType === "Conditional"
                            ? styles.statusConditional
                            : doc.required && filingNature !== "Nil Return"
                            ? styles.statusRequired
                            : styles.statusOptional,
                        ]}
                      >
                        <Ionicons
                          name={isUploaded ? "checkmark-circle" : "ellipse-outline"}
                          size={12}
                          color={
                            isUploaded
                              ? "#059669"
                              : doc.badgeType === "Recommended"
                              ? "#D97706"
                              : doc.badgeType === "Conditional"
                              ? "#2563EB"
                              : doc.required && filingNature !== "Nil Return"
                              ? "#DC2626"
                              : "#64748B"
                          }
                        />
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isUploaded
                              ? styles.statusUploadedText
                              : doc.badgeType === "Recommended"
                              ? styles.statusRecommendedText
                              : doc.badgeType === "Conditional"
                              ? styles.statusConditionalText
                              : doc.required && filingNature !== "Nil Return"
                              ? styles.statusRequiredText
                              : styles.statusOptionalText,
                          ]}
                        >
                          {isUploaded
                            ? "Uploaded"
                            : filingNature === "Nil Return"
                            ? "Optional"
                            : doc.badgeType === "Conditional"
                            ? "If applicable"
                            : doc.badgeType || (doc.required ? "Required" : "Optional")}
                        </Text>
                      </View>
                    </View>

                    {/* Action Bar */}
                    {isUploaded ? (
                      <View style={styles.uploadedActionRow}>
                        <TouchableOpacity
                          style={styles.viewBtn}
                          activeOpacity={0.7}
                          onPress={() => setPreviewDoc(doc)}
                        >
                          <Ionicons
                            name="eye-outline"
                            size={16}
                            color={BrandColors.PRIMARY_BLUE}
                          />
                          <Text style={styles.viewBtnText}>View Document</Text>
                        </TouchableOpacity>

                        <View style={styles.actionBtnDivider} />

                        <TouchableOpacity
                          style={styles.replaceBtn}
                          activeOpacity={0.7}
                          onPress={() => handlePromptUpload(doc.id)}
                        >
                          <Ionicons
                            name="sync-outline"
                            size={15}
                            color="#64748B"
                          />
                          <Text style={styles.replaceBtnText}>Replace</Text>
                        </TouchableOpacity>

                        <View style={styles.actionBtnDivider} />

                        <TouchableOpacity
                          style={styles.deleteBtn}
                          activeOpacity={0.7}
                          onPress={() => handleRemoveDoc(doc.id)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color="#EF4444"
                          />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.uploadButtonsRow}>
                        <TouchableOpacity
                          style={styles.uploadBtn}
                          activeOpacity={0.8}
                          onPress={() => handleUploadOption(doc.id, "camera")}
                        >
                          <Ionicons
                            name="camera-outline"
                            size={16}
                            color={BrandColors.PRIMARY_ORANGE}
                          />
                          <Text style={styles.uploadBtnText}>Camera</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.uploadBtn, styles.uploadBtnPrimary]}
                          activeOpacity={0.8}
                          onPress={() => handleUploadOption(doc.id, "gallery")}
                        >
                          <Ionicons
                            name="cloud-upload-outline"
                            size={16}
                            color="#FFFFFF"
                          />
                          <Text style={styles.uploadBtnPrimaryText}>Upload File</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}

      {/* Info Banner */}
      <View style={styles.infoCallout}>
        <Ionicons name="shield-checkmark" size={20} color={BrandColors.PRIMARY_BLUE} />
        <Text style={styles.infoCalloutText}>
          TaxEdge uses end-to-end 256-bit encryption for filing proofs. Only certified Chartered Accountants review your books.
        </Text>
      </View>

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
                <Text style={styles.modalDocMeta}>
                  {previewDoc?.fileName} • {previewDoc?.fileSize}
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

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalReplaceBtn}
                onPress={() => {
                  const id = previewDoc?.id;
                  setPreviewDoc(null);
                  if (id) handlePromptUpload(id);
                }}
              >
                <Ionicons name="sync-outline" size={16} color={BrandColors.PRIMARY_BLUE} />
                <Text style={styles.modalReplaceText}>Re-upload</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalDoneBtn}
                onPress={() => setPreviewDoc(null)}
              >
                <Text style={styles.modalDoneText}>Close Preview</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

