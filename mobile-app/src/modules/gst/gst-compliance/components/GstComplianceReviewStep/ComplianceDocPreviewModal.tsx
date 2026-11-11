import React from "react";
import { View, Text, Modal, TouchableOpacity, Image, Platform, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { UploadedDocInfo } from "@/modules/gst/validation/complianceSchema";
import { resolveDocType } from "../../utils/gstPreviewUtils";
import { styles } from "./GstComplianceReviewStep.styles";

import { PdfViewerModal } from "@/shared/components/PdfViewerModal";
interface ComplianceDocPreviewModalProps {
  previewDoc: UploadedDocInfo | null;
  isDark: boolean;
  isSharing: boolean;
  shareError: string | null;
  isIframeError: boolean;
  onClose: () => void;
  onOpenInNewTab: () => void;
  onOpenOrShareFile: () => void;
  onIframeError: () => void;
}

export const ComplianceDocPreviewModal: React.FC<ComplianceDocPreviewModalProps> = ({
  previewDoc,
  isDark,
  isSharing,
  shareError,
  isIframeError,
  onClose,
  onOpenInNewTab,
  onOpenOrShareFile,
  onIframeError,
}) => {
  if (!previewDoc) return null;

  const docTypeInfo = resolveDocType(previewDoc);
  const isWebRenderableUri = Boolean(
    Platform.OS === "web" &&
      previewDoc.uri &&
      /^(blob:|https?:|data:)/i.test(previewDoc.uri)
  );

  // Native PDFs open in the in-app viewer instead of the system share sheet.
  if (Platform.OS !== "web" && docTypeInfo.isPdf && previewDoc.uri) {
    return (
      <PdfViewerModal
        visible
        fileUri={previewDoc.uri}
        title={previewDoc.name}
        fileName={previewDoc.name}
        onClose={onClose}
      />
    );
  }

  return (
    <Modal visible={Boolean(previewDoc)} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
        <View style={[styles.previewCard, isDark && styles.previewCardDark]}>
          <View style={[styles.previewHeader, isDark && styles.previewHeaderDark]}>
            <Text style={[styles.previewTitle, isDark && styles.previewTitleDark]} numberOfLines={2} ellipsizeMode="middle">
              {previewDoc.name || "Document Preview"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle-outline" size={24} color={isDark ? "#94A3B8" : "#64748B"} />
            </TouchableOpacity>
          </View>

          <View style={styles.previewContent}>
            {docTypeInfo.isImage ? (
              <Image source={{ uri: previewDoc.uri }} style={styles.previewImage} resizeMode="contain" />
            ) : Platform.OS === "web" && isWebRenderableUri && docTypeInfo.isPdf ? (
              <View style={styles.pdfWebContainer}>
                {isIframeError ? (
                  <View style={styles.nativeFallbackBox}>
                    <Ionicons name="alert-circle-outline" size={32} color="#DC2626" />
                    <Text style={[styles.nativeNoticeText, isDark && styles.nativeNoticeTextDark]}>
                      Inline browser preview failed or file session expired.
                    </Text>
                    <TouchableOpacity
                      style={[styles.webActionBtn, isDark && styles.webActionBtnDark]}
                      activeOpacity={0.75}
                      onPress={onOpenInNewTab}
                    >
                      <Ionicons name="open-outline" size={14} color={isDark ? "#93C5FD" : "#1D4ED8"} />
                      <Text style={[styles.webActionBtnText, isDark && styles.webActionBtnTextDark]}>
                        Open in New Tab
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    {React.createElement("iframe", {
                      src: previewDoc.uri,
                      title: previewDoc.name,
                      onError: onIframeError,
                      style: { width: "100%", height: 380, border: "none", borderRadius: 8 },
                    })}
                    <View style={styles.webActionRow}>
                      <TouchableOpacity
                        style={[styles.webActionBtn, isDark && styles.webActionBtnDark]}
                        activeOpacity={0.75}
                        onPress={onOpenInNewTab}
                      >
                        <Ionicons name="open-outline" size={14} color={isDark ? "#93C5FD" : "#1D4ED8"} />
                        <Text style={[styles.webActionBtnText, isDark && styles.webActionBtnTextDark]}>
                          Open in New Tab
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ) : (
              <View style={styles.nativeFallbackBox}>
                <View style={[styles.nativeDocInfoCard, isDark && styles.nativeDocInfoCardDark]}>
                  <Ionicons
                    name={docTypeInfo.isSpreadsheet ? "grid-outline" : "document-text"}
                    size={28}
                    color={BrandColors.PRIMARY_ORANGE}
                  />
                  <View style={styles.nativeDocDetailsCol}>
                    <Text style={[styles.nativeDocTitle, isDark && styles.nativeDocTitleDark]} numberOfLines={2} ellipsizeMode="middle">
                      {previewDoc.name}
                    </Text>
                    <Text style={[styles.nativeDocMeta, isDark && styles.nativeDocMetaDark]}>
                      {previewDoc.sizeFormatted} • {docTypeInfo.typeLabel}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.nativeNoticeText, isDark && styles.nativeNoticeTextDark]}>
                  {docTypeInfo.isSpreadsheet
                    ? "Spreadsheet files cannot be rendered inline. Open or export using your device or browser."
                    : Platform.OS === "web"
                    ? "Inline browser preview is unavailable for this file URI scheme."
                    : "Inline PDF preview is not supported on this device. Open or export the document using the device system handler below."}
                </Text>

                <TouchableOpacity
                  style={[styles.externalShareBtn, isSharing && styles.externalShareBtnDisabled]}
                  activeOpacity={0.8}
                  onPress={onOpenOrShareFile}
                  disabled={isSharing}
                >
                  {isSharing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="open-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.externalShareBtnText}>
                        {Platform.OS === "web" ? "Open Document File" : "Open / Share File..."}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {shareError ? (
                  <View style={[styles.nativeErrorBox, isDark && styles.nativeErrorBoxDark]}>
                    <Ionicons name="alert-circle" size={14} color="#DC2626" />
                    <Text style={[styles.nativeErrorText, isDark && styles.nativeErrorTextDark]}>
                      {shareError}
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.previewDoneBtn, isDark && styles.previewDoneBtnDark]}
            activeOpacity={0.8}
            onPress={onClose}
          >
            <Text style={[styles.previewDoneBtnText, isDark && styles.previewDoneBtnTextDark]}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
