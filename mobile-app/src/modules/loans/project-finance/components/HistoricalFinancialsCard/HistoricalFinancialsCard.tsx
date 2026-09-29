import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { HistoricalFinancialsForm } from "../../types/step4Types";
import { styles } from "./HistoricalFinancialsCard.styles";

export interface HistoricalFinancialsCardProps {
  data: HistoricalFinancialsForm;
  onChange: (field: keyof HistoricalFinancialsForm, year: "fy3" | "fy2" | "fy1", value: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const HistoricalFinancialsCard: React.FC<HistoricalFinancialsCardProps> = ({
  data,
  onChange,
  isExpanded: externalExpanded,
  onToggleExpand: externalToggle,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const isExpanded = externalExpanded !== undefined ? externalExpanded : internalExpanded;
  const onToggleExpand = externalToggle || (() => setInternalExpanded((p) => !p));
  const rows: { label: string; field: keyof HistoricalFinancialsForm }[] = [
    { label: "Revenue (₹)", field: "revenue" },
    { label: "EBITDA (₹)", field: "ebitda" },
    { label: "PAT (₹)", field: "pat" },
    { label: "Existing Debt (₹)", field: "existingDebt" },
  ];

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onToggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name="newspaper-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>5. Historical Financials</Text>
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
            Provide last 3 years financials (Applicable for existing / expansion projects).
          </Text>

          <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={18} color="#2563EB" />
            <Text style={styles.infoBannerText}>
              For Greenfield projects, this section is Not Applicable.
            </Text>
          </View>

          <View style={styles.tableContainer}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.thParticulars}>Particulars</Text>
              <Text style={styles.thYear}>FY-3</Text>
              <Text style={styles.thYear}>FY-2</Text>
              <Text style={styles.thYear}>FY-1</Text>
            </View>

            {rows.map((row) => (
              <View key={row.field} style={styles.tableRow}>
                <Text style={styles.tdParticulars}>{row.label}</Text>
                <View style={styles.tdInputCol}>
                  <TextInput
                    style={styles.tableInput}
                    placeholder="Enter"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={data[row.field].fy3}
                    onChangeText={(t) => onChange(row.field, "fy3", t)}
                  />
                </View>
                <View style={styles.tdInputCol}>
                  <TextInput
                    style={styles.tableInput}
                    placeholder="Enter"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={data[row.field].fy2}
                    onChangeText={(t) => onChange(row.field, "fy2", t)}
                  />
                </View>
                <View style={styles.tdInputCol}>
                  <TextInput
                    style={styles.tableInput}
                    placeholder="Enter"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={data[row.field].fy1}
                    onChangeText={(t) => onChange(row.field, "fy1", t)}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default HistoricalFinancialsCard;
