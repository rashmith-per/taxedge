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
import { TechnicalDetailsForm } from "../../types/projectFinance.types";
import { TECH_TYPES, TECH_SOURCES } from "../../data/projectFinanceData";
import { styles } from "./TechnicalDetailsCard.styles";

interface TechnicalDetailsCardProps {
  data: TechnicalDetailsForm;
  onChange: (field: keyof TechnicalDetailsForm, value: any) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const TechnicalDetailsCard: React.FC<TechnicalDetailsCardProps> = ({
  data,
  onChange,
  isExpanded,
  onToggleExpand,
}) => {
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    field: keyof TechnicalDetailsForm | null;
  }>({
    visible: false,
    title: "",
    options: [],
    field: null,
  });

  const openPicker = (
    title: string,
    options: string[],
    field: keyof TechnicalDetailsForm
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
            <Ionicons name="bar-chart-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>6. Technical Details</Text>
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
          {/* Technology Type */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Technology Type <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker("Select Tech Type", TECH_TYPES, "technologyType")
              }
            >
              <Text
                style={
                  data.technologyType
                    ? styles.pickerText
                    : styles.placeholderText
                }
              >
                {data.technologyType || "Select type"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Technology Description */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Technology Description <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter description"
              placeholderTextColor="#94A3B8"
              value={data.technologyDescription}
              onChangeText={(text) => onChange("technologyDescription", text)}
            />
          </View>

          {/* Technology Source */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Technology Source <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker("Select Tech Source", TECH_SOURCES, "technologySource")
              }
            >
              <Text
                style={
                  data.technologySource
                    ? styles.pickerText
                    : styles.placeholderText
                }
              >
                {data.technologySource || "Select source"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Technology Provider */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Technology Provider <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter provider name"
              placeholderTextColor="#94A3B8"
              value={data.technologyProvider}
              onChangeText={(text) => onChange("technologyProvider", text)}
            />
          </View>

          {/* Technology Proven? */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Technology Proven? <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={styles.radioRow}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => onChange("technologyProven", true)}
              >
                <View
                  style={[
                    styles.radioOuter,
                    data.technologyProven && styles.radioOuterSelected,
                  ]}
                >
                  {data.technologyProven && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => onChange("technologyProven", false)}
              >
                <View
                  style={[
                    styles.radioOuter,
                    !data.technologyProven && styles.radioOuterSelected,
                  ]}
                >
                  {!data.technologyProven && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Technology License Required? */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Technology License Required? <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={styles.radioRow}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => onChange("technologyLicenseRequired", true)}
              >
                <View
                  style={[
                    styles.radioOuter,
                    data.technologyLicenseRequired && styles.radioOuterSelected,
                  ]}
                >
                  {data.technologyLicenseRequired && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => onChange("technologyLicenseRequired", false)}
              >
                <View
                  style={[
                    styles.radioOuter,
                    !data.technologyLicenseRequired && styles.radioOuterSelected,
                  ]}
                >
                  {!data.technologyLicenseRequired && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Technical Consultant */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Technical Consultant</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter consultant name"
              placeholderTextColor="#94A3B8"
              value={data.technicalConsultant}
              onChangeText={(text) => onChange("technicalConsultant", text)}
            />
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

export default TechnicalDetailsCard;
