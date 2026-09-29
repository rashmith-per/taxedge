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
import { RepaymentSourcesForm } from "../../types/projectFinance.types";
import {
  PRIMARY_SOURCES_REPAYMENT,
  SECONDARY_SOURCES_REPAYMENT,
} from "../../data/projectFinanceData";
import { styles } from "./RepaymentSourcesCard.styles";

export interface RepaymentSourcesCardProps {
  data: RepaymentSourcesForm;
  onChange: (field: keyof RepaymentSourcesForm, value: any) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  autoCalculatedDscr?: string;
}

export const RepaymentSourcesCard: React.FC<RepaymentSourcesCardProps> = ({
  data,
  onChange,
  isExpanded,
  onToggleExpand,
  autoCalculatedDscr,
}) => {
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    field: keyof RepaymentSourcesForm | null;
  }>({
    visible: false,
    title: "",
    options: [],
    field: null,
  });

  const openPicker = (
    title: string,
    options: string[],
    field: keyof RepaymentSourcesForm
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
            <Ionicons name="trending-up-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>4. Repayment Sources</Text>
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
          <Text style={styles.subtitle}>
            Specify the expected sources of repayment.
          </Text>

          {/* Primary Source */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Primary Source of Repayment <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker(
                  "Select Primary Source",
                  PRIMARY_SOURCES_REPAYMENT,
                  "primarySource"
                )
              }
            >
              <Text
                style={
                  data.primarySource ? styles.pickerText : styles.placeholderText
                }
              >
                {data.primarySource || "Select source"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Secondary Source */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Secondary Source (Optional)</Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker(
                  "Select Secondary Source",
                  SECONDARY_SOURCES_REPAYMENT,
                  "secondarySource"
                )
              }
            >
              <Text
                style={
                  data.secondarySource ? styles.pickerText : styles.placeholderText
                }
              >
                {data.secondarySource || "Select source"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Projected DSCR */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              DSCR (Projected) <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder={autoCalculatedDscr ? `e.g. ${autoCalculatedDscr} (Auto-calculated)` : "Enter DSCR"}
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.projectedDscr || autoCalculatedDscr || ""}
              onChangeText={(text) => onChange("projectedDscr", text)}
            />
            <Text style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
              Auto-calculated based on projected financials. Editable.
            </Text>
          </View>

          {/* Explain Repayment Sources */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Explain Repayment Sources <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter details about expected cash flows and repayment sources"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={data.explanation}
              onChangeText={(text) => onChange("explanation", text)}
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

export default RepaymentSourcesCard;
