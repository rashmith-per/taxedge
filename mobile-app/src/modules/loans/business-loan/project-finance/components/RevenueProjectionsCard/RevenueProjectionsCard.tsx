import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RevenueProjectionYear } from "../../types/projectFinance.types";
import { styles } from "./RevenueProjectionsCard.styles";

interface RevenueProjectionsCardProps {
  projections: RevenueProjectionYear[];
  onChangeProjection: (index: number, field: keyof RevenueProjectionYear, value: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const RevenueProjectionsCard: React.FC<RevenueProjectionsCardProps> = ({
  projections,
  onChangeProjection,
  isExpanded,
  onToggleExpand,
}) => {
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
          <Text style={styles.cardTitle}>4. Revenue Projections</Text>
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
            Provide your projected revenue for the next 5 years.
          </Text>

          {projections.map((item, index) => (
            <View key={item.year} style={styles.yearCard}>
              <Text style={styles.yearHeader}>{item.year}</Text>

              {/* Sales Volume */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Sales Volume</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter volume"
                  placeholderTextColor="#94A3B8"
                  value={item.salesVolume}
                  onChangeText={(text) => onChangeProjection(index, "salesVolume", text)}
                />
              </View>

              {/* Average Price */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Average Price (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter price"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={item.averagePrice}
                  onChangeText={(text) => onChangeProjection(index, "averagePrice", text)}
                />
              </View>

              {/* Projected Revenue */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Revenue (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Auto calculated"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={item.revenue}
                  onChangeText={(text) => onChangeProjection(index, "revenue", text)}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default RevenueProjectionsCard;
