import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "../../../../../../shared/theme";
import {
  LoanDetailsFormData,
  LoanBusinessFormData,
  LoanBankingFormData,
  LoanDocumentItem,
  CustomerProfileSummary,
} from "../../../../types/loans.types";
import { styles } from "./ProjectFinanceReviewStep.styles";

export interface ProjectFinanceReviewStepProps {
  loanDetails: LoanDetailsFormData;
  businessDetails: LoanBusinessFormData;
  bankingDetails: LoanBankingFormData;
  documents: LoanDocumentItem[];
  profile?: Partial<CustomerProfileSummary>;
  isConsentChecked: boolean;
  onConsentToggle: (checked: boolean) => void;
  onGoToStep: (stepIndex: number) => void;
}

export const ProjectFinanceReviewStep: React.FC<ProjectFinanceReviewStepProps> = ({
  loanDetails,
  businessDetails,
  bankingDetails,
  documents,
  profile,
  isConsentChecked,
  onConsentToggle,
  onGoToStep,
}) => {
  const formatCurrency = (val?: string | number) => {
    const num = Number(val);
    if (!val || isNaN(num)) return "₹0";
    return "₹" + num.toLocaleString("en-IN");
  };

  const maskAcc = (acc?: string) => {
    if (!acc || acc.length < 5) return acc || "—";
    return `XXXXXX${acc.slice(-4)}`;
  };

  const uploadedDocs = documents.filter((d) => Boolean(d.fileUri));

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Project Debt Dossier Review</Text>
      <Text style={styles.sectionSubtitle}>
        Double-check term debt requirement, project SPV structure, and DPR submissions.
      </Text>

      {/* Lead Sponsor Card */}
      <View style={styles.summaryCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Lead Sponsor Information</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
            <Text style={{ fontSize: 11, fontWeight: "600", color: "#16A34A" }}>
              Verified Profile
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Sponsor Name</Text>
          <Text style={styles.value}>{profile?.name || "Client Name"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Mobile</Text>
          <Text style={styles.value}>{profile?.mobile || "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>PAN</Text>
          <Text style={styles.value}>{profile?.pan || "—"}</Text>
        </View>
      </View>

      {/* Term Debt Terms Card */}
      <View style={styles.summaryCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Term Debt Requirement</Text>
          <TouchableOpacity
            style={styles.editAction}
            onPress={() => onGoToStep(0)}
          >
            <Ionicons
              name="create-outline"
              size={14}
              color={BrandColors.PRIMARY_BLUE}
            />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Requested Term Debt</Text>
          <Text style={styles.highlightValue}>
            {formatCurrency(loanDetails.requiredAmount)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Project Scope</Text>
          <Text style={styles.value}>{loanDetails.purpose || "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tenure</Text>
          <Text style={styles.value}>
            {loanDetails.preferredTenureMonths} Months ({Math.round(Number(loanDetails.preferredTenureMonths) / 12)} Years)
          </Text>
        </View>
      </View>

      {/* Implementing SPV Details */}
      <View style={styles.summaryCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Implementing Entity Profile</Text>
          <TouchableOpacity
            style={styles.editAction}
            onPress={() => onGoToStep(1)}
          >
            <Ionicons
              name="create-outline"
              size={14}
              color={BrandColors.PRIMARY_BLUE}
            />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>SPV / Entity Name</Text>
          <Text style={styles.value}>{businessDetails.businessName}</Text>
        </View>
        {businessDetails.gstin ? (
          <View style={styles.row}>
            <Text style={styles.label}>GSTIN</Text>
            <Text style={styles.value}>{businessDetails.gstin}</Text>
          </View>
        ) : null}
        {businessDetails.udyamRegistration ? (
          <View style={styles.row}>
            <Text style={styles.label}>CIN / Reg.</Text>
            <Text style={styles.value}>{businessDetails.udyamRegistration}</Text>
          </View>
        ) : null}
        <View style={styles.row}>
          <Text style={styles.label}>Group Vintage</Text>
          <Text style={styles.value}>{businessDetails.businessVintageYears} Years</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Group Turnover</Text>
          <Text style={styles.value}>{formatCurrency(businessDetails.annualTurnover)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Sponsor PAT</Text>
          <Text style={styles.value}>{formatCurrency(businessDetails.netProfit)}</Text>
        </View>
      </View>

      {/* Escrow / TRA Account */}
      <View style={styles.summaryCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Designated Escrow Account</Text>
          <TouchableOpacity
            style={styles.editAction}
            onPress={() => onGoToStep(2)}
          >
            <Ionicons
              name="create-outline"
              size={14}
              color={BrandColors.PRIMARY_BLUE}
            />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Bank</Text>
          <Text style={styles.value}>
            {bankingDetails.primaryBankName || "—"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>TRA Number</Text>
          <Text style={styles.value}>{maskAcc(bankingDetails.accountNumber)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>IFSC Code</Text>
          <Text style={styles.value}>{bankingDetails.ifscCode || "—"}</Text>
        </View>
      </View>

      {/* Uploaded DPR Records */}
      <View style={styles.summaryCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Uploaded Records & Feasibility</Text>
          <TouchableOpacity
            style={styles.editAction}
            onPress={() => onGoToStep(3)}
          >
            <Ionicons
              name="create-outline"
              size={14}
              color={BrandColors.PRIMARY_BLUE}
            />
            <Text style={styles.editText}>Manage</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.docsGrid}>
          {uploadedDocs.map((doc) => (
            <View key={doc.id} style={styles.docBadge}>
              <Ionicons name="document-text" size={12} color="#15803D" />
              <Text style={styles.docBadgeText}>{doc.name}</Text>
            </View>
          ))}
          {uploadedDocs.length === 0 && (
            <Text style={[styles.label, { fontStyle: "italic" }]}>
              No documents uploaded yet.
            </Text>
          )}
        </View>
      </View>

      {/* Consent Declaration */}
      <TouchableOpacity
        style={styles.consentContainer}
        activeOpacity={0.8}
        onPress={() => onConsentToggle(!isConsentChecked)}
      >
        <View
          style={[styles.checkbox, isConsentChecked && styles.checkboxActive]}
        >
          {isConsentChecked && (
            <Ionicons
              name="checkmark"
              size={14}
              color={BrandColors.WHITE}
            />
          )}
        </View>
        <Text style={styles.consentText}>
          I authorize TaxEdge and its project finance advisory team to syndicate this DPR
          and financial appraisal with financial institutions and consortium banks.
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProjectFinanceReviewStep;
