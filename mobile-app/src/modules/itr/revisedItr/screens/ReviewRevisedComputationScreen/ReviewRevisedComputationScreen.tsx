import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RevisedItrHeader } from "../../components/common";
import {
  ComputationComparisonTable,
  RevisedRefundHeroCard,
} from "../../components/review";
import {
  styles,
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
  getBottomBarInsetsStyle,
} from "./ReviewRevisedComputationScreen.styles";

import { useAuthStore } from "@/modules/authentication/store/authStore";
import { useCustomerStore } from "@/modules/customer/store/customerStore";
import { useApplicationStore } from "@/store/applicationStore";
import { DEFAULT_REVISED_FORM_FIELDS } from "../../mock/revisedItrData";
import { RevisedFormFields } from "../../types/revisedItr.types";

export const ReviewRevisedComputationScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    acknowledgementNumber?: string;
    assessmentYear?: string;
    revisionReason?: string;
    revisedDetails?: string;
    uploadedDocsCount?: string;
    totalDocsCount?: string;
  }>();

  const assessmentYear = params.assessmentYear || "AY 2025–26";
  const ackNo = params.acknowledgementNumber || "284419250714208";
  const uploadedDocs = params.uploadedDocsCount || "2";
  const totalDocs = params.totalDocsCount || "6";

  const customerFromAuth = useAuthStore((s) => s.customer);
  const profileFromCust = useCustomerStore((s) => s.profile);
  const customer = customerFromAuth || profileFromCust;

  let formDetails: RevisedFormFields = DEFAULT_REVISED_FORM_FIELDS;
  if (params.revisedDetails) {
    try {
      formDetails = JSON.parse(params.revisedDetails);
    } catch {}
  }

  const maskPan = (pan?: string): string => {
    if (!pan || !pan.trim()) return "XXXXX1234F";
    const clean = pan.trim().toUpperCase();
    if (clean.length === 10) {
      return `XXXXX${clean.slice(5)}`;
    }
    return clean;
  };

  const getReasonLabel = (id?: string): string => {
    switch (id) {
      case "missed_income":
        return "Missed Income";
      case "wrong_deduction":
        return "Wrong Deduction";
      case "incorrect_bank":
        return "Incorrect Bank Details";
      case "other":
        return "Other Correction";
      default:
        return "Missed Income";
    }
  };

  const handleEditOriginal = () => {
    router.push({
      pathname: "/service/revised-itr" as any,
    });
  };

  const handleEditChanges = () => {
    router.push({
      pathname: "/service/revised-itr-update" as any,
      params: {
        acknowledgementNumber: ackNo,
        assessmentYear,
        revisionReason: params.revisionReason,
      },
    });
  };

  const handleEditDocs = () => {
    router.push({
      pathname: "/service/revised-itr-documents" as any,
      params: {
        acknowledgementNumber: ackNo,
        assessmentYear,
        revisionReason: params.revisionReason,
      },
    });
  };

  const createApplication = useApplicationStore((state) => state.createApplication);

  const handleProceedPayment = () => {
    const serviceTitle = `Revised ITR (${assessmentYear})`;
    const generatedAppId = createApplication(
      "revised-itr",
      serviceTitle,
      "ITR",
      {
        originalAckNo: ackNo,
        assessmentYear,
        revisionReason: getReasonLabel(params.revisionReason),
        revisedFields: formDetails,
      },
      [
        "PAN Card",
        "Aadhaar Card",
        `Form 16 / 16A (${assessmentYear})`,
        "AIS and TIS Statement",
        "Bank Statements",
        "Investment Proofs",
      ],
      999, // service fee
      "Pending"
    );

    // Navigate to Application Received / Success screen with Revised ITR details
    router.push({
      pathname: "/service/itr-success" as any,
      params: {
        serviceType: "revised",
        serviceTitle,
        assessmentYear,
        applicationId: generatedAppId,
        uploadedDocsCount: uploadedDocs,
        totalDocsCount: totalDocs,
      },
    });
  };

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top)]}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <RevisedItrHeader subtitle="Review Revised ITR" />

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          getScrollContentInsetsStyle(insets.bottom),
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Review Revised ITR</Text>
          <Text style={styles.pageSubtitle}>
            Review your updated details before proceeding to payment.
          </Text>
        </View>

        {/* 1. Original Return Section */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Original Return</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleEditOriginal}
              style={styles.editBtn}
            >
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ack Number</Text>
              <Text style={styles.infoVal}>{ackNo}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Assessment Year</Text>
              <Text style={styles.infoVal}>{assessmentYear}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ITR Form</Text>
              <Text style={styles.infoVal}>ITR-1</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gross Total Income</Text>
              <Text style={styles.infoVal}>₹8,12,400</Text>
            </View>
          </View>
        </View>

        {/* 2. Personal Information Section */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Personal Information</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleEditOriginal}
              style={styles.editBtn}
            >
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoVal}>{customer?.name || "Customer"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>PAN</Text>
              <Text style={styles.infoVal}>{maskPan(customer?.pan)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoVal}>{customer?.dob || "15/08/1990"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mobile</Text>
              <Text style={styles.infoVal}>{(customer as any)?.mobile || "+91 98765 43210"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoVal}>{customer?.email || "customer@example.com"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoVal}>
                {customer?.address || (customer?.city ? `${customer.city}, ${customer.state || ""}` : "Bengaluru, Karnataka")}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. Changes Section */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Changes</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleEditChanges}
              style={styles.editBtn}
            >
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Revision Reason</Text>
              <Text style={styles.infoVal}>{getReasonLabel(params.revisionReason)}</Text>
            </View>
            {params.revisionReason === "incorrect_bank" ? (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Revised Bank</Text>
                  <Text style={styles.infoVal}>{formDetails.bankAccount}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Revised IFSC</Text>
                  <Text style={styles.infoVal}>{formDetails.ifsc}</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Revised Salary / Business</Text>
                  <Text style={styles.infoVal}>₹{formDetails.salaryBusinessIncome}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Revised Taxable Income</Text>
                  <Text style={styles.infoVal}>₹{formDetails.taxableIncome}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* 4. Documents Section */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Documents</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleEditDocs}
              style={styles.editBtn}
            >
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Uploaded Count</Text>
              <Text style={styles.infoVal}>{uploadedDocs} of {totalDocs} documents</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Verification Status</Text>
              <Text style={styles.infoVal}>Ready for CA Review</Text>
            </View>
          </View>
        </View>

        {/* 5. Tax Calculation Comparison */}
        <ComputationComparisonTable />

        {/* 6. Revised Refund Summary Card */}
        <RevisedRefundHeroCard />
      </ScrollView>

      {/* Sticky Bottom Action Button */}
      <View
        style={[
          styles.bottomBar,
          getBottomBarInsetsStyle(insets.bottom),
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleProceedPayment}
          style={styles.proceedButton}
        >
          <Text style={styles.proceedButtonText}>Proceed to Payment →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ReviewRevisedComputationScreen;
