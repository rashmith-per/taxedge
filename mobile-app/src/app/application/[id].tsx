import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { useApplicationStore } from "@/store/applicationStore";
import { useAuthStore } from "@/store/authStore";
import { applicationService } from "@/modules/applications/services/applicationService";
import type { Application, TimelineStep } from "@/types/domain";
import { logger } from "@/core/logging/logger";
import { styles } from "@/styles/app/application/[id].styles";

import {
  ApplicationHeader,
  type DetailTab,
} from "@/components/screens/application/ApplicationHeader";
import { OverviewTab } from "@/components/screens/application/OverviewTab";
import { StatusTab } from "@/components/screens/application/StatusTab";
import { DocumentsTab } from "@/components/screens/application/DocumentsTab";
import { PaymentsTab } from "@/components/screens/application/PaymentsTab";
import { ChatTab } from "@/components/screens/application/ChatTab";
import { ApplicationBottomBar } from "@/components/screens/application/ApplicationBottomBar";
import {
  formatDisplayDate,
  calculateExpectedDate,
  getGstAmendmentTimeline,
  getDefaultTimeline,
} from "@/components/screens/application/applicationDetailsUtils";

export default function ApplicationDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const applications = useApplicationStore((state) => state.applications);
  const uploadDocument = useApplicationStore((state) => state.uploadDocument);
  const addChatMessage = useApplicationStore((state) => state.addChatMessage);
  const deleteApplication = useApplicationStore((state) => state.deleteApplication);

  const [remoteApp, setRemoteApp] = useState<Application | null>(null);
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>("OVERVIEW");

  const app =
    applications.find((a) => a.id === id || a.formData?.arn === id) ||
    remoteApp;

  const handleSendMessage = async () => {
    const text = chatInput.trim();
    if (!text || !app) return;
    setChatInput("");
    setIsSendingChat(true);
    try {
      await addChatMessage(app.id, "user", text);
    } catch {
      // Handled in store
    } finally {
      setIsSendingChat(false);
    }
  };

  useEffect(() => {
    if (!app && id) {
      setIsLoadingRemote(true);
      applicationService
        .getApplicationById(id)
        .then((fetched) => {
          if (fetched) setRemoteApp(fetched);
        })
        .finally(() => setIsLoadingRemote(false));
    }
  }, [id, app]);

  if (isLoadingRemote) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingWrap,
          { paddingTop: insets.top + 20 },
        ]}
      >
        <FocusAwareStatusBar barStyle="light-content" backgroundColor="#0A2346" />
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>Loading application details...</Text>
      </View>
    );
  }

  if (!app) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: "#0A2346", paddingTop: insets.top + 20 },
        ]}
      >
        <FocusAwareStatusBar barStyle="light-content" backgroundColor="#0A2346" />
        <View style={styles.topNavRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Not Found</Text>
          <View style={styles.navSpacer} />
        </View>
        <View style={styles.errorContent}>
          <Ionicons name="warning-outline" size={48} color="#EA580C" />
          <Text style={styles.errorText}>Application not found.</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.actionBtnFilled}
          >
            <Text style={styles.actionBtnFilledText}>
              Return to Applications
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Derived Application Metadata ──────────────────────────────────────────

  const isGstAmendment = app.serviceId === "gst-amendment";
  const formData = (app.formData || {}) as Record<string, any>;
  const isNonCore =
    formData.isCore === false ||
    formData.isCore === "false" ||
    Boolean(formData.amendmentCategory?.toLowerCase().includes("non-core")) ||
    (formData.section
      ? ["Bank Accounts", "Authorised Signatories", "Contact Details"].some((s) =>
          formData.section?.includes(s)
        )
      : false);
  const isCore = isGstAmendment && !isNonCore;

  const displayId =
    isGstAmendment && formData.arn ? String(formData.arn) : app.id;
  const displayName =
    isGstAmendment && formData.section
      ? `GST Amendment — ${formData.section}`
      : app.serviceName;

  const currentCustomerName = useAuthStore.getState().customer?.name;
  const applicantName =
    formData.applicantName ||
    (isGstAmendment
      ? formData.currentValues?.["Legal Business Name"] || "Registered Taxpayer"
      : formData.businessName ||
        formData.tradeName ||
        currentCustomerName ||
        "Verified Business");

  const isLoans =
    app.category === "LOANS" ||
    (app.serviceId || "").startsWith("loan") ||
    app.serviceId === "machinery-loan";

  const appliedDate =
    formData.submissionDate || formatDisplayDate(app.createdAt);
  const assignedCA = isLoans
    ? "TaxEdge Loan Agent"
    : app.assignedExecutive && app.assignedExecutive.trim() !== ""
      ? app.assignedExecutive.trim()
      : isGstAmendment
        ? isCore
          ? "GST Verification Officer"
          : "Auto-Verification Engine"
        : "CA not assigned yet";
  const expectedDate = isGstAmendment
    ? isCore
      ? "15 Working Days (Officer Review)"
      : "Auto-Approved / 24 Hours"
    : calculateExpectedDate(app.createdAt);
  const uploadedDocs = app.documents.filter(
    (d) => d.status === "Uploaded"
  ).length;

  const isPaid = isGstAmendment || app.paymentStatus === "Paid";
  const totalAmount = isGstAmendment ? 0 : app.paymentAmount;
  const baseServiceFee = Math.round(app.paymentAmount / 1.18);
  const gstAmount = app.paymentAmount - baseServiceFee;

  const timelineSteps: TimelineStep[] =
    app.timeline && app.timeline.length > 0
      ? app.timeline
      : isGstAmendment
        ? getGstAmendmentTimeline(appliedDate, isCore)
        : getDefaultTimeline(app, appliedDate);

  const handleDocumentUpload = async (docName: string) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        uploadDocument(app.id, docName, res.assets[0].uri);
      }
    } catch (err) {
      logger.warn("[ApplicationDetail] Document picker cancelled or failed:", { appId: app.id, docName, error: err });
    }
  };

  const headerInfo = {
    OVERVIEW: {
      nav: isGstAmendment ? "Amendment Details" : "Application Details",
      title: displayName,
      sub: isGstAmendment
        ? `ARN: ${displayId} • ${appliedDate}`
        : `${applicantName} • ${appliedDate}`,
    },
    STATUS: {
      nav: isGstAmendment ? "Amendment Status" : "Application Status",
      title: isGstAmendment
        ? isCore
          ? "Officer Verification"
          : "System Verification"
        : app.serviceId === "gst-filing"
          ? "Staff Verification"
          : "Document Verification",
      sub: isGstAmendment
        ? `Type: ${isCore ? "Core (Officer Approval)" : "Non-Core (Auto)"} • Target: ${expectedDate}`
        : `Assigned CA: ${assignedCA} • Target: ${expectedDate}`,
    },
    DOCUMENTS: {
      nav: isGstAmendment ? "Supporting Documents" : "Required Documents",
      title: "Document Uploads",
      sub:
        isGstAmendment && formData.document
          ? "Supporting proof attached"
          : `${uploadedDocs} of ${app.documents.length} documents uploaded`,
    },
    PAYMENTS: {
      nav: "Payment Details",
      title: "Invoice & Fees",
      sub: isGstAmendment
        ? "Government Portal Filing • Fee: Free"
        : `Total: ₹${totalAmount.toLocaleString()} • Status: ${app.paymentStatus}`,
    },
    CHAT: {
      nav: isLoans ? "Chat with Loan Agent" : "Chat with CA",
      title: isLoans ? "Loan Agent Support" : "CA Consultation",
      sub: `Application #${displayId} • ${assignedCA}`,
    },
  }[activeTab];

  const overviewRows = isGstAmendment
    ? [
        { key: "Application Type", val: "GST Amendment" },
        { key: "ARN / Reference", val: displayId },
        { key: "GSTIN", val: formData.gstin || "—" },
        { key: "Requested Section", val: formData.section || "—" },
        {
          key: "Amendment Type",
          val: isCore
            ? "Core (Officer Approval Required)"
            : "Non-Core (Auto-Approved)",
        },
        { key: "Submission Date", val: appliedDate },
        { key: "Current Status", val: app.status || "Submitted" },
        { key: "Processing Window", val: expectedDate },
      ]
    : [
        { key: "Customer / Entity", val: applicantName },
        { key: "Service", val: app.serviceName },
        { key: "Application ID", val: app.id },
        { key: "Applied Date", val: appliedDate },
        { key: "Assigned CA", val: assignedCA },
        { key: "Expected Completion", val: expectedDate },
      ];

  const filingRows = app.formData?.gstin
    ? [
        { key: "GSTIN", val: app.formData.gstin },
        {
          key: "Business Entity",
          val:
            app.formData.businessName ||
            app.formData.tradeName ||
            applicantName,
        },
        ...(app.formData.taxpayerScheme
          ? [{ key: "Taxpayer Scheme", val: app.formData.taxpayerScheme }]
          : []),
        ...(app.formData.filingNature
          ? [{ key: "Filing Nature", val: app.formData.filingNature }]
          : []),
        ...(app.formData.financialYear
          ? [{ key: "Financial Year", val: app.formData.financialYear }]
          : []),
        ...(app.formData.filingPeriod
          ? [{ key: "Filing Period", val: app.formData.filingPeriod }]
          : []),
        ...(app.formData.filingFrequency
          ? [{ key: "Filing Frequency", val: app.formData.filingFrequency }]
          : []),
        ...(app.formData.filingType
          ? [{ key: "Return Form", val: app.formData.filingType }]
          : []),
        ...(app.formData.calculationMethod
          ? [
              {
                key: "Calculation Method",
                val:
                  app.formData.calculationMethod === "estimated"
                    ? "Self Estimated Figures"
                    : "TaxEdge CA Assisted (Documents)",
              },
            ]
          : []),
      ]
    : [];

  const hasEstimates = Boolean(
    app.formData?.turnover || app.formData?.eligibleItc
  );
  const turnoverNum = Number(app.formData?.turnover || 0);
  const outputGstNum = Math.round(turnoverNum * 0.18);
  const itcNum = Number(app.formData?.eligibleItc || 0);
  const netLiabilityNum = Math.max(0, outputGstNum - itcNum);

  const estimateRows = hasEstimates
    ? [
        { key: "Gross Taxable Turnover", val: `₹${turnoverNum.toLocaleString()}` },
        { key: "Estimated Output GST (18%)", val: `₹${outputGstNum.toLocaleString()}` },
        { key: "Eligible Input Tax Credit", val: `- ₹${itcNum.toLocaleString()}` },
        { key: "Net Tax Liability (Govt)", val: `₹${netLiabilityNum.toLocaleString()}` },
      ]
    : [];

  const registrationRows =
    !app.formData?.gstin && app.formData?.businessName
      ? [
          { key: "Business Name", val: app.formData.businessName },
          ...(app.formData.businessType
            ? [{ key: "Business Type", val: app.formData.businessType }]
            : []),
          ...(app.formData.state
            ? [{ key: "State", val: app.formData.state }]
            : []),
          ...(app.formData.pan ? [{ key: "PAN", val: app.formData.pan }] : []),
        ]
      : [];

  const paymentRows = isGstAmendment
    ? [
        { key: "Government Portal Fee", val: "₹0 (Free)" },
        { key: "TaxEdge Amendment Processing", val: "₹0 (Complimentary)" },
        { key: "GST (18%)", val: "₹0" },
      ]
    : [
        { key: "Service Fee", val: `₹${baseServiceFee.toLocaleString()}` },
        { key: "Government Fees", val: "₹0 (Included)" },
        { key: "Platform GST (18%)", val: `₹${gstAmount.toLocaleString()}` },
        ...(app.formData?.transactionId
          ? [{ key: "Transaction ID", val: app.formData.transactionId }]
          : []),
        ...(app.formData?.paymentMethod
          ? [{ key: "Payment Method", val: app.formData.paymentMethod }]
          : []),
        { key: "Payment Date", val: appliedDate },
      ];

  const handleWithdraw = () => {
    deleteApplication(app.id);
    router.replace("/(main)/applications");
  };

  const handleReviewEdit = () => {
    router.push(`/service/gst-filing?appId=${app.id}&step=2`);
  };

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#0A2346" />

      {/* Header and horizontal tabs */}
      <ApplicationHeader
        topInset={insets.top}
        navTitle={headerInfo.nav}
        displayId={displayId}
        serviceTitle={headerInfo.title}
        serviceSubtitle={headerInfo.sub}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoans={isLoans}
        onBack={() => router.back()}
      />

      {/* Main Tab Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "OVERVIEW" && (
          <OverviewTab
            isGstAmendment={isGstAmendment}
            displayId={displayId}
            appliedDate={appliedDate}
            formData={formData}
            overviewRows={overviewRows}
            assignedCA={assignedCA}
            isLoans={isLoans}
            onChatPress={() => setActiveTab("CHAT")}
            filingRows={filingRows}
            estimateRows={estimateRows}
            registrationRows={registrationRows}
            appId={app.id}
            onReviewEdit={handleReviewEdit}
            onSupportTicket={() => router.push("/chat/support")}
          />
        )}

        {activeTab === "STATUS" && (
          <StatusTab
            timelineSteps={timelineSteps}
            assignedCA={assignedCA}
            onChatPress={() => setActiveTab("CHAT")}
            onWithdraw={handleWithdraw}
          />
        )}

        {activeTab === "DOCUMENTS" && (
          <DocumentsTab
            isGstAmendment={isGstAmendment}
            formData={formData}
            documents={app.documents}
            onUploadDocument={handleDocumentUpload}
          />
        )}

        {activeTab === "PAYMENTS" && (
          <PaymentsTab
            paymentRows={paymentRows}
            isGstAmendment={isGstAmendment}
            isPaid={isPaid}
            totalAmount={totalAmount}
            paymentStatus={app.paymentStatus}
          />
        )}

        {activeTab === "CHAT" && (
          <ChatTab
            chatHistory={app.chatHistory}
            assignedCA={assignedCA}
            formatDisplayDate={formatDisplayDate}
          />
        )}
      </ScrollView>

      {/* Bottom Action Bar / Chat Input Bar */}
      <ApplicationBottomBar
        activeTab={activeTab}
        bottomInset={insets.bottom}
        assignedCA={assignedCA}
        chatInput={chatInput}
        setChatInput={setChatInput}
        isSendingChat={isSendingChat}
        onSendMessage={handleSendMessage}
        isLoans={isLoans}
        onOpenChat={() => setActiveTab("CHAT")}
      />
    </View>
  );
}
