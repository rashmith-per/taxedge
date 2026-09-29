import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LoanBankingFormData } from "../../../types/loans.types";
import { ifscService } from "../../../../gst/services/ifscService";
import { styles } from "./WorkingCapitalBankingStep.styles";

export interface WorkingCapitalBankingStepProps {
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

export const WorkingCapitalBankingStep: React.FC<WorkingCapitalBankingStepProps> = ({
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
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="card" size={26} color="#EA580C" style={styles.headerIcon} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.sectionTitle}>Operating Current Account & Taxation</Text>
          <Text style={styles.sectionSubtitle}>
            Provide primary cash credit / current account details and business ITR acknowledgements.
          </Text>
        </View>
      </View>

      {/* Primary Bank Name */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Current Account Bank Name <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.primaryBankName && styles.inputError]}
          placeholder="e.g. State Bank of India / ICICI Bank"
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
          placeholder="e.g. 000105001234"
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
          placeholder="e.g. SBIN0004567"
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
          <Text style={styles.helperText}>11-digit bank branch code</Text>
        )}
        {(errors.ifscCode || ifscError) && (
          <Text style={styles.errorText}>{errors.ifscCode || ifscError}</Text>
        )}
      </View>

      {/* Existing Credit Facilities */}
      {hasExistingLoans && (
        <View style={styles.subCard}>
          <Text style={styles.subCardTitle}>Existing Bank Sanctions / Facilities</Text>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Existing Banker / Consortium Lender</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Bank of Baroda / Canara Bank"
              placeholderTextColor="#94A3B8"
              value={data.existingLenderName || ""}
              onChangeText={(text) => onChange("existingLenderName", text)}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Total Sanctioned Limit Outstanding (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 1500000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.existingLoanOutstanding || ""}
              onChangeText={(text) => onChange("existingLoanOutstanding", text)}
            />
          </View>
        </View>
      )}

      {/* ITR Details Sub-card */}
      <View style={styles.itrBox}>
        <View style={styles.itrHeaderRow}>
          <Ionicons name="sparkles-outline" size={18} color="#EA580C" style={{ marginRight: 6 }} />
          <Text style={styles.itrBoxTitle}>Business Tax Audit & ITR Records</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.itrLabel}>ITR Filing Status for Last Assessment Year</Text>
          <View style={styles.statusRow}>
            {ITR_STATUS_OPTIONS.map((status) => {
              const isSelected = data.itrFilingStatus === status;
              return (
                <TouchableOpacity
                  key={status}
                  onPress={() => onChange("itrFilingStatus", status)}
                  style={[
                    styles.statusChip,
                    isSelected && styles.statusChipActive,
                  ]}
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
        </View>

        {data.itrFilingStatus === "Filed" && (
          <View style={{ marginBottom: 4 }}>
            <Text style={styles.label}>
              ITR Acknowledgement Number (15 Digits){" "}
              <Text style={styles.optionalTag}>(Optional)</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors.itrAckNumber && styles.inputError,
              ]}
              placeholder="e.g. 123456789012345"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={15}
              value={data.itrAckNumber || ""}
              onChangeText={(text) => onChange("itrAckNumber", text)}
            />
            {errors.itrAckNumber && (
              <Text style={styles.errorText}>{errors.itrAckNumber}</Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default WorkingCapitalBankingStep;
