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
import { RepaymentDetailsForm } from "../../types/projectFinance.types";
import {
  REPAYMENT_YEARS,
  MORATORIUM_MONTHS,
  REPAYMENT_FREQUENCIES,
} from "../../data/projectFinanceData";
import { ProjectFinanceDatePicker } from "../ProjectFinanceDatePicker/ProjectFinanceDatePicker";
import { styles } from "./RepaymentDetailsCard.styles";

export interface RepaymentDetailsCardProps {
  data: RepaymentDetailsForm;
  onChange: (field: keyof RepaymentDetailsForm, value: any) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  calculatedEmi?: string;
}

export const RepaymentDetailsCard: React.FC<RepaymentDetailsCardProps> = ({
  data,
  onChange,
  isExpanded,
  onToggleExpand,
  calculatedEmi,
}) => {
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    field: keyof RepaymentDetailsForm | null;
  }>({
    visible: false,
    title: "",
    options: [],
    field: null,
  });

  const openPicker = (
    title: string,
    options: string[],
    field: keyof RepaymentDetailsForm
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
            <Ionicons name="calendar-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>2. Repayment Details</Text>
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
          {/* Repayment Period */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Repayment Period (Years) <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker("Select Repayment Period", REPAYMENT_YEARS, "repaymentPeriodYears")
              }
            >
              <Text
                style={
                  data.repaymentPeriodYears ? styles.pickerText : styles.placeholderText
                }
              >
                {data.repaymentPeriodYears || "Select years"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Moratorium Period */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Moratorium Period (Months)</Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker("Select Moratorium Period", MORATORIUM_MONTHS, "moratoriumPeriodMonths")
              }
            >
              <Text
                style={
                  data.moratoriumPeriodMonths
                    ? styles.pickerText
                    : styles.placeholderText
                }
              >
                {data.moratoriumPeriodMonths || "Select months"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Repayment Frequency */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Repayment Frequency <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker(
                  "Select Frequency",
                  REPAYMENT_FREQUENCIES,
                  "repaymentFrequency"
                )
              }
            >
              <Text
                style={
                  data.repaymentFrequency
                    ? styles.pickerText
                    : styles.placeholderText
                }
              >
                {data.repaymentFrequency || "Select frequency"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Expected Interest Rate */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Expected Interest Rate (%) <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={styles.suffixInputContainer}>
              <TextInput
                style={styles.suffixInput}
                placeholder="Enter interest rate"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={data.expectedInterestRate}
                onChangeText={(text) => onChange("expectedInterestRate", text)}
              />
              <Text style={styles.suffixText}>%</Text>
            </View>
          </View>

          {/* Repayment Start Date */}
          <ProjectFinanceDatePicker
            label="Repayment Start Date"
            required
            value={data.repaymentStartDate}
            onChange={(dateStr) => onChange("repaymentStartDate", dateStr)}
          />

          {/* Preferred EMI */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Preferred EMI / Instalment (₹) (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder={calculatedEmi ? `e.g. ₹${calculatedEmi} (Calculated)` : "Enter amount"}
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.preferredEmi}
              onChangeText={(text) => onChange("preferredEmi", text)}
            />
            <Text style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
              Optional. If left blank, the auto-calculated EMI will be applied.
            </Text>
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

export default RepaymentDetailsCard;
