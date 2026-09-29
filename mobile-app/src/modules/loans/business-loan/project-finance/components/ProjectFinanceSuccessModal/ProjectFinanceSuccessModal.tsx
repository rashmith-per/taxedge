import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./ProjectFinanceSuccessModal.styles";

interface ProjectFinanceSuccessModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ProjectFinanceSuccessModal: React.FC<
  ProjectFinanceSuccessModalProps
> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-done" size={36} color="#16A34A" />
          </View>

          <Text style={styles.title}>Application Submitted!</Text>

          <View style={styles.appIdBadge}>
            <Text style={styles.appIdText}>Application ID: PF-2026-9842</Text>
          </View>

          <Text style={styles.description}>
            Your Project Finance loan application has been submitted successfully.
            Our credit appraisal team will review your proposal and initiate the
            site evaluation.
          </Text>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ProjectFinanceSuccessModal;
