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
import { MarketDetailsForm } from "../../types/projectFinance.types";
import {
  TARGET_MARKETS,
  MARKET_TYPES,
  TARGET_GEOGRAPHIES,
  CUSTOMER_SEGMENTS,
} from "../../data/projectFinanceData";
import { styles } from "./MarketDetailsCard.styles";

interface MarketDetailsCardProps {
  data: MarketDetailsForm;
  onChange: (field: keyof MarketDetailsForm, value: any) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const MarketDetailsCard: React.FC<MarketDetailsCardProps> = ({
  data,
  onChange,
  isExpanded,
  onToggleExpand,
}) => {
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    field: keyof MarketDetailsForm | null;
  }>({
    visible: false,
    title: "",
    options: [],
    field: null,
  });

  const openPicker = (
    title: string,
    options: string[],
    field: keyof MarketDetailsForm
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
            <Ionicons name="stats-chart-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>2. Market Details</Text>
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
            Tell us about your target market and competition.
          </Text>

          {/* Target Market */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Target Market <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker("Select Target Market", TARGET_MARKETS, "targetMarket")
              }
            >
              <Text
                style={
                  data.targetMarket ? styles.pickerText : styles.placeholderText
                }
              >
                {data.targetMarket || "Select option"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Market Type */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Market Type <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker("Select Market Type", MARKET_TYPES, "marketType")
              }
            >
              <Text
                style={
                  data.marketType ? styles.pickerText : styles.placeholderText
                }
              >
                {data.marketType || "Select type"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Target Geography */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Target Geography <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker(
                  "Select Target Geography",
                  TARGET_GEOGRAPHIES,
                  "targetGeography"
                )
              }
            >
              <Text
                style={
                  data.targetGeography ? styles.pickerText : styles.placeholderText
                }
              >
                {data.targetGeography || "Select geography"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Customer Segment */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Customer Segment <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                openPicker(
                  "Select Customer Segment",
                  CUSTOMER_SEGMENTS,
                  "customerSegment"
                )
              }
            >
              <Text
                style={
                  data.customerSegment ? styles.pickerText : styles.placeholderText
                }
              >
                {data.customerSegment || "Select segment"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Expected Market Share */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Expected Market Share (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter percentage"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.expectedMarketShare}
              onChangeText={(text) => onChange("expectedMarketShare", text)}
            />
          </View>

          {/* Major Competitors */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Major Competitors</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter competitors"
              placeholderTextColor="#94A3B8"
              value={data.majorCompetitors}
              onChangeText={(text) => onChange("majorCompetitors", text)}
            />
          </View>

          {/* Competitive Advantage */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Competitive Advantage</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter competitive advantage"
              placeholderTextColor="#94A3B8"
              value={data.competitiveAdvantage}
              onChangeText={(text) => onChange("competitiveAdvantage", text)}
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

export default MarketDetailsCard;
