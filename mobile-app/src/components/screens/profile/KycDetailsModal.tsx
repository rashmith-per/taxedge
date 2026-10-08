import React from "react";
import { View, Text, Modal } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SecondaryButton } from "@/shared/components/Button/SecondaryButton";
import { styles } from "@/styles/app/(main)/profile.styles";

interface KycDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  colors: any;
  activePan?: string;
  activeAadhaar?: string;
  kycVerified: boolean;
}

export function KycDetailsModal({
  visible,
  onClose,
  colors,
  activePan,
  activeAadhaar,
  kycVerified,
}: KycDetailsModalProps) {
  const panDisplay = activePan
    ? `${activePan.substring(0, 5)}****${activePan.substring(9)}`
    : "N/A";

  const aadhaarDisplay = activeAadhaar
    ? `**** **** ${activeAadhaar.substring(
        Math.max(0, activeAadhaar.length - 4)
      )}`
    : "N/A";

  const statusColor = kycVerified ? colors.success : colors.orange;
  const statusIcon = kycVerified ? "checkmark-circle" : "time";
  const statusLabel = kycVerified ? "VERIFIED ✓" : "PENDING";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            KYC Details
          </Text>

          <View style={styles.modalBody}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoKey, { color: colors.textSecondary }]}>
                PAN Number
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {panDisplay}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoKey, { color: colors.textSecondary }]}>
                Aadhaar Number
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {aadhaarDisplay}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoKey, { color: colors.textSecondary }]}>
                Verification Status
              </Text>
              <View style={styles.statusLabelContainer}>
                <Ionicons name={statusIcon} size={16} color={statusColor} />
                <Text
                  style={[
                    styles.statusLabelText,
                    { color: statusColor },
                  ]}
                >
                  {statusLabel}
                </Text>
              </View>
            </View>
          </View>

          <Text style={[styles.modalNote, { color: colors.textSecondary }]}>
            Status reflects the PAN and Aadhaar documents uploaded against your
            applications.
          </Text>

          <SecondaryButton title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
