import React from "react";
import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DocumentUploadItem } from "../../data/step7Data";
import { styles } from "./UploadDocumentsCard.styles";

interface DocumentPreviewModalProps {
  document: DocumentUploadItem | null;
  visible: boolean;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  visible,
  onClose,
}) => {
  if (!document) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Document Preview</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.previewBadge}>
              <Ionicons name="document-text" size={30} color="#2563EB" />
            </View>
            <Text style={styles.modalDocTitle}>{document.name}</Text>
            <Text style={styles.modalFileName}>
              {document.uploadedFileName}
            </Text>

            <View style={styles.modalMetaBox}>
              <View style={styles.modalMetaRow}>
                <Text style={styles.modalMetaLabel}>Category:</Text>
                <Text style={styles.modalMetaValue}>{document.category}</Text>
              </View>
              <View style={styles.modalMetaRow}>
                <Text style={styles.modalMetaLabel}>File Size:</Text>
                <Text style={styles.modalMetaValue}>
                  {document.uploadedFileSize || "1.2 MB"}
                </Text>
              </View>
              <View style={styles.modalMetaRow}>
                <Text style={styles.modalMetaLabel}>Uploaded:</Text>
                <Text style={styles.modalMetaValue}>
                  {document.uploadedAt || "Just now"}
                </Text>
              </View>
              <View style={styles.modalMetaRow}>
                <Text style={styles.modalMetaLabel}>Status:</Text>
                <Text style={styles.statusVerified}>✓ Verified & Attached</Text>
              </View>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalCloseActionBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseActionText}>Close Preview</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default DocumentPreviewModal;
