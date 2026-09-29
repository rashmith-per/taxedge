import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MeansOfFinanceForm } from "../../types/projectFinance.types";
import { styles } from "./MeansOfFinanceCard.styles";

interface MeansOfFinanceCardProps {
  data: MeansOfFinanceForm;
  onChange: (field: keyof MeansOfFinanceForm, value: any) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const MeansOfFinanceCard: React.FC<MeansOfFinanceCardProps> = ({
  data,
  onChange,
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
            <Ionicons name="pie-chart-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>2. Means of Finance (Funding Structure)</Text>
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
          {/* Promoters Equity */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Promoters Equity Contribution (₹) <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 27750000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.promotersEquity}
              onChangeText={(text) => onChange("promotersEquity", text)}
            />
          </View>

          {/* Debt / Term Loan Requested */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Debt / Term Loan Requested (₹) <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 64750000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.termLoanRequested}
              onChangeText={(text) => onChange("termLoanRequested", text)}
            />
          </View>

          {/* Subordinated Debt */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Subordinated Debt / Unsecured Loans (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 0"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.subordinatedDebt}
              onChangeText={(text) => onChange("subordinatedDebt", text)}
            />
          </View>

          {/* Govt Grant / Subsidy */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Govt Subsidy / Capital Grant (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 0"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.govtGrantSubsidy}
              onChangeText={(text) => onChange("govtGrantSubsidy", text)}
            />
          </View>

          {/* Debt to Equity Ratio */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Proposed Debt to Equity Ratio <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 70:30"
              placeholderTextColor="#94A3B8"
              value={data.debtEquityRatio}
              onChangeText={(text) => onChange("debtEquityRatio", text)}
            />
          </View>

          {/* Proposed Lenders / Consortium Banks */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Proposed Lenders / Lead Bank</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. State Bank of India / HDFC Bank"
              placeholderTextColor="#94A3B8"
              value={data.proposedLenders}
              onChangeText={(text) => onChange("proposedLenders", text)}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default MeansOfFinanceCard;
