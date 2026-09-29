/**
 * Component: GstApplicationStatusStep
 * Migrated from internal StyleSheet to external styles module.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "./GstApplicationStatusStep.styles";

export interface TimelineItem {
  id: string;
  title: string;
  subtitle: string;
  status: "completed" | "active" | "pending";
}

export interface GstApplicationStatusStepProps {
  appId?: string;
  appliedDate?: string;
  businessName?: string;
  serviceName?: string;
  estCompletion?: string;
  isFilingWorkflow?: boolean;
  onReuploadDocuments?: () => void;
}

const GST_REGISTRATION_TIMELINE: TimelineItem[] = [
  { id: "1", title: "Application Submitted", subtitle: "Form & documents received", status: "completed" },
  { id: "2", title: "Document Verification", subtitle: "Assigned CA reviewing proofs", status: "active" },
  { id: "3", title: "TRN Generation", subtitle: "Temporary Reference Number creation", status: "pending" },
  { id: "4", title: "Filed with GST Portal", subtitle: "Submission to GST department", status: "pending" },
  { id: "5", title: "ARN Generated", subtitle: "Acknowledgement number issued", status: "pending" },
  { id: "6", title: "GST Certificate Issued", subtitle: "GSTIN & certificate delivered", status: "pending" },
];

const GST_FILING_TIMELINE: TimelineItem[] = [
  { id: "1", title: "Customer Request", subtitle: "Filing request initiated", status: "completed" },
  { id: "2", title: "Document Upload", subtitle: "Sales & purchase registers submitted", status: "completed" },
  { id: "3", title: "Staff Verification", subtitle: "Chartered Accountant reviewing invoices", status: "active" },
  { id: "4", title: "Data Preparation", subtitle: "Accounting integration & ledger extraction", status: "pending" },
  { id: "5", title: "Return Preparation", subtitle: "Form computation & ITC reconciliation", status: "pending" },
  { id: "6", title: "Customer Review", subtitle: "Tax summary shared with business", status: "pending" },
  { id: "7", title: "Customer Approval", subtitle: "Client signs off return computation", status: "pending" },
  { id: "8", title: "GST Filing Submission", subtitle: "Return submitted to GSTN portal", status: "pending" },
  { id: "9", title: "Acknowledgement Receipt", subtitle: "ARN generated & filed copy delivered", status: "pending" },
  { id: "10", title: "Filing Completed", subtitle: "Compliance verified & closed", status: "pending" },
];

export const GstApplicationStatusStep: React.FC<GstApplicationStatusStepProps> = ({
  appId = "Not available",
  appliedDate = "Today",
  businessName = "Your Business",
  serviceName = "GST Registration",
  estCompletion = "3-5 Business Days",
  isFilingWorkflow,
  onReuploadDocuments,
}) => {
  const router = useRouter();
  const isFiling = Boolean(isFilingWorkflow || serviceName.toLowerCase().includes("filing"));
  const timelineSteps = isFiling ? GST_FILING_TIMELINE : GST_REGISTRATION_TIMELINE;

  const handleGoHome = () => {
    router.replace("/(main)/home");
  };

  const handleGoApplications = () => {
    router.replace("/(main)/applications");
  };

  return (
    <View style={styles.container}>
      {/* Success Celebration Header */}
      <View style={styles.successBanner}>
        <View style={styles.successIconCircle}>
          <Ionicons name="checkmark" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.successTextContainer}>
          <Text style={styles.successTitle}>Application Submitted!</Text>
          <Text style={styles.successSubtitle}>
            Your GST application has been successfully filed with TaxEdge.
          </Text>
        </View>
      </View>

      {/* Hero Application Status Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroAppIdLabel}>APPLICATION ID</Text>
            <Text style={styles.heroAppIdValue}>{appId}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>Under Verification</Text>
          </View>
        </View>

        <View style={styles.heroDetailsRow}>
          <View style={styles.heroCol}>
            <Text style={styles.colLabel}>Business</Text>
            <Text style={styles.colValue} numberOfLines={1}>
              {businessName}
            </Text>
          </View>
          <View style={styles.heroCol}>
            <Text style={styles.colLabel}>Applied On</Text>
            <Text style={styles.colValue}>{appliedDate}</Text>
          </View>
          <View style={styles.heroCol}>
            <Text style={styles.colLabel}>Est. Completion</Text>
            <Text style={styles.colValue}>{estCompletion}</Text>
          </View>
        </View>
      </View>

      {/* Application Progress Timeline */}
      <Text style={styles.sectionHeading}>Application Progress</Text>
      <View style={styles.timelineList}>
        {timelineSteps.map((step, idx) => {
          const isLast = idx === timelineSteps.length - 1;
          return (
            <View key={step.id} style={styles.timelineRow}>
              {/* Timeline Indicator Column */}
              <View style={styles.timelineLeftCol}>
                {step.status === "completed" && (
                  <View style={styles.circleCompleted}>
                    <Ionicons name="checkmark" size={14} color={BrandColors.PRIMARY_ORANGE} />
                  </View>
                )}
                {step.status === "active" && (
                  <View style={styles.circleActive}>
                    <View style={styles.innerDotActive} />
                  </View>
                )}
                {step.status === "pending" && (
                  <View style={styles.circlePending}>
                    <View style={styles.innerDotPending} />
                  </View>
                )}
                {!isLast && (
                  <View
                    style={[
                      styles.timelineTrack,
                      step.status === "completed" && styles.timelineTrackCompleted,
                    ]}
                  />
                )}
              </View>

              {/* Timeline Content */}
              <View style={styles.timelineRightCol}>
                <Text
                  style={[
                    styles.stepTitle,
                    step.status === "pending" && styles.stepTitlePending,
                  ]}
                >
                  {step.title}
                </Text>
                <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Navigation & Action Buttons */}
      <View style={styles.actionButtonsCol}>
        <TouchableOpacity
          style={styles.primaryHomeBtn}
          activeOpacity={0.85}
          onPress={handleGoHome}
        >
          <Ionicons name="home" size={18} color="#FFFFFF" />
          <Text style={styles.primaryHomeBtnText}>Go to Home Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryAppBtn}
          activeOpacity={0.8}
          onPress={handleGoApplications}
        >
          <Ionicons name="folder-open-outline" size={18} color={BrandColors.PRIMARY_BLUE} />
          <Text style={styles.secondaryAppBtnText}>Track in My Applications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactSupportBtn}
          activeOpacity={0.8}
          onPress={() => router.push("/chat/support")}
        >
          <Ionicons name="chatbubbles-outline" size={17} color="#64748B" />
          <Text style={styles.contactSupportBtnText}>Contact Support / CA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
