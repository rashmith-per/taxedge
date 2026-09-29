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
import { RawMaterialItem } from "../../types/step2Types";
import { RAW_MATERIAL_SOURCES, RAW_MATERIAL_UNITS } from "../../data/step2Data";
import { styles } from "./RawMaterialInputsCard.styles";

interface RawMaterialInputsCardProps {
  materials: RawMaterialItem[];
  onAddMaterial: () => void;
  onUpdateMaterial: (id: string, field: keyof RawMaterialItem, value: any) => void;
  onDeleteMaterial: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const RawMaterialInputsCard: React.FC<RawMaterialInputsCardProps> = ({
  materials,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
  isExpanded,
  onToggleExpand,
}) => {
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    activeId: string | null;
    field: "source" | "unit" | null;
  }>({
    visible: false,
    title: "",
    options: [],
    activeId: null,
    field: null,
  });

  const handleSelectOption = (value: string) => {
    if (modalConfig.activeId && modalConfig.field) {
      onUpdateMaterial(modalConfig.activeId, modalConfig.field, value);
    }
    setModalConfig({ visible: false, title: "", options: [], activeId: null, field: null });
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
            <Ionicons name="cube-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>9. Raw Material / Inputs</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={(e) => {
              e.stopPropagation();
              onAddMaterial();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+ Add Material</Text>
          </TouchableOpacity>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#64748B"
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.cardBody}>
          {materials.map((item, index) => (
            <View key={item.id} style={styles.itemBox}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>Material {index + 1}</Text>
                {materials.length > 1 && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => onDeleteMaterial(item.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Main Raw Material <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter material name"
                  placeholderTextColor="#94A3B8"
                  value={item.mainRawMaterial}
                  onChangeText={(t) => onUpdateMaterial(item.id, "mainRawMaterial", t)}
                />
              </View>

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>
                    Source <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.pickerContainer}
                    onPress={() =>
                      setModalConfig({
                        visible: true,
                        title: "Select Source",
                        options: RAW_MATERIAL_SOURCES,
                        activeId: item.id,
                        field: "source",
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={item.source ? styles.pickerText : styles.placeholderText}>
                      {item.source || "Select source"}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <View style={styles.col}>
                  <Text style={styles.label}>
                    Supplier <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter supplier"
                    placeholderTextColor="#94A3B8"
                    value={item.supplier}
                    onChangeText={(t) => onUpdateMaterial(item.id, "supplier", t)}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>
                    Annual Requirement <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter quantity"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={item.annualRequirement}
                    onChangeText={(t) => onUpdateMaterial(item.id, "annualRequirement", t)}
                  />
                </View>

                <View style={styles.col}>
                  <Text style={styles.label}>
                    Unit <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.pickerContainer}
                    onPress={() =>
                      setModalConfig({
                        visible: true,
                        title: "Select Unit",
                        options: RAW_MATERIAL_UNITS,
                        activeId: item.id,
                        field: "unit",
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={item.unit ? styles.pickerText : styles.placeholderText}>
                      {item.unit || "Select unit"}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Supply Agreement?</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => onUpdateMaterial(item.id, "supplyAgreement", true)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        item.supplyAgreement && styles.radioCircleSelected,
                      ]}
                    >
                      {item.supplyAgreement && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.radioText}>Yes</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => onUpdateMaterial(item.id, "supplyAgreement", false)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        !item.supplyAgreement && styles.radioCircleSelected,
                      ]}
                    >
                      {!item.supplyAgreement && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.radioText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <Modal
        visible={modalConfig.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalConfig({ visible: false, title: "", options: [], activeId: null, field: null })}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalConfig({ visible: false, title: "", options: [], activeId: null, field: null })}
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

export default RawMaterialInputsCard;
