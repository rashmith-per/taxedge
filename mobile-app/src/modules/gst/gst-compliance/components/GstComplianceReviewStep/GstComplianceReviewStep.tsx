import React, { useState, useCallback, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import * as Sharing from "expo-sharing";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/shared/hooks/useTheme";
import { BrandColors } from "@/shared/theme";
import { ComplianceFormData, UploadedDocInfo } from "@/modules/gst/validation/complianceSchema";
import {
  GstReviewUploadedDocsCard,
  GstReviewUploadedDocItem,
} from "@/modules/gst/components/common";
import { resolveDocType } from "../../utils/gstPreviewUtils";
import { styles } from "./GstComplianceReviewStep.styles";
import { ComplianceDocPreviewModal } from "./ComplianceDocPreviewModal";

export interface GstComplianceReviewStepProps {
  formData: ComplianceFormData;
  dbData?: any;
  complianceId?: string | null;
  onEditStep: (section?: string) => void;
}

interface ReviewRowProps {
  label: string;
  value: string;
  isDark: boolean;
  multiline?: boolean;
  isMissing?: boolean;
}

const ReviewRow: React.FC<ReviewRowProps> = ({ label, value, isDark, multiline = false, isMissing = false }) => (
  <View style={styles.row}>
    <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
    <Text
      style={[styles.value, isDark && styles.valueDark, multiline && styles.valueMultiline, isMissing && styles.valueMissing]}
      numberOfLines={multiline ? undefined : 1}
    >
      {value || "-"}
    </Text>
  </View>
);

export const formatGstr2bReference = (formDataVal?: string | null, dbDataVal?: string | null): string => {
  const cleanForm = typeof formDataVal === "string" ? formDataVal.trim() : "";
  const cleanDb = typeof dbDataVal === "string" ? dbDataVal.trim() : "";

  const isValidValue = (v: string): boolean => {
    if (!v) return false;
    const upper = v.toUpperCase();
    return upper !== "NOT_SPECIFIED" && upper !== "NOT_PROVIDED" && upper !== "NOT SPECIFIED" && upper !== "NOT PROVIDED";
  };

  if (isValidValue(cleanForm)) return cleanForm;
  if (isValidValue(cleanDb)) return cleanDb;
  return "Not Provided";
};

export const GstComplianceReviewStep: React.FC<GstComplianceReviewStepProps> = ({
  formData,
  dbData,
  complianceId,
  onEditStep,
}) => {
  const { isDark } = useTheme();
  const [previewDoc, setPreviewDoc] = useState<UploadedDocInfo | null>(null);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isIframeError, setIsIframeError] = useState<boolean>(false);

  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined" && previewDoc?.uri?.startsWith("blob:")) {
      fetch(previewDoc.uri, { method: "HEAD" }).catch(() => {
        setIsIframeError(true);
      });
    }
  }, [previewDoc]);

  const handleClosePreview = useCallback(() => {
    setPreviewDoc(null);
    setShareError(null);
    setIsSharing(false);
    setIsIframeError(false);
  }, []);

  const handleOpenInNewTab = useCallback(() => {
    if (Platform.OS === "web" && typeof window !== "undefined" && previewDoc?.uri) {
      if (/^(blob:|https?:|data:)/i.test(previewDoc.uri)) {
        const opened = window.open(previewDoc.uri, "_blank", "noopener,noreferrer");
        if (!opened) {
          setShareError("Pop-up was blocked. Please allow pop-ups for Finsolz to open the document.");
        }
      } else {
        setShareError("Direct browser opening is not supported for this file scheme.");
      }
    }
  }, [previewDoc]);

  const handleOpenOrShareFile = useCallback(async () => {
    if (!previewDoc?.uri) {
      setShareError("Document location is unavailable.");
      return;
    }
    setShareError(null);
    setIsSharing(true);
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined") {
          if (/^(blob:|https?:|data:)/i.test(previewDoc.uri)) {
            const opened = window.open(previewDoc.uri, "_blank", "noopener,noreferrer");
            if (!opened) {
              setShareError("Pop-up was blocked. Please allow pop-ups for Finsolz to open the document.");
            }
          } else {
            setShareError("Direct browser opening is not supported for this file scheme.");
          }
        }
        return;
      }
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        setShareError("Sharing is not supported on this device.");
        return;
      }
      const docTypeInfo = resolveDocType(previewDoc);
      await Sharing.shareAsync(previewDoc.uri, {
        mimeType: docTypeInfo.resolvedMime,
        dialogTitle: previewDoc.name,
        UTI: docTypeInfo.uti,
      });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Unable to open or share document.";
      const isCancelled =
        errorMsg.toLowerCase().includes("cancel") || errorMsg.toLowerCase().includes("dismiss");
      if (!isCancelled) {
        setShareError("Unable to open file in external viewer. Please try again.");
      }
    } finally {
      setIsSharing(false);
    }
  }, [previewDoc]);

  const displayRequestType = formData.requestType
    ? formData.requestType
    : dbData?.requestType === "RECONCILIATION_SUPPORT"
    ? "Reconciliation Support"
    : dbData?.requestType === "NOTICE_RESPONSE"
    ? "Notice Response"
    : dbData?.requestType || "";

  const isRecon = displayRequestType === "Reconciliation Support";

  const uploadedDocItems: GstReviewUploadedDocItem[] = useMemo(() => {
    const list: GstReviewUploadedDocItem[] = [];
    if (isRecon) {
      if (formData.purchaseDoc?.uri) {
        list.push({
          id: "purchase-doc",
          name: "Purchase Register",
          subtitle: formData.purchaseDoc.name || formData.purchaseDoc.sizeFormatted,
          fileUri: formData.purchaseDoc.uri,
          fileName: formData.purchaseDoc.name,
          fileSize: formData.purchaseDoc.sizeFormatted,
          mimeType: formData.purchaseDoc.mimeType,
        });
      }
      if (formData.salesDoc?.uri) {
        list.push({
          id: "sales-doc",
          name: "Sales Register / Additional Reconciliation Data",
          subtitle: formData.salesDoc.name || formData.salesDoc.sizeFormatted,
          fileUri: formData.salesDoc.uri,
          fileName: formData.salesDoc.name,
          fileSize: formData.salesDoc.sizeFormatted,
          mimeType: formData.salesDoc.mimeType,
        });
      }
    } else {
      if (formData.noticeDoc?.uri) {
        list.push({
          id: "notice-doc",
          name: "Department Notice / Order Document",
          subtitle: formData.noticeDoc.name || formData.noticeDoc.sizeFormatted,
          fileUri: formData.noticeDoc.uri,
          fileName: formData.noticeDoc.name,
          fileSize: formData.noticeDoc.sizeFormatted,
          mimeType: formData.noticeDoc.mimeType,
        });
      }
    }
    return list;
  }, [isRecon, formData.purchaseDoc, formData.salesDoc, formData.noticeDoc]);

  const renderEditButton = (section?: string) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onEditStep(section)}
      style={styles.editBtn}
    >
      <Ionicons name="pencil" size={12} color={BrandColors.PRIMARY_ORANGE} />
      <Text style={styles.editBtnText}>Edit</Text>
    </TouchableOpacity>
  );

  const gstr2bDisplay = formatGstr2bReference(formData.gstr2bRef, dbData?.gstr2bNumber);

  return (
    <View style={styles.container}>
      {/* 1. Submission Ready Banner */}
      <View style={[styles.readyCard, isDark && styles.readyCardDark]}>
        <View style={styles.readyIconBox}>
          <Ionicons name="checkmark-done" size={20} color="#16A34A" />
        </View>
        <View style={styles.readyTextCol}>
          <Text style={[styles.readyHeading, isDark && styles.readyHeadingDark]}>
            Review Compliance Request
          </Text>
          <Text style={[styles.readySub, isDark && styles.readySubDark]}>
            Verify your filing information, parameters, and uploaded documents before final submission to Finsolz.
          </Text>
        </View>
      </View>

      {/* 2. Request Overview Card */}
      <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
            Request & Filing Details
          </Text>
          {renderEditButton("details")}
        </View>
        <View style={[styles.divider, isDark && styles.dividerDark]} />

        <ReviewRow label="GSTIN" value={formData.gstin || dbData?.gstin} isDark={isDark} />
        <ReviewRow label="Financial Year" value={formData.financialYear || dbData?.financialYear} isDark={isDark} />
        <ReviewRow label="Request Type" value={displayRequestType} isDark={isDark} />
      </View>

      {/* 3. Section Specific Details Card */}
      <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
            {isRecon ? "Reconciliation Parameters" : "Notice Details"}
          </Text>
          {renderEditButton(isRecon ? "recon" : "notice")}
        </View>
        <View style={[styles.divider, isDark && styles.dividerDark]} />

        {isRecon ? (
          <>
            <ReviewRow label="GSTR-2B Ref / Period" value={gstr2bDisplay} isDark={isDark} />
            <ReviewRow label="Remarks" value={formData.reconciliationRemarks || dbData?.message || "None"} isDark={isDark} multiline />
          </>
        ) : (
          <>
            <ReviewRow label="Notice / Order No." value={formData.noticeNumber || dbData?.noticeNumber} isDark={isDark} />
            <ReviewRow label="Notice Issue Date" value={formData.noticeIssueDate || dbData?.noticeIssueDate} isDark={isDark} />
            <ReviewRow label="Reply Due Date" value={formData.replyDueDate || dbData?.replyDueDate} isDark={isDark} />
            <ReviewRow label="Remarks / Grounds" value={formData.noticeRemarks || dbData?.message || "None"} isDark={isDark} multiline />
          </>
        )}
      </View>

      {/* 4. Uploaded Documents Card */}
      <GstReviewUploadedDocsCard
        documents={uploadedDocItems}
        onEdit={() => onEditStep("docs")}
        onPreviewDoc={(item) => {
          const matchedDoc =
            item.id === "purchase-doc"
              ? formData.purchaseDoc
              : item.id === "sales-doc"
              ? formData.salesDoc
              : formData.noticeDoc;
          if (matchedDoc) {
            setPreviewDoc(matchedDoc);
          } else {
            setPreviewDoc({
              uri: item.fileUri || "",
              name: item.name,
              sizeFormatted: item.fileSize || "",
              mimeType: item.mimeType,
            });
          }
          setShareError(null);
          setIsIframeError(false);
        }}
        emptyText="No documents uploaded"
      />

      {/* Reusable Document Preview Modal */}
      <ComplianceDocPreviewModal
        previewDoc={previewDoc}
        isDark={isDark}
        isSharing={isSharing}
        shareError={shareError}
        isIframeError={isIframeError}
        onClose={handleClosePreview}
        onOpenInNewTab={handleOpenInNewTab}
        onOpenOrShareFile={handleOpenOrShareFile}
        onIframeError={() => setIsIframeError(true)}
      />
    </View>
  );
};

export default GstComplianceReviewStep;
