import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SensitivityScenarioRow } from "../../types/step4Types";
import { styles } from "./SensitivityAnalysisCard.styles";

export interface SensitivityAnalysisCardProps {
  scenarios: SensitivityScenarioRow[];
}

export const SensitivityAnalysisCard: React.FC<SensitivityAnalysisCardProps> = ({
  scenarios,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => setIsExpanded((prev) => !prev)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <MaterialCommunityIcons name="trending-up" size={18} color="#FF6B00" />
          </View>
          <Text style={styles.cardTitle}>11. Sensitivity Analysis</Text>
        </View>
        <MaterialCommunityIcons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#64748B"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.cardBody}>
          <Text style={styles.subtitle}>
            Analyse impact of key changes on project viability.
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScroll}>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.thScenario}>Scenario</Text>
                <Text style={styles.thVal}>DSCR</Text>
                <Text style={styles.thVal}>IRR (%)</Text>
                <Text style={styles.thVal}>Cash Flow (₹)</Text>
              </View>
              {scenarios.map((row, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={styles.tdScenario}>{row.scenario}</Text>
                  <Text style={styles.tdVal}>{row.dscr || "-"}</Text>
                  <Text style={styles.tdVal}>{row.irr || "-"}</Text>
                  <Text style={styles.tdVal}>{row.cashFlow || "-"}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.infoBanner}>
            <MaterialCommunityIcons name="information-outline" size={18} color="#2563EB" />
            <Text style={styles.infoText}>
              Sensitivity analysis is auto-calculated based on the projected financials.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default SensitivityAnalysisCard;
