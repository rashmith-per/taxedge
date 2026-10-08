import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { ifscService } from "@/shared/services/lookup/ifscService";
import type { LoanBankingFormData } from "../../../types/loans.types";
import { useIfscLookup } from "../../../hooks/useIfscLookup";
import { styles } from "./LoanBankingStep.styles";

/** Product-specific copy and appearance for the banking step. */
export interface LoanBankingStepConfig {
  primaryAccountTitle: string;
  primaryAccountDescription: string;
  existingLoansDescription: string;
  styleOverrides?: {
    helperText?: TextStyle;
    statusChip?: ViewStyle;
  };
}

export interface LoanBankingStepProps {
  config: LoanBankingStepConfig;
  data: LoanBankingFormData;
  onChange: (field: keyof LoanBankingFormData, value: string) => void;
  errors?: Record<string, string>;
  hasExistingLoans?: boolean;
}

const ITR_STATUS_OPTIONS: ("Filed" | "Not Filed" | "Exempt")[] = [
  "Filed",
  "Not Filed",
  "Exempt",
];

export const LoanBankingStep: React.FC<LoanBankingStepProps> = ({
  config,
  data,
  onChange,
  errors = {},
  hasExistingLoans = false,
}) => {
  const helperTextStyle = [styles.helperText, config.styleOverrides?.helperText];
  const statusChipStyle = [styles.statusChip, config.styleOverrides?.statusChip];

  const ifsc = useIfscLookup({
    trigger: "validFormat",
    errorMessage: "Unable to fetch bank details. Please verify the IFSC code.",
    onResolved: (details) => {
      onChange("primaryBankName", details.bank);
      if (details.branch) {
        onChange("branchName", details.branch);
      }
    },
  });

  const handleIfscChange = (text: string) => {
    const cleaned = ifsc.handleIfscChange(text);
    onChange("ifscCode", cleaned);

    if (data.primaryBankName && !ifscService.isValidFormat(cleaned)) {
      onChange("primaryBankName", "");
      onChange("branchName", "");
    }
  };

  const displayIfscError = errors.ifscCode || ifsc.error;

  return (
    <View style={styles.container}>
      {/* 1. Primary Operating Bank Account */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons
              name="wallet-outline"
              size={20}
              color={BrandColors.PRIMARY_ORANGE || "#EA580C"}
            />
            <Text style={styles.cardTitle}>{config.primaryAccountTitle}</Text>
          </View>
        </View>
        <Text style={styles.cardDescription}>{config.primaryAccountDescription}</Text>

        {/* Bank IFSC Code */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Bank IFSC Code <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, displayIfscError && styles.inputError]}
            placeholder="e.g. SBIN0001234"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
            maxLength={11}
            value={data.ifscCode}
            onChangeText={handleIfscChange}
          />
          <Text style={helperTextStyle}>11-digit alphanumeric bank IFSC code</Text>

          {ifsc.isLoading && (
            <View style={styles.ifscLoadingRow}>
              <ActivityIndicator size="small" color="#F97316" />
              <Text style={helperTextStyle}>Verifying IFSC with RBI directory...</Text>
            </View>
          )}

          {data.branchName && (
            <View style={styles.ifscSuccessBox}>
              <Text style={styles.ifscSuccessText}>
                Branch: {data.branchName}
              </Text>
            </View>
          )}

          {displayIfscError && (
            <Text style={styles.errorText}>{displayIfscError}</Text>
          )}
        </View>

        {/* Bank Name (Auto-populated) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Bank Name <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.primaryBankName && styles.inputError]}
            placeholder="Automatically populated from IFSC"
            placeholderTextColor="#94A3B8"
            value={data.primaryBankName}
            onChangeText={(text) => onChange("primaryBankName", text)}
          />
          {errors.primaryBankName && (
            <Text style={styles.errorText}>{errors.primaryBankName}</Text>
          )}
        </View>

        {/* Bank Account Number */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Bank Account Number <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.accountNumber && styles.inputError]}
            placeholder="Enter bank account number"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            value={data.accountNumber}
            onChangeText={(text) => onChange("accountNumber", text.replace(/[^0-9]/g, ""))}
          />
          {errors.accountNumber && (
            <Text style={styles.errorText}>{errors.accountNumber}</Text>
          )}
        </View>
      </View>

      {/* 2. Existing Loan Obligations */}
      {hasExistingLoans && (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons
                name="card-outline"
                size={20}
                color={BrandColors.PRIMARY_ORANGE || "#EA580C"}
              />
              <Text style={styles.cardTitle}>Existing Loan Details</Text>
            </View>
          </View>
          <Text style={styles.cardDescription}>{config.existingLoansDescription}</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Current Financing Bank / NBFC</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter current lender / bank name"
              placeholderTextColor="#94A3B8"
              value={data.existingLenderName || ""}
              onChangeText={(text) => onChange("existingLenderName", text)}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Approximate Total Outstanding (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter approximate outstanding balance (₹)"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.existingLoanOutstanding || ""}
              onChangeText={(text) => onChange("existingLoanOutstanding", text.replace(/[^0-9]/g, ""))}
            />
          </View>
        </View>
      )}

      {/* 3. ITR Details */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons
              name="document-text-outline"
              size={20}
              color={BrandColors.PRIMARY_ORANGE || "#EA580C"}
            />
            <Text style={styles.cardTitle}>Income Tax Return (ITR) Compliance</Text>
          </View>
        </View>
        <Text style={styles.cardDescription}>
          Select your recent assessment year income tax filing status and declared income.
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Last Assessment Year Filing Status <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={styles.statusRow}>
            {ITR_STATUS_OPTIONS.map((status) => {
              const isSelected = Boolean(data.itrFilingStatus) && data.itrFilingStatus === status;
              return (
                <TouchableOpacity
                  key={status}
                  activeOpacity={0.7}
                  onPress={() => onChange("itrFilingStatus", status)}
                  style={[statusChipStyle, isSelected && styles.statusChipActive]}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      isSelected && styles.statusChipTextActive,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.itrFilingStatus && (
            <Text style={styles.errorText}>{errors.itrFilingStatus}</Text>
          )}
        </View>

        {data.itrFilingStatus === "Filed" && (
          <>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                ITR Acknowledgement Number (15 Digits){" "}
                <Text style={styles.optionalTag}>(Optional)</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  errors.itrAckNumber && styles.inputError,
                ]}
                placeholder="Enter 15-digit ITR acknowledgement number"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={15}
                value={data.itrAckNumber || ""}
                onChangeText={(text) => onChange("itrAckNumber", text.replace(/[^0-9]/g, ""))}
              />
              {errors.itrAckNumber && (
                <Text style={styles.errorText}>{errors.itrAckNumber}</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Gross Total Annual Income as per ITR (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter gross total annual income (₹)"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={data.grossTotalIncome || ""}
                onChangeText={(text) => onChange("grossTotalIncome", text.replace(/[^0-9]/g, ""))}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default LoanBankingStep;
