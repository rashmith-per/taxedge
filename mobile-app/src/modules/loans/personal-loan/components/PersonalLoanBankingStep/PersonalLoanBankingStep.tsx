import React from "react";
import { View, Text, TextInput, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LoanBankingFormData } from "../../../types/loans.types";
import { useIfscLookup } from "../../../hooks/useIfscLookup";
import { ifscService } from "@/shared/services/lookup/ifscService";
import { BrandColors } from "../../../../../shared/theme";
import { styles } from "./PersonalLoanBankingStep.styles";

export interface PersonalLoanBankingStepProps {
  data: LoanBankingFormData;
  onChange: (field: keyof LoanBankingFormData, value: LoanBankingFormData[keyof LoanBankingFormData]) => void;
  errors?: Record<string, string>;
}

export const PersonalLoanBankingStep: React.FC<PersonalLoanBankingStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const ifsc = useIfscLookup({
    trigger: "validFormat",
    errorMessage: "Unable to fetch bank details. Please verify the IFSC code.",
    onResolved: (details) => {
      onChange("primaryBankName", details.bank);
      onChange("branchName", details.branch);
      onChange("isIfscVerified", true);
    },
  });

  const handleIfscChange = (text: string) => {
    const cleaned = ifsc.handleIfscChange(text);
    onChange("ifscCode", cleaned);

    // Clear old bank data when IFSC changes
    if (data.primaryBankName && !ifscService.isValidFormat(cleaned)) {
      onChange("primaryBankName", "");
      onChange("branchName", "");
      onChange("isIfscVerified", false);
    }
  };

  const displayIfscError = errors.ifscCode || ifsc.error;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Banking Details</Text>
      <Text style={styles.sectionSubtitle}>
        Provide the account where the approved loan should be disbursed.
      </Text>

      {/* Primary Operating Bank */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Ionicons name="card" size={16} color={BrandColors.PRIMARY_ORANGE || "#FF7A00"} />
            </View>
            <Text style={styles.cardTitle}>Disbursement Bank Account</Text>
          </View>
        </View>

        {/* IFSC Code */}
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
          <Text style={styles.helperText}>11-digit alphanumeric bank IFSC code</Text>

          {ifsc.isLoading && (
            <View style={styles.ifscLoadingRow}>
              <ActivityIndicator size="small" color="#F97316" />
              <Text style={styles.helperText}>Verifying IFSC with RBI directory...</Text>
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

        {/* Primary Bank Name (Automatically populated) */}
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

        {/* Account Number */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Bank Account Number <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.accountNumber && styles.inputError]}
            placeholder="e.g. 50100234567890"
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
    </View>
  );
};

export default PersonalLoanBankingStep;
