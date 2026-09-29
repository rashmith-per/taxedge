import React, { useState } from "react";
import { View, Text, TextInput, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LoanBankingFormData } from "../../../types/loans.types";
import { ifscService } from "../../../../gst/services/ifscService";
import { styles } from "./MachineryLoanBankingStep.styles";

export interface MachineryLoanBankingStepProps {
  data: LoanBankingFormData;
  onChange: (field: keyof LoanBankingFormData, value: string) => void;
  errors?: Record<string, string>;
  hasExistingLoans?: boolean;
}

export const MachineryLoanBankingStep: React.FC<MachineryLoanBankingStepProps> = ({
  data,
  onChange,
  errors = {},
  hasExistingLoans = false,
}) => {
  const [isIfscLoading, setIsIfscLoading] = useState(false);
  const [ifscError, setIfscError] = useState<string | null>(null);
  const [branchName, setBranchName] = useState<string>("");

  const handleIfscChange = async (text: string) => {
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, "");
    onChange("ifscCode", cleaned);

    if (cleaned.length === 11) {
      setIsIfscLoading(true);
      setIfscError(null);
      try {
        const details = await ifscService.lookup(cleaned);
        onChange("primaryBankName", details.bank);
        setBranchName(details.branch);
      } catch (err: any) {
        setIfscError(err?.message || "Invalid IFSC Code");
      } finally {
        setIsIfscLoading(false);
      }
    } else {
      setIfscError(null);
      if (branchName) setBranchName("");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Banking Information</Text>
      <Text style={styles.sectionSubtitle}>
        Provide primary business current account details for machinery loan disbursement.
      </Text>

      {/* Primary Bank Name */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Bank Name <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.primaryBankName && styles.inputError]}
          placeholder="e.g. Bank of India / ICICI Bank"
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
          Current Account Number <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.accountNumber && styles.inputError]}
          placeholder="e.g. 10023456789012"
          placeholderTextColor="#94A3B8"
          keyboardType="number-pad"
          value={data.accountNumber}
          onChangeText={(text) => onChange("accountNumber", text)}
        />
        {errors.accountNumber && (
          <Text style={styles.errorText}>{errors.accountNumber}</Text>
        )}
      </View>

      {/* IFSC Code */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Bank IFSC Code <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, (errors.ifscCode || ifscError) && styles.inputError]}
          placeholder="e.g. BKID0001234"
          placeholderTextColor="#94A3B8"
          autoCapitalize="characters"
          maxLength={11}
          value={data.ifscCode}
          onChangeText={handleIfscChange}
        />
        {isIfscLoading && (
          <View style={styles.ifscInfoRow}>
            <ActivityIndicator size="small" color="#EA580C" />
            <Text style={styles.ifscLoadingText}>Verifying IFSC with RBI directory...</Text>
          </View>
        )}
        {!isIfscLoading && branchName ? (
          <View style={styles.ifscInfoRow}>
            <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
            <Text style={styles.ifscSuccessText}>Branch: {branchName}</Text>
          </View>
        ) : null}
        {!isIfscLoading && !branchName && (
          <Text style={styles.helperText}>11-digit bank branch IFSC</Text>
        )}
        {(errors.ifscCode || ifscError) && (
          <Text style={styles.errorText}>{errors.ifscCode || ifscError}</Text>
        )}
      </View>

      {/* Existing Equipment Loans */}
      {hasExistingLoans && (
        <View style={styles.subCard}>
          <Text style={styles.subCardTitle}>Existing Equipment / Term Loans</Text>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Current Financing Institution</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Tata Capital / SIDBI"
              placeholderTextColor="#94A3B8"
              value={data.existingLenderName || ""}
              onChangeText={(text) => onChange("existingLenderName", text)}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Approximate Total Outstanding (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 800000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.existingLoanOutstanding || ""}
              onChangeText={(text) => onChange("existingLoanOutstanding", text)}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default MachineryLoanBankingStep;
