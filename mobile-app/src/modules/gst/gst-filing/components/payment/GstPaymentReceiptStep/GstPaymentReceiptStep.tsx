/**
 * Component: GstPaymentReceiptStep
 * Migrated from internal StyleSheet to external styles module.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import {
  downloadAndOpenInvoicePdf,
  shareInvoicePdfDocument,
} from "@/shared/utils/invoicePdfGenerator";
import { styles } from "./GstPaymentReceiptStep.styles";

export interface GstPaymentReceiptStepProps {
  amount?: string;
  serviceName?: string;
  invoiceNo?: string;
  gstin?: string;
  period?: string;
  customerName?: string;
  txnId?: string;
  paymentMethod?: string;
}

export const GstPaymentReceiptStep: React.FC<GstPaymentReceiptStepProps> = ({
  amount = "Amount unavailable",
  serviceName = "GST Filing Service (GSTR-3B)",
  invoiceNo = "Not available",
  gstin = "Not provided",
  period = "Not provided",
  customerName = "Not provided",
  txnId = "Not available",
  paymentMethod = "UPI",
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const invoiceData = {
    invoiceNo,
    serviceName,
    amount,
    gstin,
    period,
    customerName,
    txnId,
    paymentMethod,
    date: currentDate,
  };

  const handleShareReceipt = async () => {
    setIsGenerating(true);
    try {
      await shareInvoicePdfDocument(invoiceData);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      await downloadAndOpenInvoicePdf(invoiceData);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Receipt Invoice Card */}
      <View style={styles.receiptCard}>
        {/* Company Header */}
        <View style={styles.companyBanner}>
          <View style={styles.teBadge}>
            <Text style={styles.teBadgeText}>TE</Text>
          </View>
          <View style={styles.companyTextCol}>
            <Text style={styles.companyName}>TaxEdge Fin Solutions</Text>
            <Text style={styles.companyGst}>GSTIN: 29TAXEDGE1234K1Z5</Text>
          </View>
        </View>

        {/* Invoice Meta */}
        <View style={styles.invoiceMetaRow}>
          <View>
            <Text style={styles.metaLabel}>INVOICE NUMBER</Text>
            <Text style={styles.metaValue}>{invoiceNo}</Text>
          </View>
          <View style={styles.metaRightCol}>
            <Text style={styles.metaLabel}>DATE</Text>
            <Text style={styles.metaValue}>{currentDate}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Customer / Billed To Section */}
        <View style={styles.paddedSection}>
          <Text style={styles.metaLabel}>BILLED TO</Text>
          <Text style={styles.customerName}>{customerName}</Text>
          <Text style={styles.customerGstin}>GSTIN: {gstin}</Text>
          <Text style={styles.customerPeriod}>Filing Period: {period}</Text>
        </View>

        <View style={styles.divider} />

        {/* Itemised Breakdown */}
        <View style={styles.tableHeaderRow}>
          <Text style={styles.metaLabel}>DESCRIPTION</Text>
          <Text style={styles.metaLabel}>AMOUNT</Text>
        </View>

        <View style={styles.tableItemRow}>
          <View style={styles.tableItemTextCol}>
            <Text style={styles.itemTitle}>{serviceName}</Text>
            <Text style={styles.itemSubtitle}>CA review, ITC reconciliation & filing</Text>
          </View>
          <Text style={styles.itemAmount}>₹1,986</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.calcList}>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Sub Total</Text>
            <Text style={styles.calcValue}>₹1,986</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>CGST (9%)</Text>
            <Text style={styles.calcValue}>₹179</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>SGST (9%)</Text>
            <Text style={styles.calcValue}>₹179</Text>
          </View>
        </View>

        {/* Highlighted Total Paid */}
        <View style={styles.totalPaidRow}>
          <Text style={styles.totalPaidLabel}>Total Amount Paid</Text>
          <Text style={styles.totalPaidValue}>{amount}</Text>
        </View>

        {/* Transaction Footer Meta */}
        <View style={styles.txnFooterRow}>
          <View>
            <Text style={styles.metaLabel}>Transaction ID</Text>
            <Text style={styles.footerTxnValue}>{txnId}</Text>
          </View>
          <View style={styles.metaRightCol}>
            <Text style={styles.metaLabel}>Payment Mode</Text>
            <Text style={styles.footerTxnValue}>{paymentMethod}</Text>
          </View>
        </View>

        <View style={styles.verifiedBanner}>
          <Ionicons name="checkmark-circle" size={16} color={BrandColors.PRIMARY_ORANGE} />
          <Text style={styles.verifiedText}>Payment Verified & Received</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.downloadBtn}
          activeOpacity={0.8}
          onPress={handleDownloadPdf}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color={BrandColors.PRIMARY_ORANGE} />
          ) : (
            <>
              <Ionicons name="download-outline" size={16} color={BrandColors.PRIMARY_ORANGE} />
              <Text style={styles.downloadBtnText}>Download PDF</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shareBtn}
          activeOpacity={0.85}
          onPress={handleShareReceipt}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="share-social-outline" size={16} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>Share Receipt</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
