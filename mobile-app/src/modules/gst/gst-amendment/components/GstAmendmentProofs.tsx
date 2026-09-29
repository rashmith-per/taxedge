import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "../screens/GstAmendmentScreen/GstAmendmentScreen.styles";
import { SupportingDoc } from "../types/gstAmendmentTypes";

interface GstAmendmentProofsProps {
  supportingDoc: SupportingDoc | null;
  onBrowseFiles: () => void;
  onScanFile: () => void;
  onDeleteDoc: () => void;
  error?: string;
  acceptedProofs?: { initial: string[]; all: string[] };
  isProofsExpanded: boolean;
  onToggleExpandProofs: () => void;
}

export const GstAmendmentProofs: React.FC<GstAmendmentProofsProps> = ({
  supportingDoc,
  onBrowseFiles,
  onScanFile,
  onDeleteDoc,
  error,
  acceptedProofs,
  isProofsExpanded,
  onToggleExpandProofs,
}) => {
  const displayedProofs = acceptedProofs
    ? isProofsExpanded
      ? acceptedProofs.all
      : acceptedProofs.initial
    : [];

  const hasMoreProofs = acceptedProofs
    ? acceptedProofs.all.length > acceptedProofs.initial.length
    : false;

  return (
    <>
      <Text style={styles.formSectionTitle}>Supporting proof</Text>

      <View style={styles.proofCard}>
        <Text style={styles.proofDescText}>
          Attach the document that evidences this change (PDF, JPG, PNG - max 10 MB).
        </Text>

        <View style={styles.uploadActionsRow}>
          <TouchableOpacity
            style={styles.uploadBtn}
            activeOpacity={0.8}
            onPress={onBrowseFiles}
          >
            <Ionicons name="folder-outline" size={18} color="#EA580C" />
            <Text style={styles.uploadBtnText}>Browse Files</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadBtn}
            activeOpacity={0.8}
            onPress={onScanFile}
          >
            <Ionicons name="camera-outline" size={18} color={BrandColors.PRIMARY_BLUE} />
            <Text style={styles.uploadBtnText}>Scan</Text>
          </TouchableOpacity>
        </View>

        {supportingDoc && (
          <View style={styles.docPreviewRow}>
            <View style={styles.docPreviewIcon}>
              <Ionicons name="document-text" size={20} color={BrandColors.PRIMARY_BLUE} />
            </View>
            <View style={styles.docPreviewInfo}>
              <Text style={styles.docPreviewName} numberOfLines={1}>
                {supportingDoc.name}
              </Text>
              <Text style={styles.docPreviewSize}>{supportingDoc.size}</Text>
            </View>
            <TouchableOpacity
              style={styles.docDeleteBtn}
              onPress={onDeleteDoc}
              activeOpacity={0.7}
            >
              <Text style={styles.docDeleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}

        {error && <Text style={styles.proofErrorText}>{error}</Text>}
      </View>

      {acceptedProofs && (
        <View style={styles.acceptedProofsCard}>
          <View style={styles.acceptedProofsHeader}>
            <Ionicons name="information-circle" size={20} color={BrandColors.PRIMARY_ORANGE} />
            <Text style={styles.acceptedProofsTitle}>Accepted proofs</Text>
          </View>

          <View style={styles.acceptedProofList}>
            {displayedProofs.map((proofText, idx) => (
              <View key={idx} style={styles.acceptedProofItem}>
                <View style={styles.acceptedProofDot} />
                <Text style={styles.acceptedProofText}>{proofText}</Text>
              </View>
            ))}
          </View>

          {hasMoreProofs && (
            <TouchableOpacity
              style={styles.viewMoreBtn}
              activeOpacity={0.7}
              onPress={onToggleExpandProofs}
            >
              <Text style={styles.viewMoreText}>
                {isProofsExpanded ? "View Less" : "View More"}
              </Text>
              <Ionicons
                name={isProofsExpanded ? "chevron-up" : "chevron-down"}
                size={14}
                color={BrandColors.PRIMARY_ORANGE}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );
};
