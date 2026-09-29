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
import { LoanRequirementForm } from "../../types/projectFinance.types";
import {
  LOAN_TYPES,
  SCHEME_PRODUCTS,
  PREFERRED_LENDERS,
} from "../../data/projectFinanceData";
import { ProjectFinanceDatePicker } from "../ProjectFinanceDatePicker/ProjectFinanceDatePicker";
import { styles } from "./LoanRequirementCard.styles";

interface LoanRequirementCardProps {
  data: LoanRequirementForm;
  onChange: (field: keyof LoanRequirementForm, value: any) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const LoanRequirementCard: React.FC<LoanRequirementCardProps> = ({
  data,
  onChange,
  isExpanded,
  onToggleExpand,
}) => {
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    field: keyof LoanRequirementForm | null;
  }>({
    visible: false,
    title: "",
    options: [],
    field: null,
  });

  const openPicker = (
    title: string,
    options: string[],
    field: keyof LoanRequirementForm
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
            <Ionicons name="layers-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>1. Loan Requirement</Text>
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
          {/* Total Project Cost */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Total Project Cost (₹)</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={data.totalProjectCost || ""}
              placeholder="Awaiting Screen 3 input"
              placeholderTextColor="#94A3B8"
              editable={false}
            />
            {!!data.totalProjectCost && (
              <Text style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
                Auto-filled from Screen 3 (Total Project Cost)
              </Text>
            )}
          </View>

          {/* Own Contribution */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Own Contribution (₹)</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={data.ownContribution || ""}
              placeholder="Awaiting Screen 3 input"
              placeholderTextColor="#94A3B8"
              editable={false}
            />
            {!!data.ownContribution && (
              <Text style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
                Auto-filled from Screen 3 (Promoters Equity)
              </Text>
            )}
          </View>

          {/* Loan Required */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Loan Required (₹) <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.loanRequired || ""}
              onChangeText={(text) => onChange("loanRequired", text)}
            />
          </View>

          {/* Type of Loan */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Type of Loan <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() => openPicker("Select Loan Type", LOAN_TYPES, "typeOfLoan")}
            >
              <Text
                style={
                  data.typeOfLoan ? styles.pickerText : styles.placeholderText
                }
              >
                {data.typeOfLoan || "Select loan type"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Scheme / Product */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Scheme / Product <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker("Select Scheme / Product", SCHEME_PRODUCTS, "schemeProduct")
              }
            >
              <Text
                style={
                  data.schemeProduct ? styles.pickerText : styles.placeholderText
                }
              >
                {data.schemeProduct || "Select scheme"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Preferred Lender (Optional) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Preferred Lender (Optional)</Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker("Select Preferred Lender", PREFERRED_LENDERS, "preferredLender")
              }
            >
              <Text
                style={
                  data.preferredLender ? styles.pickerText : styles.placeholderText
                }
              >
                {data.preferredLender || "Select lender"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Proposed Disbursement Date */}
          <ProjectFinanceDatePicker
            label="Proposed Disbursement Date"
            required
            value={data.proposedDisbursementDate}
            onChange={(dateStr) => onChange("proposedDisbursementDate", dateStr)}
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

export default LoanRequirementCard;
