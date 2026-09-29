import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import { PromoterSponsorItem } from "../../types/projectFinance.types";
import { modalStyles as styles } from "./PromoterModal.styles";

interface PromoterModalProps {
  visible: boolean;
  initialData?: PromoterSponsorItem | null;
  onSave: (promoter: PromoterSponsorItem) => void;
  onClose: () => void;
}

export const PromoterModal: React.FC<PromoterModalProps> = ({
  visible,
  initialData,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(initialData?.name ?? "");
  const [type, setType] = useState<"Individual" | "Corporate">(
    initialData?.type ?? "Individual"
  );
  const [share, setShare] = useState(
    initialData ? String(initialData.sharePercentage) : ""
  );

  const handleSave = () => {
    if (!name.trim()) return;
    const shareNum = parseFloat(share) || 0;
    const initials = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    onSave({
      id: initialData ? initialData.id : Date.now().toString(),
      name: name.trim(),
      type,
      sharePercentage: shareNum,
      initials: initials || "PS",
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.modalTitle}>
            {initialData ? "Edit Promoter / Sponsor" : "Add Promoter / Sponsor"}
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Mr. Rajesh Kumar"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Sponsor Category *</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeBtn, type === "Individual" && styles.typeBtnActive]}
                onPress={() => setType("Individual")}
              >
                <Text
                  style={[
                    styles.typeText,
                    type === "Individual" && styles.typeTextActive,
                  ]}
                >
                  Individual
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeBtn, type === "Corporate" && styles.typeBtnActive]}
                onPress={() => setType("Corporate")}
              >
                <Text
                  style={[
                    styles.typeText,
                    type === "Corporate" && styles.typeTextActive,
                  ]}
                >
                  Corporate
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Equity Shareholding (%) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 50"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={share}
              onChangeText={setShare}
            />
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PromoterModal;
