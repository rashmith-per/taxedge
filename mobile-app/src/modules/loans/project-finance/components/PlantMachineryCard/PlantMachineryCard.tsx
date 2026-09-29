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
import { PlantMachineryItem } from "../../types/step2Types";
import { MACHINERY_CATEGORIES } from "../../data/step2Data";
import { styles } from "./PlantMachineryCard.styles";

interface PlantMachineryCardProps {
  machineries: PlantMachineryItem[];
  onAddMachinery: () => void;
  onUpdateMachinery: (id: string, field: keyof PlantMachineryItem, value: string) => void;
  onDeleteMachinery: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const PlantMachineryCard: React.FC<PlantMachineryCardProps> = ({
  machineries,
  onAddMachinery,
  onUpdateMachinery,
  onDeleteMachinery,
  isExpanded,
  onToggleExpand,
}) => {
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    activeId: string | null;
  }>({
    visible: false,
    title: "",
    options: [],
    activeId: null,
  });

  const handleSelectOption = (value: string) => {
    if (modalConfig.activeId) {
      onUpdateMachinery(modalConfig.activeId, "category", value);
    }
    setModalConfig({ visible: false, title: "", options: [], activeId: null });
  };

  const handleNumericChange = (
    item: PlantMachineryItem,
    field: "quantity" | "unitCost",
    val: string
  ) => {
    onUpdateMachinery(item.id, field, val);
    const q = field === "quantity" ? parseFloat(val) || 0 : parseFloat(item.quantity) || 0;
    const u = field === "unitCost" ? parseFloat(val) || 0 : parseFloat(item.unitCost) || 0;
    const total = q && u ? (q * u).toString() : "";
    onUpdateMachinery(item.id, "totalCost", total);
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
            <Ionicons name="construct-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>8. Plant & Machinery</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={(e) => {
              e.stopPropagation();
              onAddMachinery();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+ Add Machinery</Text>
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
          {machineries.map((item, index) => (
            <View key={item.id} style={styles.itemBox}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>Machinery {index + 1}</Text>
                {machineries.length > 1 && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => onDeleteMachinery(item.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Machinery Name <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter machinery name"
                  placeholderTextColor="#94A3B8"
                  value={item.machineryName}
                  onChangeText={(t) => onUpdateMachinery(item.id, "machineryName", t)}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Category <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.pickerContainer}
                  onPress={() =>
                    setModalConfig({
                      visible: true,
                      title: "Select Category",
                      options: MACHINERY_CATEGORIES,
                      activeId: item.id,
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Text style={item.category ? styles.pickerText : styles.placeholderText}>
                    {item.category || "Select category"}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Manufacturer / Supplier <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter manufacturer / supplier"
                  placeholderTextColor="#94A3B8"
                  value={item.manufacturerSupplier}
                  onChangeText={(t) => onUpdateMachinery(item.id, "manufacturerSupplier", t)}
                />
              </View>

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>
                    Quantity <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter quantity"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={item.quantity}
                    onChangeText={(t) => handleNumericChange(item, "quantity", t)}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>
                    Unit Cost (₹) <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter unit cost"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={item.unitCost}
                    onChangeText={(t) => handleNumericChange(item, "unitCost", t)}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Total Cost (₹)</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    placeholder="Auto"
                    placeholderTextColor="#94A3B8"
                    editable={false}
                    value={item.totalCost}
                  />
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
        onRequestClose={() => setModalConfig({ visible: false, title: "", options: [], activeId: null })}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalConfig({ visible: false, title: "", options: [], activeId: null })}
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

export default PlantMachineryCard;
