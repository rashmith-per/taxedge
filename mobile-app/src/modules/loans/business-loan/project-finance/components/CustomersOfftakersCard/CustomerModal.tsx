import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { CustomerOfftakerItem } from "../../types/projectFinance.types";
import { styles } from "./CustomerModal.styles";

interface CustomerModalProps {
  visible: boolean;
  initialData?: CustomerOfftakerItem | null;
  onSave: (customer: CustomerOfftakerItem) => void;
  onClose: () => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  visible,
  initialData,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(initialData?.name ?? "");
  const [type, setType] = useState(initialData?.type ?? "Corporate");
  const [expectedQuantity, setExpectedQuantity] = useState(
    initialData?.expectedQuantity ?? ""
  );
  const [contractPeriodYears, setContractPeriodYears] = useState(
    initialData?.contractPeriodYears ?? ""
  );
  const [estimatedRevenue, setEstimatedRevenue] = useState(
    initialData?.estimatedRevenue ?? ""
  );

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: initialData ? initialData.id : Date.now().toString(),
      name: name.trim(),
      type: type || "Corporate",
      expectedQuantity: expectedQuantity || "30 MW",
      contractPeriodYears: contractPeriodYears || "10 Years",
      estimatedRevenue: estimatedRevenue || "120,000,000",
      isOfftaker: true,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.modalTitle}>
            {initialData ? "Edit Customer / Offtaker" : "Add Customer / Offtaker"}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Customer / Offtaker Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. ABC Power Limited"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Customer Type *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Corporate / State Utility"
                placeholderTextColor="#94A3B8"
                value={type}
                onChangeText={setType}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Expected Offtake Quantity *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 30 MW"
                placeholderTextColor="#94A3B8"
                value={expectedQuantity}
                onChangeText={setExpectedQuantity}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Contract Period *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 10 Years"
                placeholderTextColor="#94A3B8"
                value={contractPeriodYears}
                onChangeText={setContractPeriodYears}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Estimated Revenue (₹) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 120000000"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={estimatedRevenue}
                onChangeText={setEstimatedRevenue}
              />
            </View>
          </ScrollView>

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

export default CustomerModal;
