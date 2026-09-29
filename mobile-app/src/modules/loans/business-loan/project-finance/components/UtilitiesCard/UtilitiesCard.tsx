import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { UtilitiesForm } from "../../types/projectFinance.types";
import {
  POWER_SOURCES,
  WATER_SOURCES,
  APPROACH_ROADS,
  DRAINAGE_OPTIONS,
  WASTE_OPTIONS,
  OTHER_INFRA_OPTIONS,
} from "../../data/projectFinanceData";
import { styles } from "./UtilitiesCard.styles";

interface UtilitiesCardProps {
  data: UtilitiesForm;
  onChange: (field: keyof UtilitiesForm, value: any) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const UtilitiesCard: React.FC<UtilitiesCardProps> = ({
  data,
  onChange,
  isExpanded,
  onToggleExpand,
}) => {
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    field: keyof UtilitiesForm | null;
  }>({
    visible: false,
    title: "",
    options: [],
    field: null,
  });

  const openPicker = (
    title: string,
    options: string[],
    field: keyof UtilitiesForm
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
            <Ionicons name="settings-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>5. Utilities & Site Infrastructure</Text>
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
          {/* Power Source */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Power Source <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker("Select Power Source", POWER_SOURCES, "powerSource")
              }
            >
              <Text
                style={
                  data.powerSource ? styles.pickerText : styles.placeholderText
                }
              >
                {data.powerSource || "Select power source"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Water Source */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Water Source <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker("Select Water Source", WATER_SOURCES, "waterSource")
              }
            >
              <Text
                style={
                  data.waterSource ? styles.pickerText : styles.placeholderText
                }
              >
                {data.waterSource || "Select water source"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Approach Road */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Approach Road <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker("Select Approach Road", APPROACH_ROADS, "approachRoad")
              }
            >
              <Text
                style={
                  data.approachRoad ? styles.pickerText : styles.placeholderText
                }
              >
                {data.approachRoad || "Select approach road"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Drainage Arrangement */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Drainage Arrangement <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker(
                  "Select Drainage Arrangement",
                  DRAINAGE_OPTIONS,
                  "drainageArrangement"
                )
              }
            >
              <Text
                style={
                  data.drainageArrangement
                    ? styles.pickerText
                    : styles.placeholderText
                }
              >
                {data.drainageArrangement || "Select drainage"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Waste / Effluent Arrangement */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Waste / Effluent Arrangement{" "}
              <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker(
                  "Select Waste Arrangement",
                  WASTE_OPTIONS,
                  "wasteArrangement"
                )
              }
            >
              <Text
                style={
                  data.wasteArrangement
                    ? styles.pickerText
                    : styles.placeholderText
                }
              >
                {data.wasteArrangement || "Select arrangement"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Other Infrastructure */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Other Infrastructure</Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker(
                  "Select Other Infrastructure",
                  OTHER_INFRA_OPTIONS,
                  "otherInfrastructure"
                )
              }
            >
              <Text
                style={
                  data.otherInfrastructure
                    ? styles.pickerText
                    : styles.placeholderText
                }
              >
                {data.otherInfrastructure || "Select option"}
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
        onRequestClose={() =>
          setModalConfig({ visible: false, title: "", options: [], field: null })
        }
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            justifyContent: "flex-end",
          }}
          onPress={() =>
            setModalConfig({ visible: false, title: "", options: [], field: null })
          }
        >
          <Pressable
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: "60%",
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#0F172A",
                marginBottom: 12,
              }}
            >
              {modalConfig.title}
            </Text>
            <FlatList
              data={modalConfig.options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F1F5F9",
                  }}
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

export default UtilitiesCard;
