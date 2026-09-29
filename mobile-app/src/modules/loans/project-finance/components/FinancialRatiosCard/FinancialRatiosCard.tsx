import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FiveYearRow } from "../../types/step4Types";
import { styles } from "./FinancialRatiosCard.styles";

export interface FinancialRatiosCardProps {
  rows: FiveYearRow[];
}

export const FinancialRatiosCard: React.FC<FinancialRatiosCardProps> = ({ rows }) => {
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
            <MaterialCommunityIcons name="chart-pie" size={18} color="#FF6B00" />
          </View>
          <Text style={styles.cardTitle}>10. Financial Ratios</Text>
        </View>
        <MaterialCommunityIcons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#64748B"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.cardBody}>
          <Text style={styles.subtitle}>Key financial ratios (auto-calculated).</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScroll}>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.thParticulars}>Particulars</Text>
                <Text style={styles.thYear}>Year 1</Text>
                <Text style={styles.thYear}>Year 2</Text>
                <Text style={styles.thYear}>Year 3</Text>
                <Text style={styles.thYear}>Year 4</Text>
                <Text style={styles.thYear}>Year 5</Text>
              </View>
              {rows.map((row, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={styles.tdParticulars}>{row.particulars}</Text>
                  <Text style={styles.tdYearVal}>{row.year1 || "-"}</Text>
                  <Text style={styles.tdYearVal}>{row.year2 || "-"}</Text>
                  <Text style={styles.tdYearVal}>{row.year3 || "-"}</Text>
                  <Text style={styles.tdYearVal}>{row.year4 || "-"}</Text>
                  <Text style={styles.tdYearVal}>{row.year5 || "-"}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};
