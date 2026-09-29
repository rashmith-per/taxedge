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
import { RegisteredAddressForm } from "../../types/projectFinance.types";
import { INDIAN_STATES, CITIES_BY_STATE } from "../../data/projectFinanceData";
import { styles } from "./RegisteredAddressCard.styles";

interface RegisteredAddressCardProps {
  data: RegisteredAddressForm;
  onChange: (field: keyof RegisteredAddressForm, value: any) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const RegisteredAddressCard: React.FC<RegisteredAddressCardProps> = ({
  data,
  onChange,
  isExpanded,
  onToggleExpand,
}) => {
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    field: keyof RegisteredAddressForm | null;
  }>({
    visible: false,
    title: "",
    options: [],
    field: null,
  });

  const openPicker = (
    title: string,
    options: string[],
    field: keyof RegisteredAddressForm
  ) => {
    setModalConfig({ visible: true, title, options, field });
  };

  const handleSelectOption = (value: string) => {
    if (modalConfig.field) {
      onChange(modalConfig.field, value);
      if (modalConfig.field === "state") {
        onChange("districtCity", "");
      }
    }
    setModalConfig({ visible: false, title: "", options: [], field: null });
  };

  const cityOptions = data.state
    ? CITIES_BY_STATE[data.state] || ["City Center", "Industrial Area", "Main City"]
    : ["Select State First"];

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
            <Ionicons name="location-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>Registered Office Address</Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#64748B"
        />
      </TouchableOpacity>

      {/* Card Body - Line by Line */}
      {isExpanded && (
        <View style={styles.cardBody}>
          {/* Address Line 1 */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Address Line 1 <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter address"
              placeholderTextColor="#94A3B8"
              value={data.addressLine1}
              onChangeText={(text) => onChange("addressLine1", text)}
            />
          </View>

          {/* Address Line 2 */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Address Line 2</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter address (optional)"
              placeholderTextColor="#94A3B8"
              value={data.addressLine2}
              onChangeText={(text) => onChange("addressLine2", text)}
            />
          </View>

          {/* State */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              State <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() => openPicker("Select State", INDIAN_STATES, "state")}
            >
              <Text
                style={data.state ? styles.pickerText : styles.placeholderText}
                numberOfLines={1}
              >
                {data.state || "Select state"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* District / City */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              District / City <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker("Select District / City", cityOptions, "districtCity")
              }
            >
              <Text
                style={
                  data.districtCity ? styles.pickerText : styles.placeholderText
                }
                numberOfLines={1}
              >
                {data.districtCity || "Select district / city"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* PIN Code */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              PIN Code <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter PIN code"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              maxLength={6}
              value={data.pinCode}
              onChangeText={(text) => onChange("pinCode", text)}
            />
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

export default RegisteredAddressCard;
