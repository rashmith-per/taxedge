import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { EpcExecutionForm } from "../../types/step2Types";
import { EPC_CONTRACT_TYPES } from "../../data/step2Data";
import { ProjectFinanceDatePicker } from "../ProjectFinanceDatePicker/ProjectFinanceDatePicker";
import { styles } from "./EpcExecutionCard.styles";

interface EpcExecutionCardProps {
  data: EpcExecutionForm;
  onChange: (field: keyof EpcExecutionForm, value: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const EpcExecutionCard: React.FC<EpcExecutionCardProps> = ({
  data,
  onChange,
  isExpanded,
  onToggleExpand,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectContractType = (val: string) => {
    onChange("contractType", val);
    setModalVisible(false);
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onToggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name="business-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>10. EPC / Project Execution</Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#64748B"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.cardBody}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>
                EPC Contractor <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter contractor name"
                placeholderTextColor="#94A3B8"
                value={data.epcContractor}
                onChangeText={(t) => onChange("epcContractor", t)}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>
                Contract Type <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.pickerContainer}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={data.contractType ? styles.pickerText : styles.placeholderText}>
                  {data.contractType || "Select contract type"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>
                EPC Contract Value (₹) <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={data.epcContractValue}
                onChangeText={(t) => onChange("epcContractValue", t)}
              />
            </View>
            <View style={styles.col}>
              <ProjectFinanceDatePicker
                label="EPC Award Date"
                value={data.epcAwardDate}
                onChange={(val) => onChange("epcAwardDate", val)}
                placeholder="DD MMM YYYY"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <ProjectFinanceDatePicker
                label="Construction Start Date *"
                value={data.constructionStartDate}
                onChange={(val) => onChange("constructionStartDate", val)}
                placeholder="DD MMM YYYY"
              />
            </View>
            <View style={styles.col}>
              <ProjectFinanceDatePicker
                label="Expected Completion Date *"
                value={data.expectedCompletionDate}
                onChange={(val) => onChange("expectedCompletionDate", val)}
                placeholder="DD MMM YYYY"
              />
            </View>
          </View>
        </View>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Contract Type</Text>
            <FlatList
              data={EPC_CONTRACT_TYPES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectContractType(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default EpcExecutionCard;
