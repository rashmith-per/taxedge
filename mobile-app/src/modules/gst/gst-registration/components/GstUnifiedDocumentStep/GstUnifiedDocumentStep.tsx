/**
 * Component: GstUnifiedDocumentStep
 * Migrated from internal StyleSheet to external styles module.
 * Uses shared design tokens from src/shared/theme.ts.
 *
 * Document selection reuses the shared upload infrastructure:
 *  - useDocumentUploadHelper (files / gallery / camera pickers)
 *  - DocumentUploadBottomSheet (source chooser)
 * Server upload happens in GstRegistrationScreen (gstApi.uploadDocument);
 * this component only renders each document's independent state.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { useDocumentUploadHelper } from "@/shared/hooks/useDocumentUploadHelper";
import { DocumentUploadBottomSheet } from "@/shared/components/DocumentUploadBottomSheet";
import { formatFileSize } from "@/modules/gst/utils/gstValidation";
import {
  styles,
  getProgressFillStyle,
  getIconBoxStyle,
} from "./GstUnifiedDocumentStep.styles";

/**
 * Transient per-document state. The "ready" and "uploaded" states are derived:
 *  - ready    = a file is selected but the server has not accepted it yet
 *  - uploaded = the server accepted exactly the currently selected file
 */
export type DocumentUploadStatus = "processing" | "uploading" | "error";

export type DocumentDisplayStatus =
  | "idle"
  | "processing"
  | "ready"
  | "uploading"
  | "uploaded"
  | "error";

export interface DocumentItem {
  id: string;
  name: string;
  subtitle: string;
  required: boolean;
  iconName: string;
  iconBg: string;
  iconColor: string;
  category: "Identity Proof" | "Business Proof" | "Financial & Signatory";
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
  uploadedAt?: string;
  /** Transient state of the current operation on this document. */
  uploadStatus?: DocumentUploadStatus;
  /** The file URI the server accepted (so it is never uploaded twice). */
  uploadedFileUri?: string;
  /** Message shown when the last upload of this document failed. */
  uploadError?: string;
  /** Whether retrying the same file can succeed (network/server errors). */
  canRetry?: boolean;
}

export const isDocumentUploaded = (doc: DocumentItem): boolean =>
  Boolean(doc.fileUri) && doc.uploadedFileUri === doc.fileUri;

export const getDocumentStatus = (doc: DocumentItem): DocumentDisplayStatus => {
  if (doc.uploadStatus === "processing") return "processing";
  if (!doc.fileUri) return "idle";
  if (doc.uploadStatus === "uploading") return "uploading";
  if (isDocumentUploaded(doc)) return "uploaded";
  if (doc.uploadStatus === "error") return "error";
  return "ready";
};

export const isPdfDocument = (doc: Pick<DocumentItem, "mimeType" | "fileName" | "fileUri">): boolean =>
  doc.mimeType === "application/pdf" ||
  Boolean(doc.fileName?.toLowerCase().endsWith(".pdf")) ||
  Boolean(doc.fileUri?.toLowerCase().endsWith(".pdf"));

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: "pan",
    name: "PAN Card",
    subtitle: "Front copy with clear name & photo",
    required: true,
    iconName: "card",
    iconBg: "#E0F2FE",
    iconColor: "#0284C7",
    category: "Identity Proof",
  },
  {
    id: "aadhaar",
    name: "Aadhaar Card",
    subtitle: "Front & back copy with QR code",
    required: true,
    iconName: "finger-print",
    iconBg: "#F3E8FF",
    iconColor: "#7E22CE",
    category: "Identity Proof",
  },
  {
    id: "business-proof",
    name: "Business Registration Proof",
    subtitle: "COI / Partnership Deed / Trade License",
    required: true,
    iconName: "document-text",
    iconBg: "#E0F2FE",
    iconColor: "#2563EB",
    category: "Business Proof",
  },
  {
    id: "address-proof",
    name: "Principal Place Address Proof",
    subtitle: "Electricity Bill / Rental Agreement",
    required: true,
    iconName: "home",
    iconBg: "#FEF3C7",
    iconColor: "#D97706",
    category: "Business Proof",
  },
  {
    id: "bank-statement",
    name: "Bank Passbook / Cancelled Cheque",
    subtitle: "Showing account holder name, A/C & IFSC",
    required: true,
    iconName: "business",
    iconBg: "#DCFCE7",
    iconColor: "#16A34A",
    category: "Financial & Signatory",
  },
  {
    id: "photograph",
    name: "Passport Size Photograph",
    subtitle: "Recent colour photo with white background",
    required: true,
    iconName: "image",
    iconBg: "#FEF0E6",
    iconColor: BrandColors.PRIMARY_ORANGE,
    category: "Financial & Signatory",
  },
];

const ADDRESS_PROOF_TYPES = [
  "Rental Agreement",
  "Ownership Proof",
  "Electricity Bill",
  "Other Address Proof",
];

const ADDRESS_PROOF_PLACEHOLDER = "Electricity Bill / Rental Agreement";

const STATUS_LABELS: Record<DocumentDisplayStatus, string> = {
  idle: "Required",
  processing: "Processing",
  ready: "Ready to upload",
  uploading: "Uploading",
  uploaded: "Uploaded",
  error: "Failed",
};

interface GstUnifiedDocumentStepProps {
  documents: DocumentItem[];
  /** Updates a single document by its stable id (never replaces the list). */
  onUpdateDocument: (docId: string, patch: Partial<DocumentItem>) => void;
  /** Re-sends one failed document to the server. */
  onRetryUpload?: (docId: string) => void;
  /** True while the screen is sending documents to the server. */
  isUploading?: boolean;
}

export const GstUnifiedDocumentStep: React.FC<GstUnifiedDocumentStepProps> = ({
  documents,
  onUpdateDocument,
  onRetryUpload,
  isUploading = false,
}) => {
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);
  const [showAddressProofModal, setShowAddressProofModal] = useState(false);

  const previewDoc = previewDocId ? documents.find((d) => d.id === previewDocId) || null : null;

  const uploadHelper = useDocumentUploadHelper({
    maxSizeMB: 10,
    // Native free-form crop + rotate (Android). The iOS native editor only
    // offers a square crop, which would cut off parts of a document.
    allowsEditing: Platform.OS === "android",
    onProcessingStart: (docKey) => {
      if (docKey) onUpdateDocument(docKey, { uploadStatus: "processing" });
    },
    onCancel: (docKey) => {
      // Keep whatever was selected before; only leave the processing state.
      if (docKey) onUpdateDocument(docKey, { uploadStatus: undefined });
    },
    onError: (message, docKey) => {
      if (docKey) onUpdateDocument(docKey, { uploadStatus: undefined });
      Alert.alert("Could not use this file", message);
    },
    onSuccess: (file, docKey) => {
      if (!docKey) return;
      const doc = documents.find((d) => d.id === docKey);
      const isPdf = isPdfDocument({ mimeType: file.mimeType, fileName: file.name, fileUri: file.uri });
      const baseName = (doc?.name || "Document").replace(/[\s/]/g, "_");
      onUpdateDocument(docKey, {
        fileUri: file.uri,
        fileName: file.name || `${baseName}.${isPdf ? "pdf" : "jpg"}`,
        fileSize: file.size ? formatFileSize(file.size) : undefined,
        mimeType: file.mimeType || (isPdf ? "application/pdf" : "image/jpeg"),
        uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        // New file: not uploaded yet, previous errors no longer apply.
        uploadStatus: undefined,
        uploadError: undefined,
        canRetry: undefined,
      });
    },
  });

  const uploadedCount = documents.reduce(
    (count, doc) => (isDocumentUploaded(doc) ? count + 1 : count),
    0
  );
  const selectedCount = documents.reduce(
    (count, doc) => (doc.fileUri ? count + 1 : count),
    0
  );
  const totalCount = documents.length;
  const progressPercent = totalCount > 0 ? (selectedCount / totalCount) * 100 : 0;

  const categories: Array<DocumentItem["category"]> = [
    "Identity Proof",
    "Business Proof",
    "Financial & Signatory",
  ];

  const needsAddressProofType = (doc?: DocumentItem) =>
    doc?.id === "address-proof" && doc.subtitle === ADDRESS_PROOF_PLACEHOLDER;

  const handleOpenUpload = (docId: string) => {
    if (isUploading) return;
    const targetDoc = documents.find((d) => d.id === docId);
    if (needsAddressProofType(targetDoc)) {
      Alert.alert(
        "Select Document Type",
        "Please select the type of address proof from the dropdown first.",
        [{ text: "OK", onPress: () => setShowAddressProofModal(true) }]
      );
      return;
    }
    uploadHelper.openUploadSheet(docId, targetDoc?.name || "Document");
  };

  const handleRemoveDoc = (docId: string) => {
    if (isUploading) return;
    Alert.alert(
      "Remove Document",
      "Are you sure you want to remove this document?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            onUpdateDocument(docId, {
              fileUri: undefined,
              fileName: undefined,
              fileSize: undefined,
              mimeType: undefined,
              uploadedAt: undefined,
              uploadStatus: undefined,
              uploadError: undefined,
              canRetry: undefined,
            });
            if (previewDocId === docId) setPreviewDocId(null);
          },
        },
      ]
    );
  };

  const renderStatusBadge = (status: DocumentDisplayStatus) => {
    const badgeStyle =
      status === "uploaded" ? styles.statusUploaded
      : status === "error" ? styles.statusError
      : status === "ready" ? styles.statusReady
      : status === "processing" || status === "uploading" ? styles.statusBusy
      : styles.statusPending;
    const textStyle =
      status === "uploaded" ? styles.statusUploadedText
      : status === "error" ? styles.statusErrorText
      : status === "ready" ? styles.statusReadyText
      : status === "processing" || status === "uploading" ? styles.statusBusyText
      : styles.statusPendingText;

    return (
      <View style={[styles.statusBadge, badgeStyle]}>
        {status === "processing" || status === "uploading" ? (
          <ActivityIndicator size="small" color="#0F3567" style={{ transform: [{ scale: 0.6 }] }} />
        ) : (
          <Ionicons
            name={
              status === "uploaded" ? "checkmark-circle"
              : status === "error" ? "alert-circle"
              : status === "ready" ? "time-outline"
              : "ellipse-outline"
            }
            size={12}
            color={
              status === "uploaded" ? "#059669"
              : status === "error" ? "#DC2626"
              : status === "ready" ? "#C2410C"
              : "#94A3B8"
            }
          />
        )}
        <Text style={[styles.statusBadgeText, textStyle]}>{STATUS_LABELS[status]}</Text>
      </View>
    );
  };

  const renderFilePreview = (doc: DocumentItem) => {
    const pdf = isPdfDocument(doc);
    const meta = [doc.fileSize, pdf ? "PDF" : "Image", doc.uploadedAt ? `Added ${doc.uploadedAt}` : null]
      .filter(Boolean)
      .join(" · ");
    return (
      <View style={styles.filePreviewRow}>
        {pdf ? (
          <View style={styles.fileThumbPdf}>
            <Ionicons name="document-text" size={24} color="#FF7A00" />
          </View>
        ) : (
          // key forces a fresh image when the file changes (no stale preview)
          <Image key={doc.fileUri} source={{ uri: doc.fileUri }} style={styles.fileThumb} resizeMode="cover" />
        )}
        <View style={styles.fileMetaCol}>
          <Text style={styles.fileNameText} numberOfLines={1}>
            {doc.fileName || "Selected document"}
          </Text>
          <Text style={styles.fileMetaText} numberOfLines={1}>{meta}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Progress Header Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressRow}>
          <View style={styles.progressTitleCol}>
            <Text style={styles.progressTitle}>Document Checklist</Text>
            <Text style={styles.progressSubtitle}>
              Upload original clear photos or scanned copies
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {selectedCount}/{totalCount} Added
            </Text>
          </View>
        </View>

        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, getProgressFillStyle(progressPercent)]} />
        </View>
        {selectedCount > 0 ? (
          <Text style={styles.progressSubtitle}>
            {uploadedCount} of {selectedCount} sent to TaxEdge. Remaining documents upload when you tap Continue.
          </Text>
        ) : null}
      </View>

      {categories.map((category) => {
        const categoryDocs = documents.filter((doc) => doc.category === category);
        if (categoryDocs.length === 0) return null;

        return (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>

            <View style={styles.docsList}>
              {categoryDocs.map((doc) => {
                const status = getDocumentStatus(doc);
                const hasFile = Boolean(doc.fileUri);
                const isBusy = status === "processing" || status === "uploading" || isUploading;

                return (
                  <View
                    key={doc.id}
                    style={[
                      styles.docCard,
                      status === "uploaded" && styles.docCardUploaded,
                      status === "error" && styles.docCardError,
                    ]}
                  >
                    <View style={styles.cardTopRow}>
                      <View style={[styles.iconBox, getIconBoxStyle(doc.iconBg)]}>
                        <Ionicons name={doc.iconName as any} size={20} color={doc.iconColor} />
                      </View>

                      <View style={styles.docInfoCol}>
                        <View style={styles.titleRow}>
                          <Text style={styles.docName}>{doc.name}</Text>
                          {doc.required && <Text style={styles.requiredAsterisk}> *</Text>}
                        </View>
                        {doc.id === "address-proof" && !hasFile ? (
                          <TouchableOpacity
                            onPress={() => setShowAddressProofModal(true)}
                            style={styles.addressProofPickerBtn}
                          >
                            <Text style={[styles.docSubtitle, styles.docSubtitleLink]}>
                              {needsAddressProofType(doc) ? "Select Address Proof" : doc.subtitle}
                            </Text>
                            <Ionicons name="chevron-down" size={14} color={BrandColors.PRIMARY_BLUE} style={styles.dropdownIcon} />
                          </TouchableOpacity>
                        ) : (
                          <Text style={styles.docSubtitle} numberOfLines={1}>
                            {doc.subtitle}
                          </Text>
                        )}
                      </View>

                      {renderStatusBadge(status)}
                    </View>

                    {/* Processing: never show the previous file while a new one is being prepared */}
                    {status === "processing" ? (
                      <View style={styles.processingRow}>
                        <ActivityIndicator size="small" color="#FF7A00" />
                        <Text style={styles.processingText}>Preparing document…</Text>
                      </View>
                    ) : hasFile ? (
                      renderFilePreview(doc)
                    ) : null}

                    {status === "error" && doc.uploadError ? (
                      <View style={styles.errorBox}>
                        <Ionicons name="alert-circle" size={16} color="#DC2626" />
                        <Text style={styles.errorBoxText}>{doc.uploadError}</Text>
                        {doc.canRetry && onRetryUpload ? (
                          <TouchableOpacity
                            style={[styles.retryBtn, isUploading && styles.actionDisabled]}
                            activeOpacity={0.8}
                            disabled={isUploading}
                            onPress={() => onRetryUpload(doc.id)}
                          >
                            <Ionicons name="refresh" size={13} color="#FFFFFF" />
                            <Text style={styles.retryBtnText}>Retry</Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    ) : null}

                    {/* Action Bar */}
                    {hasFile && status !== "processing" ? (
                      <View style={styles.uploadedActionRow}>
                        <TouchableOpacity
                          style={styles.viewBtn}
                          activeOpacity={0.7}
                          onPress={() => setPreviewDocId(doc.id)}
                        >
                          <Ionicons name="eye-outline" size={16} color={BrandColors.PRIMARY_BLUE} />
                          <Text style={styles.viewBtnText}>View Document</Text>
                        </TouchableOpacity>

                        <View style={styles.actionBtnDivider} />

                        <TouchableOpacity
                          style={[styles.replaceBtn, isBusy && styles.actionDisabled]}
                          activeOpacity={0.7}
                          disabled={isBusy}
                          onPress={() => handleOpenUpload(doc.id)}
                        >
                          <Ionicons name="sync-outline" size={15} color="#64748B" />
                          <Text style={styles.replaceBtnText}>Replace</Text>
                        </TouchableOpacity>

                        <View style={styles.actionBtnDivider} />

                        <TouchableOpacity
                          style={[styles.deleteBtn, isBusy && styles.actionDisabled]}
                          activeOpacity={0.7}
                          disabled={isBusy}
                          onPress={() => handleRemoveDoc(doc.id)}
                        >
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ) : !hasFile && status !== "processing" ? (
                      <View style={styles.uploadButtonsRow}>
                        <TouchableOpacity
                          style={[styles.uploadBtn, styles.uploadBtnPrimary, isUploading && styles.actionDisabled]}
                          activeOpacity={0.8}
                          disabled={isUploading}
                          onPress={() => handleOpenUpload(doc.id)}
                        >
                          <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" />
                          <Text style={styles.uploadBtnPrimaryText}>Add Document</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}

      {/* Info Callout */}
      <View style={styles.infoCallout}>
        <Ionicons name="shield-checkmark" size={20} color={BrandColors.PRIMARY_BLUE} />
        <Text style={styles.infoCalloutText}>
          Your documents are encrypted and safely stored in compliance with GST data protection standards.
        </Text>
      </View>

      {/* Shared upload source chooser (Files / Gallery / Camera) */}
      <DocumentUploadBottomSheet
        visible={uploadHelper.isSheetVisible}
        documentTitle={uploadHelper.currentDocTitle}
        maxSizeText="10 MB"
        onClose={() => {
          // Closing the sheet while a picker was never opened: nothing to undo.
          uploadHelper.closeUploadSheet();
        }}
        onPickFiles={uploadHelper.pickFiles}
        onPickGallery={uploadHelper.pickGallery}
        onTakePhoto={uploadHelper.takePhoto}
      />

      {/* Full-Screen Document Viewer Modal */}
      <Modal
        visible={Boolean(previewDoc)}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewDocId(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderInfo}>
                <Text style={styles.modalDocTitle} numberOfLines={1}>
                  {previewDoc?.name}
                </Text>
                <Text style={styles.modalDocMeta}>
                  {previewDoc?.fileName || "Selected document"}
                  {previewDoc ? ` · ${STATUS_LABELS[getDocumentStatus(previewDoc)]}` : ""}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setPreviewDocId(null)}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalImageContainer}>
              {previewDoc?.fileUri && !isPdfDocument(previewDoc) ? (
                <Image
                  key={previewDoc.fileUri}
                  source={{ uri: previewDoc.fileUri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              ) : previewDoc?.fileUri ? (
                <View style={styles.modalPdfPlaceholder}>
                  <Ionicons name="document-text" size={60} color="#FF7A00" />
                  <Text style={styles.modalPlaceholderText}>PDF document selected</Text>
                </View>
              ) : (
                <View style={styles.modalPlaceholder}>
                  <Ionicons name="document-text-outline" size={60} color="#94A3B8" />
                  <Text style={styles.modalPlaceholderText}>Preview not available</Text>
                </View>
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalReplaceBtn, isUploading && styles.actionDisabled]}
                disabled={isUploading}
                onPress={() => {
                  const id = previewDoc?.id;
                  setPreviewDocId(null);
                  if (id) handleOpenUpload(id);
                }}
              >
                <Ionicons name="sync-outline" size={16} color={BrandColors.PRIMARY_BLUE} />
                <Text style={styles.modalReplaceText}>Replace</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalDoneBtn}
                onPress={() => setPreviewDocId(null)}
              >
                <Text style={styles.modalDoneText}>Close Preview</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Address Proof Selection Modal */}
      <Modal
        visible={showAddressProofModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddressProofModal(false)}
      >
        <TouchableOpacity
          style={styles.selectModalOverlay}
          activeOpacity={1}
          onPress={() => setShowAddressProofModal(false)}
        >
          <View style={styles.selectModalContent}>
            <Text style={styles.selectModalTitle}>Select Address Proof</Text>
            {ADDRESS_PROOF_TYPES.map((proof) => (
              <TouchableOpacity
                key={proof}
                style={styles.selectModalOption}
                onPress={() => {
                  onUpdateDocument("address-proof", { subtitle: proof });
                  setShowAddressProofModal(false);
                }}
              >
                <Text style={styles.selectModalOptionText}>{proof}</Text>
                {documents.find((d) => d.id === "address-proof")?.subtitle === proof && (
                  <Ionicons name="checkmark" size={18} color={BrandColors.PRIMARY_BLUE} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
