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
import { RightOfWayForm } from "../../types/projectFinance.types";
import {
  ROW_TYPES,
  ROW_STATUS_OPTIONS,
  APPROVAL_STATUS_OPTIONS,
} from "../../data/projectFinanceData";
import { ProjectFinanceDatePicker } from "../ProjectFinanceDatePicker/ProjectFinanceDatePicker";
import { styles } from "./RightOfWayCard.styles";

interface RightOfWayCardProps {
  data: RightOfWayForm;
  onChange: (field: keyof RightOfWayForm, value: any) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const RightOfWayCard: React.FC<RightOfWayCardProps> = ({
  data,
  onChange,
  isExpanded,
  onToggleExpand,
}) => {
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    field: keyof RightOfWayForm | null;
  }>({
    visible: false,
    title: "",
    options: [],
    field: null,
  });

  const openPicker = (
    title: string,
    options: string[],
    field: keyof RightOfWayForm
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
            <Ionicons name="git-network-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>4. Right of Way (ROW)</Text>
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
          {/* ROW Required? */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              ROW Required? <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={styles.radioRow}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => onChange("rowRequired", true)}
              >
                <View
                  style={[
                    styles.radioOuter,
                    data.rowRequired && styles.radioOuterSelected,
                  ]}
                >
                  {data.rowRequired && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => onChange("rowRequired", false)}
              >
                <View
                  style={[
                    styles.radioOuter,
                    !data.rowRequired && styles.radioOuterSelected,
                  ]}
                >
                  {!data.rowRequired && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ROW Type */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              ROW Type <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() => openPicker("Select ROW Type", ROW_TYPES, "rowType")}
            >
              <Text
                style={
                  data.rowType ? styles.pickerText : styles.placeholderText
                }
              >
                {data.rowType || "Select type"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Total Length (km) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Total Length (km) <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter length"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.totalLengthKm}
              onChangeText={(text) => onChange("totalLengthKm", text)}
            />
          </View>

          {/* Obtained / Pending */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Obtained / Pending <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker(
                  "Select ROW Status",
                  ROW_STATUS_OPTIONS,
                  "obtainedPendingStatus"
                )
              }
            >
              <Text
                style={
                  data.obtainedPendingStatus
                    ? styles.pickerText
                    : styles.placeholderText
                }
              >
                {data.obtainedPendingStatus || "Select status"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Approval Status */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Approval Status <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker(
                  "Select Approval Status",
                  APPROVAL_STATUS_OPTIONS,
                  "approvalStatus"
                )
              }
            >
              <Text
                style={
                  data.approvalStatus
                    ? styles.pickerText
                    : styles.placeholderText
                }
              >
                {data.approvalStatus || "Select status"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Expected Completion Date */}
          <ProjectFinanceDatePicker
            label="Expected Completion Date"
            value={data.expectedCompletionDate}
            onChange={(dateStr) => onChange("expectedCompletionDate", dateStr)}
          />
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

export default RightOfWayCard;
