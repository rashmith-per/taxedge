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
import { CapacityProductionForm } from "../../types/step2Types";
import { CAPACITY_UNITS, SHIFT_OPTIONS } from "../../data/step2Data";
import { styles } from "./CapacityProductionCard.styles";

interface CapacityProductionCardProps {
  data: CapacityProductionForm;
  onChange: (field: keyof CapacityProductionForm, value: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const CapacityProductionCard: React.FC<CapacityProductionCardProps> = ({
  data,
  onChange,
  isExpanded,
  onToggleExpand,
}) => {
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    field: keyof CapacityProductionForm | null;
  }>({
    visible: false,
    title: "",
    options: [],
    field: null,
  });

  const openPicker = (
    title: string,
    options: string[],
    field: keyof CapacityProductionForm
  ) => {
    setModalConfig({ visible: true, title, options, field });
  };

  const handleSelectOption = (value: string) => {
    if (modalConfig.field) {
      onChange(modalConfig.field, value);
    }
    setModalConfig({ visible: false, title: "", options: [], field: null });
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
            <Ionicons name="bar-chart-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>7. Capacity & Production</Text>
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
                Proposed Capacity <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter capacity"
                placeholderTextColor="#94A3B8"
                value={data.proposedCapacity}
                onChangeText={(t) => onChange("proposedCapacity", t)}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>
                Capacity Unit <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.pickerContainer}
                onPress={() => openPicker("Capacity Unit", CAPACITY_UNITS, "capacityUnit")}
                activeOpacity={0.7}
              >
                <Text style={data.capacityUnit ? styles.pickerText : styles.placeholderText}>
                  {data.capacityUnit || "Select unit"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Expected Initial Utilisation (%)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter percentage"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={data.initialUtilisation}
                onChangeText={(t) => onChange("initialUtilisation", t)}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Stabilised Utilisation (%)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter percentage"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={data.stabilisedUtilisation}
                onChangeText={(t) => onChange("stabilisedUtilisation", t)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>
                Production per Year <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter production"
                placeholderTextColor="#94A3B8"
                value={data.productionPerYear}
                onChangeText={(t) => onChange("productionPerYear", t)}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>
                Operating Days / Year <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter days"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={data.operatingDaysPerYear}
                onChangeText={(t) => onChange("operatingDaysPerYear", t)}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Number of Shifts <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() => openPicker("Number of Shifts", SHIFT_OPTIONS, "numberOfShifts")}
              activeOpacity={0.7}
            >
              <Text style={data.numberOfShifts ? styles.pickerText : styles.placeholderText}>
                {data.numberOfShifts || "Select number of shifts"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal
        visible={modalConfig.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalConfig({ visible: false, title: "", options: [], field: null })}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalConfig({ visible: false, title: "", options: [], field: null })}
        >
          <Pressable style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <FlatList
              data={modalConfig.options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectOption(item)}
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

export default CapacityProductionCard;
