import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { useApplicationStore } from "../../store/applicationStore";
import { useAuthStore } from "../../store/authStore";
import { applicationService } from "../../modules/applications/services/applicationService";
import type { Application, TimelineStep } from "../../types/domain";
import { styles } from "../../styles/app/application/[id].styles";

type DetailTab = "OVERVIEW" | "STATUS" | "DOCUMENTS" | "PAYMENTS" | "CHAT";

const TABS: { id: DetailTab; label: string }[] = [
  { id: "OVERVIEW", label: "Overview" },
  { id: "STATUS", label: "Status" },
  { id: "DOCUMENTS", label: "Documents" },
  { id: "PAYMENTS", label: "Payments" },
  { id: "CHAT", label: "Chat with CA" },
];

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return "Today";
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  if (months.some((m) => dateStr.includes(m))) return dateStr;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime()))
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {}
  return dateStr;
}

function calculateExpectedDate(dateStr?: string): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  try {
    const d = dateStr ? new Date(dateStr) : new Date();
    if (!isNaN(d.getTime())) {
      d.setDate(d.getDate() + 2);
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
  } catch {}
  return "1–2 Business Days";
}

export default function ApplicationDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const applications = useApplicationStore((state) => state.applications);
  const uploadDocument = useApplicationStore((state) => state.uploadDocument);
  const addChatMessage = useApplicationStore((state) => state.addChatMessage);
  const [remoteApp, setRemoteApp] = useState<Application | null>(null);
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);

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

  const [activeTab, setActiveTab] = useState<DetailTab>("OVERVIEW");

  if (isLoadingRemote) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: "#0A2346",
            paddingTop: insets.top + 20,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <FocusAwareStatusBar barStyle="light-content" backgroundColor="#0A2346" />
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={{ color: "#FFF", marginTop: 12, fontSize: 14 }}>
          Loading application details...
        </Text>
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
          <View style={{ width: 38 }} />
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

  const isGstAmendment = app.serviceId === "gst-amendment";
  const formData = (app.formData || {}) as Record<string, any>;
  const isNonCore =
    formData.isCore === false ||
    formData.isCore === "false" ||
    Boolean(formData.amendmentCategory?.toLowerCase().includes("non-core")) ||
    (formData.section
      ? ["Bank Accounts", "Authorised Signatories", "Contact Details"].some(
          (s) => formData.section?.includes(s),
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
    (d: any) => d.status === "Uploaded",
  ).length;

  const isPaid = isGstAmendment || app.paymentStatus === "Paid";
  const totalAmount = isGstAmendment ? 0 : app.paymentAmount;
  const baseServiceFee = Math.round(app.paymentAmount / 1.18);
  const gstAmount = app.paymentAmount - baseServiceFee;

  const defaultGstAmendmentTimeline: TimelineStep[] = [
    {
      title: "Submitted",
      description: "Amendment request created",
      status: "completed",
      date: appliedDate,
    },
    {
      title: "Under Verification",
      description: "TaxEdge review in progress",
      status: "current",
      date: appliedDate,
    },
    {
      title: "Officer Review",
      description: isCore
        ? "Assessing officer reviewing the change"
        : "Assessing system reviewing the change",
      status: "pending",
    },
    {
      title: "Action Required",
      description: "If clarification is requested",
      status: "pending",
    },
    {
      title: "Approved / Updated",
      description: "Amended registration issued",
      status: "pending",
    },
  ];

  const defaultTimeline: TimelineStep[] =
    app.serviceId === "gst-filing"
      ? [
          {
            title: "Application Submitted",
            description: "Application filed online with documents",
            status: "completed",
            date: appliedDate,
          },
          {
            title: "Staff Verification",
            description: "CA reviewing invoices & reconciliation",
            status: "current",
            date: appliedDate,
          },
          {
            title: "Filing Submission",
            description: "Submission to GST portal",
            status: "pending",
          },
          {
            title: "Filing Completed",
            description: "ARN generated and confirmation delivered",
            status: "pending",
          },
        ]
      : [
          {
            title: "Application Submitted",
            description: "Application filed online with documents",
            status: "completed",
            date: appliedDate,
          },
          {
            title: "Document Verification",
            description: "Review of premises and identity documents",
            status: "current",
            date: appliedDate,
          },
          {
            title: "TRN Generation",
            description: "Temporary Reference Number creation",
            status: "pending",
          },
          {
            title: "GST Certificate Issuance",
            description: "Final GSTIN approval from Department",
            status: "pending",
          },
        ];

  const timelineSteps: TimelineStep[] =
    app.timeline && app.timeline.length > 0
      ? app.timeline
      : isGstAmendment
        ? defaultGstAmendmentTimeline
        : defaultTimeline;

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
      console.warn("Document picker cancelled or failed:", err);
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

  // GST Return Filing specific metadata card
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

  // Estimated Tax Figures if supplied
  const hasEstimates = Boolean(
    app.formData?.turnover || app.formData?.eligibleItc,
  );
  const turnoverNum = Number(app.formData?.turnover || 0);
  const outputGstNum = Math.round(turnoverNum * 0.18);
  const itcNum = Number(app.formData?.eligibleItc || 0);
  const netLiabilityNum = Math.max(0, outputGstNum - itcNum);

  const estimateRows = hasEstimates
    ? [
        {
          key: "Gross Taxable Turnover",
          val: `₹${turnoverNum.toLocaleString()}`,
        },
        {
          key: "Estimated Output GST (18%)",
          val: `₹${outputGstNum.toLocaleString()}`,
        },
        {
          key: "Eligible Input Tax Credit",
          val: `- ₹${itcNum.toLocaleString()}`,
        },
        {
          key: "Net Tax Liability (Govt)",
          val: `₹${netLiabilityNum.toLocaleString()}`,
        },
      ]
    : [];

  // GST Registration specific details
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

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#0A2346" />

      {/* ---------------- ROYAL NAVY HEADER ---------------- */}
      <View style={[styles.navyHeader, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topNavRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{headerInfo.nav}</Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={{ paddingHorizontal: 2 }}>
          <Text style={styles.appIdLabel}>{`APPLICATION #${displayId}`}</Text>
          <Text style={styles.serviceTitle}>{headerInfo.title}</Text>
          <Text style={styles.serviceSubtitle}>{headerInfo.sub}</Text>
        </View>
      </View>

      {/* ---------------- 5 HORIZONTAL TABS ROW ---------------- */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab.id)}
                style={styles.tabItem}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? "#FF5722" : "#0A2346",
                      fontWeight: isActive ? "700" : "600",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {tab.id === "CHAT" && isLoans
                    ? "Chat with Loan Agent"
                    : tab.label}
                </Text>
                <View
                  style={
                    isActive
                      ? styles.activeTabIndicator
                      : styles.inactiveTabIndicator
                  }
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ---------------- SCROLLABLE BODY ---------------- */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* TAB 1: OVERVIEW */}
        {activeTab === "OVERVIEW" && (
          <>
            {/* GST Amendment Card */}
            {isGstAmendment && (
              <View style={styles.card}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: "#64748B",
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                      }}
                    >
                      APPLICATION ID
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "900",
                        color: "#0A2346",
                        marginTop: 2,
                      }}
                    >
                      {displayId}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: "#F3E8FF",
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#7E22CE",
                      }}
                    >
                      • Under Verification
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <View style={{ flex: 1.2 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#64748B",
                        fontWeight: "500",
                      }}
                    >
                      Section
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#0F172A",
                        marginTop: 2,
                      }}
                      numberOfLines={1}
                    >
                      {formData.section || "GST Amendment"}
                    </Text>
                  </View>
                  <View style={{ flex: 0.8, alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#64748B",
                        fontWeight: "500",
                      }}
                    >
                      GSTIN
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#0F172A",
                        marginTop: 2,
                      }}
                    >
                      {formData.gstin || "—"}
                    </Text>
                  </View>
                  <View style={{ flex: 0.8, alignItems: "flex-end" }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#64748B",
                        fontWeight: "500",
                      }}
                    >
                      Applied
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#0F172A",
                        marginTop: 2,
                      }}
                    >
                      {appliedDate}
                    </Text>
                  </View>
                </View>

                <View>
                  <View
                    style={{
                      height: 6,
                      backgroundColor: "#E2E8F0",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        width: "30%",
                        height: "100%",
                        backgroundColor: "#EA580C",
                        borderRadius: 3,
                      }}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#64748B",
                      textAlign: "right",
                      marginTop: 4,
                      fontWeight: "600",
                    }}
                  >
                    30% complete
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#083B75"
                />
                <Text style={styles.cardHeaderTitle}>
                  {isGstAmendment ? "Amendment Overview" : "Application Info"}
                </Text>
              </View>
              <View style={{ gap: 10 }}>
                {overviewRows.map((r, i) => (
                  <React.Fragment key={r.key}>
                    {i > 0 && <View style={styles.infoDivider} />}
                    <View style={styles.infoRow}>
                      <Text style={styles.infoKey}>{r.key}</Text>
                      <Text style={styles.infoVal}>{r.val}</Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </View>

            {/* Assigned CA Card with Direct Chat Action */}
            <View
              style={[
                styles.card,
                { backgroundColor: "#F8FAFC", borderColor: "#E2E8F0" },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    flex: 1,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: "#EAF2FF",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="person" size={22} color="#083B75" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#64748B",
                        fontWeight: "700",
                        textTransform: "uppercase",
                      }}
                    >
                      Assigned Executive
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: "#0F172A",
                        marginTop: 2,
                      }}
                    >
                      {assignedCA}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveTab("CHAT")}
                  style={{
                    backgroundColor: "#083B75",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Ionicons
                    name="chatbubbles-outline"
                    size={15}
                    color="#FFFFFF"
                  />
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    {isLoans ? "Chat with Loan Agent" : "Chat with CA"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* GST Filing Details */}
            {filingRows.length > 0 && (
              <View style={styles.card}>
                <View
                  style={[
                    styles.cardHeaderRow,
                    { justifyContent: "space-between" },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color="#083B75"
                    />
                    <Text style={styles.cardHeaderTitle}>Filing Details</Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      router.push(
                        `/service/gst-filing?appId=${app.id}&step=2` as any,
                      )
                    }
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      borderWidth: 1,
                      borderColor: "#EA580C",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 14,
                    }}
                  >
                    <Ionicons name="eye-outline" size={12} color="#EA580C" />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: "#EA580C",
                      }}
                    >
                      Review & Edit
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={{ gap: 10 }}>
                  {filingRows.map((r, i) => (
                    <React.Fragment key={r.key}>
                      {i > 0 && <View style={styles.infoDivider} />}
                      <View style={styles.infoRow}>
                        <Text style={styles.infoKey}>{r.key}</Text>
                        <Text
                          style={[
                            styles.infoVal,
                            r.key === "GSTIN"
                              ? { letterSpacing: 0.5, color: "#EA580C" }
                              : null,
                          ]}
                        >
                          {r.val}
                        </Text>
                      </View>
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}

            {/* Estimated Tax Computation */}
            {estimateRows.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <Ionicons
                    name="calculator-outline"
                    size={20}
                    color="#083B75"
                  />
                  <Text style={styles.cardHeaderTitle}>
                    Tax Computation (Estimated)
                  </Text>
                </View>
                <View style={{ gap: 10 }}>
                  {estimateRows.map((r, i) => (
                    <React.Fragment key={r.key}>
                      {i > 0 && <View style={styles.infoDivider} />}
                      <View style={styles.infoRow}>
                        <Text style={styles.infoKey}>{r.key}</Text>
                        <Text
                          style={[
                            styles.infoVal,
                            r.key.includes("Credit")
                              ? { color: "#059669" }
                              : null,
                          ]}
                        >
                          {r.val}
                        </Text>
                      </View>
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}

            {/* Business Registration Details */}
            {registrationRows.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <Ionicons name="business-outline" size={20} color="#083B75" />
                  <Text style={styles.cardHeaderTitle}>
                    Business Registration Details
                  </Text>
                </View>
                <View style={{ gap: 10 }}>
                  {registrationRows.map((r, i) => (
                    <React.Fragment key={r.key}>
                      {i > 0 && <View style={styles.infoDivider} />}
                      <View style={styles.infoRow}>
                        <Text style={styles.infoKey}>{r.key}</Text>
                        <Text style={styles.infoVal}>{r.val}</Text>
                      </View>
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}

            {(() => {
              let parsedCurrent: Record<string, any> = {};
              let parsedRequested: Record<string, any> = {};
              try {
                parsedCurrent =
                  typeof formData.currentValues === "string"
                    ? JSON.parse(formData.currentValues || "{}")
                    : formData.currentValues || {};
              } catch {}
              try {
                parsedRequested =
                  typeof formData.requestedValues === "string"
                    ? JSON.parse(formData.requestedValues || "{}")
                    : formData.requestedValues || {};
              } catch {}
              const hasRequested = Object.keys(parsedRequested).length > 0;
              if (!isGstAmendment || !hasRequested) return null;

              return (
                <View style={[styles.card, { marginTop: 14 }]}>
                  <View style={styles.cardHeaderRow}>
                    <Ionicons
                      name="swap-horizontal-outline"
                      size={20}
                      color="#083B75"
                    />
                    <Text style={styles.cardHeaderTitle}>
                      Requested Changes
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: "#F8FAFC",
                        borderRadius: 10,
                        padding: 10,
                        borderWidth: 1,
                        borderColor: "#E2E8F0",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: "#64748B",
                          textTransform: "uppercase",
                          marginBottom: 6,
                        }}
                      >
                        Current
                      </Text>
                      {Object.entries(parsedCurrent).map(([k, v]) => (
                        <View key={k} style={{ marginBottom: 6 }}>
                          <Text style={{ fontSize: 10.5, color: "#94A3B8" }}>
                            {k}
                          </Text>
                          <Text
                            style={{
                              fontSize: 12.5,
                              fontWeight: "600",
                              color: "#0F172A",
                            }}
                          >
                            {String(v)}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: "#EFF6FF",
                        borderRadius: 10,
                        padding: 10,
                        borderWidth: 1,
                        borderColor: "#BFDBFE",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: "#083B75",
                          textTransform: "uppercase",
                          marginBottom: 6,
                        }}
                      >
                        Requested
                      </Text>
                      {Object.entries(parsedRequested).map(([k, v]) => (
                        <View key={k} style={{ marginBottom: 6 }}>
                          <Text style={{ fontSize: 10.5, color: "#64748B" }}>
                            {k}
                          </Text>
                          <Text
                            style={{
                              fontSize: 12.5,
                              fontWeight: "700",
                              color: "#083B75",
                            }}
                          >
                            {String(v)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              );
            })()}
            {/* Contact Support Card */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: "#F0F9FF",
                  borderColor: "#BAE6FD",
                  borderWidth: 1,
                },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <Ionicons name="headset-outline" size={20} color="#0369A1" />
                <Text style={[styles.cardHeaderTitle, { color: "#0369A1" }]}>
                  Contact Support
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 12.5,
                  color: "#475569",
                  lineHeight: 18,
                  marginBottom: 14,
                }}
              >
                Need help with your application? Our CA team is available Mon–Sat 9am–6pm.
              </Text>
              <View style={{ gap: 10 }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    Linking.openURL("tel:+918800123456");
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderWidth: 1,
                    borderColor: "#E0F2FE",
                  }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: "#EFF6FF",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="call" size={16} color="#083B75" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>
                      Call Us
                    </Text>
                    <Text style={{ fontSize: 13, color: "#0A2346", fontWeight: "700" }}>
                      +91 8800 123 456
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#EA580C" />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    Linking.openURL("https://wa.me/918800123456?text=Hi%2C%20I%20need%20help%20with%20my%20TaxEdge%20application%20" + encodeURIComponent(app.id));
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderWidth: 1,
                    borderColor: "#E0F2FE",
                  }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: "#F0FDF4",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color="#16A34A" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>
                      WhatsApp Support
                    </Text>
                    <Text style={{ fontSize: 13, color: "#0A2346", fontWeight: "700" }}>
                      Chat with a CA Now
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#EA580C" />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    Linking.openURL("mailto:support@taxedge.in?subject=Help with Application " + encodeURIComponent(app.id));
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderWidth: 1,
                    borderColor: "#E0F2FE",
                  }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: "#FFF1E8",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="mail" size={16} color="#EA580C" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>
                      Email Support
                    </Text>
                    <Text style={{ fontSize: 13, color: "#0A2346", fontWeight: "700" }}>
                      support@taxedge.in
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#EA580C" />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    router.push("/chat/support" as any);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderWidth: 1,
                    borderColor: "#E0F2FE",
                  }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: "#EFF6FF",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={16} color="#083B75" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>
                      In-App Support Ticket
                    </Text>
                    <Text style={{ fontSize: 13, color: "#0A2346", fontWeight: "700" }}>
                      Chat with TaxEdge Support
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#EA580C" />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* TAB 2: STATUS */}
        {activeTab === "STATUS" && (
          <View style={{ gap: 14 }}>
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="git-branch-outline" size={20} color="#083B75" />
                <Text style={styles.cardHeaderTitle}>Status Timeline</Text>
              </View>
              <View style={{ paddingLeft: 4, paddingTop: 4 }}>
                {timelineSteps.map((step, index) => {
                  const isLast = index === timelineSteps.length - 1;
                  const isCompleted = step.status === "completed";
                  const isCurrent = step.status === "current";
                  return (
                    <View
                      key={index}
                      style={{ flexDirection: "row", marginBottom: 6 }}
                    >
                      <View
                        style={{
                          alignItems: "center",
                          width: 28,
                          marginRight: 10,
                        }}
                      >
                        {isCompleted ? (
                          <View style={styles.completedCircle}>
                            <Ionicons name="checkmark" size={12} color="#FFF" />
                          </View>
                        ) : isCurrent ? (
                          <View
                            style={[
                              styles.completedCircle,
                              { backgroundColor: "#EA580C" },
                            ]}
                          >
                            <Text
                              style={{
                                fontSize: 11,
                                fontWeight: "800",
                                color: "#FFF",
                              }}
                            >
                              {index + 1}
                            </Text>
                          </View>
                        ) : (
                          <View
                            style={[
                              styles.pendingCircle,
                              {
                                justifyContent: "center",
                                alignItems: "center",
                              },
                            ]}
                          >
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: "700",
                                color: "#94A3B8",
                              }}
                            >
                              {index + 1}
                            </Text>
                          </View>
                        )}
                        {!isLast && (
                          <View
                            style={[
                              styles.timelineConnectingLine,
                              {
                                backgroundColor: isCompleted
                                  ? "#16A34A"
                                  : isCurrent
                                    ? "#FED7AA"
                                    : "#E2E8F0",
                              },
                            ]}
                          />
                        )}
                      </View>
                      <View style={styles.timelineContentCol}>
                        <View style={styles.timelineStepTopRow}>
                          <Text
                            style={[
                              styles.timelineStepTitle,
                              {
                                color: isCurrent
                                  ? "#EA580C"
                                  : isCompleted
                                    ? "#0F172A"
                                    : "#64748B",
                                fontWeight:
                                  isCurrent || isCompleted ? "700" : "600",
                              },
                            ]}
                          >
                            {step.title}
                          </Text>
                          {step.date && (
                            <Text style={styles.timelineStepDate}>
                              {step.date}
                            </Text>
                          )}
                        </View>
                        <Text style={styles.timelineStepSub}>
                          {step.description}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Status Discussion Shortcut */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setActiveTab("CHAT")}
              style={[
                styles.card,
                {
                  backgroundColor: "#FFF2EA",
                  borderColor: "#FED7AA",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  flex: 1,
                }}
              >
                <Ionicons name="chatbubbles" size={24} color="#EA580C" />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 13.5,
                      fontWeight: "700",
                      color: "#0A2346",
                    }}
                  >
                    Need clarification on this status?
                  </Text>
                  <Text
                    style={{ fontSize: 11.5, color: "#64748B", marginTop: 2 }}
                  >
                    Discuss directly with {assignedCA}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#EA580C" />
            </TouchableOpacity>

            {/* Withdraw Application Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                useApplicationStore.getState().deleteApplication(app.id);
                router.replace("/(main)/applications");
              }}
              style={[
                styles.actionBtnFilled,
                {
                  backgroundColor: "#FFFFFF",
                  borderColor: "#EF4444",
                  borderWidth: 1,
                  marginTop: 8,
                },
              ]}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={[styles.actionBtnFilledText, { color: "#EF4444" }]}>
                Withdraw Application
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 3: DOCUMENTS */}
        {activeTab === "DOCUMENTS" && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="folder-open-outline" size={20} color="#083B75" />
              <Text style={styles.cardHeaderTitle}>
                {isGstAmendment ? "Supporting Documents" : "Required Documents"}
              </Text>
            </View>
            <View style={{ gap: 12 }}>
              {app.documents.length === 0 &&
              !(isGstAmendment && formData.document) ? (
                <View
                  style={{ alignItems: "center", paddingVertical: 36, gap: 8 }}
                >
                  <Ionicons
                    name="folder-open-outline"
                    size={44}
                    color="#94A3B8"
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#64748B",
                      textAlign: "center",
                    }}
                  >
                    No documents uploaded for this application.
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleDocumentUpload("Additional Document")}
                    style={[
                      styles.actionBtnFilled,
                      { marginTop: 12, paddingHorizontal: 16, height: 42 },
                    ]}
                  >
                    <Ionicons
                      name="cloud-upload-outline"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={styles.actionBtnFilledText}>
                      Upload Document
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {isGstAmendment && formData.document && (
                    <View style={styles.docItemCard}>
                      <View style={styles.docIconWrap}>
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#083B75"
                        />
                      </View>
                      <View
                        style={{
                          flex: 1,
                          paddingRight: 8,
                          justifyContent: "center",
                        }}
                      >
                        <Text style={styles.docNameText}>
                          {formData.document.name}
                        </Text>
                        {formData.document.size ? (
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#64748B",
                              marginTop: 2,
                            }}
                          >
                            {formData.document.size}
                          </Text>
                        ) : null}
                      </View>
                      <View style={styles.uploadedPill}>
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color="#083B75"
                        />
                        <Text style={styles.uploadedPillText}>Attached</Text>
                      </View>
                    </View>
                  )}
                  {app.documents.map((doc: any, i: number) => {
                    const isUploaded = doc.status === "Uploaded";
                    return (
                      <View key={i} style={styles.docItemCard}>
                        <View style={styles.docIconWrap}>
                          <Ionicons
                            name={
                              isUploaded
                                ? "checkmark-circle"
                                : "document-text-outline"
                            }
                            size={24}
                            color={isUploaded ? "#059669" : "#EA580C"}
                          />
                        </View>
                        <View
                          style={{
                            flex: 1,
                            paddingRight: 8,
                            justifyContent: "center",
                          }}
                        >
                          <Text style={styles.docNameText}>{doc.name}</Text>
                          {doc.fileUri && (
                            <Text
                              style={{
                                fontSize: 11,
                                color: "#64748B",
                                marginTop: 2,
                              }}
                              numberOfLines={1}
                            >
                              {doc.fileUri.split("/").pop()}
                            </Text>
                          )}
                        </View>
                        {!isUploaded ? (
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => handleDocumentUpload(doc.name)}
                            style={styles.uploadPeachBtn}
                          >
                            <Text style={styles.uploadPeachBtnText}>
                              Upload
                            </Text>
                            <Ionicons
                              name="cloud-upload-outline"
                              size={15}
                              color="#EA580C"
                            />
                          </TouchableOpacity>
                        ) : (
                          <View
                            style={[
                              styles.uploadedPill,
                              { backgroundColor: "#ECFDF5" },
                            ]}
                          >
                            <Ionicons
                              name="checkmark-circle"
                              size={14}
                              color="#059669"
                            />
                            <Text
                              style={[
                                styles.uploadedPillText,
                                { color: "#059669" },
                              ]}
                            >
                              Uploaded
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </>
              )}
            </View>
          </View>
        )}

        {/* TAB 4: PAYMENTS */}
        {activeTab === "PAYMENTS" && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="card-outline" size={20} color="#083B75" />
              <Text style={styles.cardHeaderTitle}>Payment Summary</Text>
            </View>
            <View style={{ gap: 10 }}>
              {paymentRows.map((r, i) => (
                <React.Fragment key={r.key}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>{r.key}</Text>
                    <Text
                      style={[
                        styles.infoVal,
                        r.key === "Transaction ID"
                          ? { fontSize: 12.5, color: "#64748B" }
                          : null,
                      ]}
                    >
                      {r.val}
                    </Text>
                  </View>
                  <View style={styles.infoDivider} />
                </React.Fragment>
              ))}
              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoKey,
                    { fontWeight: "700", color: "#0A2346" },
                  ]}
                >
                  Total Amount
                </Text>
                <Text
                  style={[styles.infoVal, { color: "#EA580C", fontSize: 16 }]}
                >
                  {isGstAmendment
                    ? "₹0 (Free)"
                    : `₹${totalAmount.toLocaleString()}`}
                </Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Payment Status</Text>
                <View
                  style={[
                    styles.statusPillSmall,
                    {
                      backgroundColor:
                        isGstAmendment || isPaid ? "#ECFDF5" : "#FFF1E8",
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: isGstAmendment || isPaid ? "#059669" : "#EA580C",
                    }}
                  >
                    {isGstAmendment ? "Complimentary" : app.paymentStatus}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* TAB 5: CHAT WITH CA */}
        {activeTab === "CHAT" && (
          <View style={{ gap: 14 }}>
            <View style={[styles.card, { paddingBottom: 16 }]}>
              <View style={styles.cardHeaderRow}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={20}
                  color="#083B75"
                />
                <Text style={styles.cardHeaderTitle}>CA Consultation</Text>
              </View>

              {!app.chatHistory || app.chatHistory.length === 0 ? (
                <View style={styles.emptyChatWrap}>
                  <View style={styles.emptyChatIconCircle}>
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={30}
                      color="#FF5722"
                    />
                  </View>
                  <Text style={styles.emptyChatTitle}>
                    Direct CA Consultation
                  </Text>
                  <Text style={styles.emptyChatSubtitle}>
                    Have questions about this application? Send a direct message
                    to {assignedCA}.
                  </Text>
                  <View style={styles.chatSecurityBadge}>
                    <Ionicons
                      name="shield-checkmark"
                      size={14}
                      color="#059669"
                    />
                    <Text style={styles.chatSecurityText}>
                      Application-Specific & Confidential
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={{ paddingVertical: 6 }}>
                  {app.chatHistory.map((msg) => {
                    const isUser = msg.sender === "user";
                    return (
                      <View
                        key={msg.id}
                        style={
                          isUser ? styles.chatBubbleUser : styles.chatBubbleCA
                        }
                      >
                        <Text
                          style={[
                            styles.chatSenderLabel,
                            { color: isUser ? "#FED7AA" : "#083B75" },
                          ]}
                        >
                          {isUser
                            ? "You"
                            : assignedCA !== "CA not assigned yet"
                              ? assignedCA
                              : "TaxEdge CA"}
                        </Text>
                        <Text
                          style={
                            isUser ? styles.chatTextUser : styles.chatTextCA
                          }
                        >
                          {msg.text}
                        </Text>
                        <Text
                          style={
                            isUser ? styles.chatTimeUser : styles.chatTimeCA
                          }
                        >
                          {formatDisplayDate(msg.timestamp)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ---------------- BOTTOM ACTION BAR ---------------- */}
      {activeTab === "CHAT" ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={
            Platform.OS === "ios" ? insets.bottom + 20 : 0
          }
        >
          <View
            style={[
              styles.chatInputBar,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
          >
            <TextInput
              style={styles.chatTextInput}
              placeholder={`Message ${assignedCA}...`}
              placeholderTextColor="#94A3B8"
              value={chatInput}
              onChangeText={setChatInput}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSendMessage}
              disabled={!chatInput.trim() || isSendingChat}
              style={[
                styles.chatSendBtn,
                { opacity: !chatInput.trim() || isSendingChat ? 0.5 : 1 },
              ]}
            >
              {isSendingChat ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <View
          style={[
            styles.bottomActionBar,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab("CHAT")}
            style={styles.actionBtnFilled}
          >
            <Ionicons name="chatbubbles-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionBtnFilledText}>
              {isLoans ? "Chat with Loan Agent" : "Chat with CA"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
