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
import { LandDetailsForm } from "../../types/projectFinance.types";
import {
  LAND_OWNERSHIP_OPTIONS,
  LAND_USE_OPTIONS,
  TITLE_STATUS_OPTIONS,
  ENCUMBRANCE_OPTIONS,
  NA_CONVERSION_OPTIONS,
} from "../../data/projectFinanceData";
import { styles } from "./LandDetailsCard.styles";

interface LandDetailsCardProps {
  data: LandDetailsForm;
  onChange: (field: keyof LandDetailsForm, value: any) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const LandDetailsCard: React.FC<LandDetailsCardProps> = ({
  data,
  onChange,
  isExpanded,
  onToggleExpand,
}) => {
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    field: keyof LandDetailsForm | null;
  }>({
    visible: false,
    title: "",
    options: [],
    field: null,
  });

  const openPicker = (
    title: string,
    options: string[],
    field: keyof LandDetailsForm
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
      {/* Header */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onToggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name="map-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>2. Land Details</Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#64748B"
        />
      </TouchableOpacity>

      {/* Body */}
      {isExpanded && (
        <View style={styles.cardBody}>
          {/* Total Land Required */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Total Land Required (Acres) <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter area"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.totalLandRequired}
              onChangeText={(text) => onChange("totalLandRequired", text)}
            />
          </View>

          {/* Land Available */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Land Available (Acres) <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter area"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.landAvailable}
              onChangeText={(text) => onChange("landAvailable", text)}
            />
          </View>

          {/* Land Acquired */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Land Acquired (Acres) <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter area"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.landAcquired}
              onChangeText={(text) => onChange("landAcquired", text)}
            />
          </View>

          {/* Land Pending */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Land Pending (Acres)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter area"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.landPending}
              onChangeText={(text) => onChange("landPending", text)}
            />
          </View>

          {/* Land Ownership */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Land Ownership <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker("Select Ownership", LAND_OWNERSHIP_OPTIONS, "landOwnership")
              }
            >
              <Text
                style={
                  data.landOwnership ? styles.pickerText : styles.placeholderText
                }
              >
                {data.landOwnership || "Select ownership"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Land Use */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Land Use <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker("Select Land Use", LAND_USE_OPTIONS, "landUse")
              }
            >
              <Text
                style={data.landUse ? styles.pickerText : styles.placeholderText}
              >
                {data.landUse || "Select land use"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Title Status */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Title Status <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker("Select Title Status", TITLE_STATUS_OPTIONS, "titleStatus")
              }
            >
              <Text
                style={
                  data.titleStatus ? styles.pickerText : styles.placeholderText
                }
              >
                {data.titleStatus || "Select title status"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Encumbrance */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Encumbrance <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker(
                  "Select Encumbrance",
                  ENCUMBRANCE_OPTIONS,
                  "encumbrance"
                )
              }
            >
              <Text
                style={
                  data.encumbrance ? styles.pickerText : styles.placeholderText
                }
              >
                {data.encumbrance || "Select encumbrance"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* NA Conversion Status */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              NA Conversion Status <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker(
                  "Select NA Status",
                  NA_CONVERSION_OPTIONS,
                  "naConversionStatus"
                )
              }
            >
              <Text
                style={
                  data.naConversionStatus
                    ? styles.pickerText
                    : styles.placeholderText
                }
              >
                {data.naConversionStatus || "Select status"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal */}
      <Modal
        visible={modalConfig.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalConfig({ visible: false, title: "", options: [], field: null })}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(15, 23, 42, 0.5)", justifyContent: "flex-end" }}
          onPress={() => setModalConfig({ visible: false, title: "", options: [], field: null })}
        >
          <Pressable style={{ backgroundColor: "#FFFFFF", borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: "60%", padding: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 12 }}>{modalConfig.title}</Text>
            <FlatList
              data={modalConfig.options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}
                  onPress={() => handleSelectOption(item)}
                >
                  <Text style={{ fontSize: 14, color: "#1E293B" }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default LandDetailsCard;
