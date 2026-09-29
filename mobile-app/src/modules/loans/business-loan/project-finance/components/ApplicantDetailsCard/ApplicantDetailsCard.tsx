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
import { ApplicantDetailsForm } from "../../types/projectFinance.types";
import {
  ENTITY_TYPES,
  BANKING_RELATIONSHIPS,
  BUSINESS_ACTIVITIES,
} from "../../data/projectFinanceData";
import { ProjectFinanceDatePicker } from "../ProjectFinanceDatePicker/ProjectFinanceDatePicker";
import { styles } from "./ApplicantDetailsCard.styles";

interface ApplicantDetailsCardProps {
  data: ApplicantDetailsForm;
  onChange: (field: keyof ApplicantDetailsForm, value: any) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const ApplicantDetailsCard: React.FC<ApplicantDetailsCardProps> = ({
  data,
  onChange,
  isExpanded,
  onToggleExpand,
}) => {
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    field: keyof ApplicantDetailsForm | null;
  }>({
    visible: false,
    title: "",
    options: [],
    field: null,
  });

  const openPicker = (
    title: string,
    options: string[],
    field: keyof ApplicantDetailsForm
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
      {/* Accordion Header */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onToggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name="person-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>Applicant / Borrower Details</Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#64748B"
        />
      </TouchableOpacity>

      {/* Card Content - Line by Line */}
      {isExpanded && (
        <View style={styles.cardBody}>
          {/* Applicant Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Applicant / Borrower Name <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter applicant name"
              placeholderTextColor="#94A3B8"
              value={data.applicantName}
              onChangeText={(text) => onChange("applicantName", text)}
            />
          </View>

          {/* Constitution / Entity Type */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Constitution / Entity Type <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker("Select Entity Type", ENTITY_TYPES, "constitutionType")
              }
            >
              <Text
                style={
                  data.constitutionType
                    ? styles.pickerText
                    : styles.placeholderText
                }
                numberOfLines={1}
              >
                {data.constitutionType || "Select entity type"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* PAN */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              PAN <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter PAN"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              maxLength={10}
              value={data.pan}
              onChangeText={(text) => onChange("pan", text.toUpperCase())}
            />
          </View>

          {/* CIN / LLPIN */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>CIN / LLPIN</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter CIN / LLPIN"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              value={data.cinLlpin}
              onChangeText={(text) => onChange("cinLlpin", text.toUpperCase())}
            />
          </View>

          {/* Date of Incorporation */}
          <ProjectFinanceDatePicker
            label="Date of Incorporation"
            required
            value={data.dateOfIncorporation}
            onChange={(dateStr) => onChange("dateOfIncorporation", dateStr)}
          />

          {/* Existing Customer? Radio */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Existing Customer? <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={styles.radioRow}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => onChange("isExistingCustomer", true)}
              >
                <View
                  style={[
                    styles.radioOuter,
                    data.isExistingCustomer && styles.radioOuterSelected,
                  ]}
                >
                  {data.isExistingCustomer && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => onChange("isExistingCustomer", false)}
              >
                <View
                  style={[
                    styles.radioOuter,
                    !data.isExistingCustomer && styles.radioOuterSelected,
                  ]}
                >
                  {!data.isExistingCustomer && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Banking Relationship */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Banking Relationship</Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker(
                  "Select Banking Relationship",
                  BANKING_RELATIONSHIPS,
                  "bankingRelationship"
                )
              }
            >
              <Text
                style={
                  data.bankingRelationship
                    ? styles.pickerText
                    : styles.placeholderText
                }
                numberOfLines={1}
              >
                {data.bankingRelationship || "Select relationship"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Primary Business Activity */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Primary Business Activity <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker(
                  "Select Primary Business Activity",
                  BUSINESS_ACTIVITIES,
                  "primaryBusinessActivity"
                )
              }
            >
              <Text
                style={
                  data.primaryBusinessActivity
                    ? styles.pickerText
                    : styles.placeholderText
                }
                numberOfLines={1}
              >
                {data.primaryBusinessActivity || "Select business activity"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Selector Modal */}
      <Modal
        visible={modalConfig.visible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setModalConfig({ visible: false, title: "", options: [], field: null })
        }
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(15, 23, 42, 0.5)", justifyContent: "flex-end" }}
          onPress={() => setModalConfig({ visible: false, title: "", options: [], field: null })}
        >
          <Pressable style={{ backgroundColor: "#FFFFFF", borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: "60%", padding: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 12 }}>
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

export default ApplicantDetailsCard;
