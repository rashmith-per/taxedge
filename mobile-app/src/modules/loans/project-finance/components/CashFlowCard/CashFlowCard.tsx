import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FiveYearRow } from "../../types/step4Types";
import { styles } from "./CashFlowCard.styles";

export interface CashFlowCardProps {
  rows?: FiveYearRow[];
  data?: FiveYearRow[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const CashFlowCard: React.FC<CashFlowCardProps> = ({
  rows,
  data,
  isExpanded: externalExpanded,
  onToggleExpand: externalToggle,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const isExpanded = externalExpanded !== undefined ? externalExpanded : internalExpanded;
  const onToggleExpand = externalToggle || (() => setInternalExpanded((p) => !p));
  const list = rows || data || [];

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onToggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name="wallet-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>7. Cash Flow</Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#64748B"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.cardBody}>
          <Text style={styles.subtitle}>
            Projected cash flow for next 5 years (auto-calculated).
          </Text>

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

              {list.map((row, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={styles.tdParticulars}>{row.particulars}</Text>
                  <Text style={styles.tdYearVal}>{row.year1}</Text>
                  <Text style={styles.tdYearVal}>{row.year2}</Text>
                  <Text style={styles.tdYearVal}>{row.year3}</Text>
                  <Text style={styles.tdYearVal}>{row.year4}</Text>
                  <Text style={styles.tdYearVal}>{row.year5}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default CashFlowCard;
