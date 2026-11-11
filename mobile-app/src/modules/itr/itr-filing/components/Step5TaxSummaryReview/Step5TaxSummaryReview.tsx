import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import {
  ItrFilingFormData,
  MissingInfoItem,
} from "../../types/itrFiling.types";
import { MissingInfoBanner } from "../../../components/MissingInfoBanner";
import { styles } from "./Step5TaxSummaryReview.styles";

interface Step5TaxSummaryReviewProps {
  formData: ItrFilingFormData;
  isSubmitting: boolean;
  onEditStep: (stepIndex: number, section?: string) => void;
  onToggleDeclaration: (accepted: boolean) => void;
  onSubmit: () => void;
}

export const Step5TaxSummaryReview: React.FC<Step5TaxSummaryReviewProps> = ({
  formData,
  isSubmitting,
  onEditStep,
  onToggleDeclaration,
  onSubmit,
}) => {
  const {
    personalInfo,
    bankDetails,
    incomeSources,
    determinedForm,
    documents,
    declarationAccepted,
  } = formData;

  const verifiedOrUploadedDocs = documents.filter(
    (d) => (d.fileUri || d.isProfileVerified) && d.tier !== "NOT_REQUIRED"
  );

  const missingItems: MissingInfoItem[] = [];

  const missingRequiredDocs = documents.filter(
    (d) => d.tier === "REQUIRED" && d.required && !d.fileUri && !d.isProfileVerified
  );
  if (missingRequiredDocs.length > 0) {
    missingItems.push({
      id: "miss-doc",
      severity: "REQUIRED",
      title: `${missingRequiredDocs.length} required documents missing`,
      actionLabel: "Upload",
      targetStep: 2,
    });
  }

  const handleSubmitPress = () => {
    if (missingRequiredDocs.length > 0) {
      const missingNames = missingRequiredDocs.map((d) => `• ${d.name}`).join("\n");
      Alert.alert(
        "Required Documents Missing",
        `Please upload the following required documents before submitting:\n\n${missingNames}`
      );
      return;
    }
    if (!declarationAccepted) {
      Alert.alert(
        "Declaration Required",
        "Please accept the declaration below before submitting your application for CA review."
      );
      return;
    }
    onSubmit();
  };

  const maskedBankNumber = bankDetails.accountNumber
    ? `•••• ${bankDetails.accountNumber.slice(-4)}`
    : "";

  interface IncomeSummaryItem {
    id: string;
    title: string;
    sub: string;
    amount?: string;
    tagText: string;
    tagType: "verified" | "warning" | "imported";
    visible: boolean;
    /** Every value the user entered for this source, shown under the summary row. */
    details: { label: string; value: string }[];
  }

  const money = (v?: string) => {
    const raw = (v ?? "").toString().trim();
    if (!raw) return "";
    const n = Number(raw.replace(/,/g, ""));
    return Number.isNaN(n) ? raw : `₹ ${n.toLocaleString("en-IN")}`;
  };
  const text = (v?: string | number) => (v === undefined || v === null ? "" : String(v).trim());
  /** Keeps only the fields the user actually filled in. */
  const entered = (rows: [string, string][]) =>
    rows.filter(([, value]) => value !== "").map(([label, value]) => ({ label, value }));
  const yes = (flag?: boolean) => (flag ? "Yes" : "");
  const businessTypeLabel: Record<string, string> = {
    presumptive_44ad: "Presumptive - Sec 44AD",
    presumptive_44ada: "Presumptive - Sec 44ADA",
    regular_books: "Regular Books of Accounts",
    not_sure: "Not sure",
  };

  const salaryDetails = entered([
    ["Employer Name", text(incomeSources.salary.employerName)],
    ["Gross Salary", money(incomeSources.salary.grossSalary)],
    ["Allowances", money(incomeSources.salary.allowances)],
    ["TDS Deducted", money(incomeSources.salary.tdsDeducted)],
  ]);
  const housePropertyDetails = entered([
    ["Property Type", incomeSources.houseProperty.propertyType === "let_out" ? "Let-Out Property" : "Self-Occupied"],
    ["Annual Rent Received", money(incomeSources.houseProperty.annualRentReceived)],
    ["Municipal Taxes Paid", money(incomeSources.houseProperty.municipalTaxesPaid)],
    ["Home Loan Interest", money(incomeSources.houseProperty.homeLoanInterest)],
  ]);
  const businessDetails = entered([
    ["Business Type", businessTypeLabel[incomeSources.business.businessType] ?? ""],
    ["Business Name", text(incomeSources.business.businessName)],
    ["GSTIN", text(incomeSources.business.gstin)],
    ["Business Activity", text(incomeSources.business.businessActivity)],
    ["Gross Turnover", money(incomeSources.business.grossTurnover)],
    ["Declared Profit", money(incomeSources.business.declaredProfit)],
    ["GSTR-1 Turnover", money(incomeSources.business.gstr1Turnover)],
    ["GSTR-3B Turnover", money(incomeSources.business.gstr3bTurnover)],
  ]);
  const capitalGainsDetails = entered([
    ["Equity / Mutual Funds", yes(incomeSources.capitalGains.hasEquityMf)],
    ["F&O / Intraday", yes(incomeSources.capitalGains.hasFnoIntraday)],
    ["Property / Other Assets", yes(incomeSources.capitalGains.hasPropertyAssets)],
    ["Crypto / VDA", yes(incomeSources.capitalGains.hasCryptoVda)],
    ["Short-Term Gains", money(incomeSources.capitalGains.shortTermGains)],
    ["Long-Term Gains", money(incomeSources.capitalGains.longTermGains)],
    ["Broker", text(incomeSources.capitalGains.brokerName)],
    ["Total Transactions", text(incomeSources.capitalGains.totalTransactions)],
  ]);
  const otherSourcesDetails = entered([
    ["Savings Interest", money(incomeSources.otherSources.savingsInterest)],
    ["FD Interest", money(incomeSources.otherSources.fdInterest)],
    ["Dividend Income", money(incomeSources.otherSources.dividendIncome)],
    ["Family Pension", money(incomeSources.otherSources.familyPension)],
    ["Other Income", money(incomeSources.otherSources.otherIncome)],
  ]);

  const summaryIncomeRows: IncomeSummaryItem[] = [
    {
      id: "rec-salary",
      title: "Salary Income",
      sub: `${incomeSources.salary.employerName || "Employer"} • TDS: ₹${Number(incomeSources.salary.tdsDeducted || 0).toLocaleString("en-IN")}`,
      amount: `₹ ${Number(incomeSources.salary.grossSalary || 0).toLocaleString("en-IN")}`,
      tagText: "Declared",
      tagType: "verified",
      visible: incomeSources.salary.enabled && salaryDetails.length > 0,
      details: salaryDetails,
    },
    {
      id: "rec-hp",
      title: "House Property",
      sub: `${incomeSources.houseProperty.propertyType === "let_out" ? "Let-Out Property" : "Self-Occupied"} • Rent: ₹${Number(incomeSources.houseProperty.annualRentReceived || 0).toLocaleString("en-IN")}`,
      amount: `₹ ${Number(incomeSources.houseProperty.annualRentReceived || 0).toLocaleString("en-IN")}`,
      tagText: "Declared",
      tagType: "verified",
      visible: incomeSources.houseProperty.enabled,
      details: housePropertyDetails,
    },
    {
      id: "rec-business",
      title: "Business / Profession",
      sub: `${incomeSources.business.businessType === "presumptive_44ad" ? "Sec 44AD" : incomeSources.business.businessType === "presumptive_44ada" ? "Sec 44ADA" : "Regular Books"} • Profit: ₹${Number(incomeSources.business.declaredProfit || 0).toLocaleString("en-IN")}`,
      amount: `₹ ${Number(incomeSources.business.grossTurnover || 0).toLocaleString("en-IN")}`,
      tagText: "Declared",
      tagType: "verified",
      visible: incomeSources.business.enabled && businessDetails.length > 0,
      details: businessDetails,
    },
    {
      id: "rec-cg",
      title: "Capital Gains",
      sub: `STCG: ₹${Number(incomeSources.capitalGains.shortTermGains || 0).toLocaleString("en-IN")} • LTCG: ₹${Number(incomeSources.capitalGains.longTermGains || 0).toLocaleString("en-IN")}`,
      amount: `₹ ${(Number(incomeSources.capitalGains.shortTermGains || 0) + Number(incomeSources.capitalGains.longTermGains || 0)).toLocaleString("en-IN")}`,
      tagText: "Declared",
      tagType: "imported",
      visible: incomeSources.capitalGains.enabled && capitalGainsDetails.length > 0,
      details: capitalGainsDetails,
    },
    {
      id: "rec-other",
      title: "Other Sources",
      sub: `Savings: ₹${Number(incomeSources.otherSources.savingsInterest || 0).toLocaleString("en-IN")} • FD: ₹${Number(incomeSources.otherSources.fdInterest || 0).toLocaleString("en-IN")}`,
      amount: `₹ ${(Number(incomeSources.otherSources.savingsInterest || 0) + Number(incomeSources.otherSources.fdInterest || 0) + Number(incomeSources.otherSources.dividendIncome || 0) + Number(incomeSources.otherSources.otherIncome || 0)).toLocaleString("en-IN")}`,
      tagText: "Declared",
      tagType: "imported",
      visible: incomeSources.otherSources.enabled && otherSourcesDetails.length > 0,
      details: otherSourcesDetails,
    },
  ];

  const visibleIncomeRows = summaryIncomeRows.filter((r) => r.visible);

  const filingTypeText =
    personalInfo.filingType === "139_4_belated"
      ? "Belated Return (139(4))"
      : personalInfo.filingType === "139_5_revised"
      ? "Revised Return (139(5))"
      : "Original Return (139(1))";

  return (
    <View style={styles.container}>
      {/* Top Banner */}
      <View style={styles.bannerCard}>
        <Ionicons name="shield-checkmark" size={24} color="#059669" />
        <View style={styles.bannerTextCol}>
          <Text style={styles.bannerTitle}>Review Your ITR Application</Text>
          <Text style={styles.bannerSubtitle}>
            Review your declared income, refund bank account, and documents before submitting for CA review.
          </Text>
        </View>
      </View>

      {/* Actionable Missing Information Banner */}
      {missingItems.length > 0 && (
        <MissingInfoBanner items={missingItems} onResolve={onEditStep} />
      )}

      {/* 1. Filing & Taxpayer Details Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons name="person-outline" size={18} color="#083B75" />
            <Text style={styles.cardHeaderTitle}>Filing & Taxpayer Details</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={() => onEditStep(0)}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Assessment Year</Text>
          <Text style={styles.detailValueBold}>AY {personalInfo.assessmentYear || "2026-27"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Return Type</Text>
          <Text style={styles.detailValueBold}>{filingTypeText}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Applicable Form</Text>
          <Text style={styles.detailValueBold}>{determinedForm.form || "ITR-1 (Sahaj)"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Full Name</Text>
          <Text style={styles.detailValue}>{personalInfo.name || "Client"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>PAN Number</Text>
          <Text style={styles.detailValue}>{personalInfo.pan || "Not provided"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Residential Status</Text>
          <Text style={styles.detailValue}>{personalInfo.residentialStatus || "Resident"}</Text>
        </View>
      </View>

      {/* 2. Declared Income Breakdown Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons name="wallet-outline" size={18} color="#083B75" />
            <Text style={styles.cardHeaderTitle}>Declared Income Breakdown</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={() => onEditStep(1)}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>

        {visibleIncomeRows.length > 0 ? (
          <View style={styles.reconciliationTable}>
            {visibleIncomeRows.map((row) => (
              <View key={row.id}>
              <View style={styles.reconciliationRow}>
                <View style={styles.reconciliationColLeft}>
                  <Text style={styles.reconciliationTitle}>{row.title}</Text>
                  <Text style={styles.reconciliationSub}>{row.sub}</Text>
                </View>

                <View style={styles.reconciliationColRight}>
                  {row.amount && (
                    <Text style={styles.reconciliationAmount}>{row.amount}</Text>
                  )}
                  <View
                    style={
                      row.tagType === "verified"
                        ? styles.tagVerified
                        : row.tagType === "warning"
                        ? styles.tagWarning
                        : styles.tagImported
                    }
                  >
                    <Ionicons
                      name={
                        row.tagType === "verified"
                          ? "checkmark-circle"
                          : row.tagType === "warning"
                          ? "alert-circle"
                          : "document-text"
                      }
                      size={11}
                      color={
                        row.tagType === "verified"
                          ? "#166534"
                          : row.tagType === "warning"
                          ? "#B45309"
                          : "#083B75"
                      }
                    />
                    <Text
                      style={
                        row.tagType === "verified"
                          ? styles.tagVerifiedText
                          : row.tagType === "warning"
                          ? styles.tagWarningText
                          : styles.tagImportedText
                      }
                    >
                      {row.tagText}
                    </Text>
                  </View>
                </View>
              </View>
              {row.details.length > 0 && (
                <View style={styles.incomeDetailBlock}>
                  {row.details.map((d) => (
                    <View key={d.label} style={styles.incomeDetailRow}>
                      <Text style={styles.incomeDetailLabel}>{d.label}</Text>
                      <Text style={styles.incomeDetailValue}>{d.value}</Text>
                    </View>
                  ))}
                </View>
              )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyDocsBox}>
            <Text style={styles.emptyDocsText}>No income sources declared yet</Text>
          </View>
        )}
      </View>

      {/* 3. Refund Bank Account Details Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons name="card-outline" size={18} color="#083B75" />
            <Text style={styles.cardHeaderTitle}>Refund Bank Account</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={() => onEditStep(0, "bank")}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>

        {bankDetails.bankName ? (
          <View style={styles.bankInfoCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bank Name</Text>
              <Text style={styles.detailValueBold}>{bankDetails.bankName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Account Number</Text>
              <Text style={styles.detailValue}>{maskedBankNumber}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>IFSC Code</Text>
              <Text style={styles.detailValue}>{bankDetails.ifscCode || "Not provided"}</Text>
            </View>

            <View style={styles.bankBadgeRow}>
              <View style={styles.primaryRefundBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#166534" />
                <Text style={styles.primaryRefundBadgeText}>
                  Primary Account for Income Tax Refund
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyDocsBox}>
            <Text style={styles.emptyDocsText}>No refund bank account selected</Text>
          </View>
        )}
      </View>

      {/* 4. Uploaded & Verified Documents Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons name="attach-outline" size={18} color="#083B75" />
            <Text style={styles.cardHeaderTitle}>
              Uploaded Documents ({verifiedOrUploadedDocs.length})
            </Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={() => onEditStep(2)}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>

        {verifiedOrUploadedDocs.length > 0 ? (
          <View style={styles.uploadedList}>
            {verifiedOrUploadedDocs.map((doc) => (
              <View key={doc.id} style={styles.uploadedItemRow}>
                <View style={styles.docCheckIcon}>
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                </View>
                <View style={styles.docNameCol}>
                  <Text style={styles.docItemName}>{doc.name}</Text>
                  <Text style={styles.docItemFile}>
                    {doc.isProfileVerified
                      ? doc.profileVerifiedLabel || "Verified from Profile"
                      : `${doc.fileName || "Uploaded Document"} • ${doc.fileSize || "< 2 MB"}`}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyDocsBox}>
            <Text style={styles.emptyDocsText}>No documents uploaded yet</Text>
          </View>
        )}
      </View>

      {/* 5. Declaration Checkbox */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.declarationBox}
        onPress={() => onToggleDeclaration(!declarationAccepted)}
      >
        <Ionicons
          name={declarationAccepted ? "checkbox" : "square-outline"}
          size={22}
          color={declarationAccepted ? BrandColors.PRIMARY_ORANGE : "#64748B"}
        />
        <Text style={styles.declarationText}>
          I confirm that the income details, refund bank account, and documents provided are correct and complete to the best of my knowledge.
        </Text>
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={isSubmitting}
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmitPress}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>Submit for CA Review</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};
