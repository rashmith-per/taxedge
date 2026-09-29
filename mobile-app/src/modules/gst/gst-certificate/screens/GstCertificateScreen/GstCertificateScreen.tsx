import React, { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Animated, Platform, BackHandler } from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { GstSelectModal } from "@/modules/gst/components/common";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { GstValidators } from "@/modules/gst/utils/gstValidators";
import { useAuthStore } from "@/store/authStore";
import { useApplicationStore } from "@/store/applicationStore";
import { useGstStore } from "@/modules/gst/store/gstStore";
import { notificationService } from "@/modules/notifications/services/notificationService";
import { getInitialGstDocuments } from "@/modules/gst/types/gstDocumentConfig";
import { st } from "./GstCertificateScreen.styles";

const CERTIFICATE_REQUEST_TYPES = ["Download Existing Certificate (Form REG-06)", "Request Reprint / Duplicate Copy", "Certificate Verification & Status Check"];

const buildCertificateHtml = (d: any): string => `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
@page{size:A4 portrait;margin:8mm}body{font-family:Arial,Helvetica,sans-serif;color:#0F172A;margin:0;padding:6px;font-size:10.5px}
.box{border:2px solid #1E5EFF;padding:6px}.in-box{border:1px solid #1E5EFF;padding:8px}.hdr{text-align:center;margin-bottom:6px}
.banner{background:#FFF7ED;border:1px dashed #FF7A00;color:#FF7A00;text-align:center;padding:5px;font-size:9.5px;font-weight:800;letter-spacing:0.8px;margin-bottom:6px}
.h1{font-size:12.5px;font-weight:800;color:#1E5EFF;letter-spacing:1px}.h2{font-size:9.5px;font-weight:700;color:#334155;margin:2px 0}
.title{font-size:15px;font-weight:900;color:#1E5EFF;margin:3px 0}.sub{font-size:9.5px;color:#475569}.tbl{width:100%;border-collapse:collapse;margin:5px 0;page-break-inside:avoid}
td,th{border:1px solid #CBD5E1;padding:4px 6px;font-size:10px;vertical-align:top;word-break:break-word}.lbl{width:33%;background:#F8FAFC;font-weight:700;color:#1E293B}
.sec-hdr{background:#EFF6FF;color:#1E5EFF;font-weight:800;font-size:10px}.ftr-bar{background:#1E5EFF;color:#FFF;text-align:center;padding:4px;font-size:9px;font-weight:700;margin-top:6px}
.bot-note{display:flex;justify-content:space-between;font-size:8px;color:#64748B;margin-top:3px}.badge{border:1px solid #1E5EFF;padding:4px 8px;border-radius:4px;font-size:8.5px;color:#1E5EFF;text-align:left}
</style></head><body><div class="box"><div class="in-box">
<div class="banner">SAMPLE / NOT A GOVERNMENT CERTIFICATE • TAXEDGE DEMO COPY</div>
<div style="display:flex;justify-content:space-between;align-items:flex-start"><div style="font-size:8.5px;font-weight:700;color:#64748B">FORM GST REG-06</div>
<div class="hdr" style="flex:1"><div class="h1">GOVERNMENT OF INDIA</div><div class="h2">MINISTRY OF FINANCE • GOODS AND SERVICES TAX</div>
<div class="title">CERTIFICATE OF REGISTRATION</div><div class="sub">[See Rule 10(1) of the CGST Rules, 2017]</div>
<div style="font-size:8px;color:#FF7A00;font-weight:700;margin-top:1px">TaxEdge Demo / Digitally Generated Copy</div></div>
<div style="text-align:right"><span style="font-size:14px;font-weight:900;color:#1E5EFF">GST</span><div style="font-size:7.5px;color:#64748B">1/1</div></div></div>
<table class="tbl">
<tr><td style="width:5%">1.</td><td class="lbl">GSTIN</td><td style="font-weight:800;color:#1E5EFF">${d.gstin}</td></tr><tr><td>2.</td><td class="lbl">Legal Name of Business</td><td style="font-weight:700">${d.legalName}</td></tr>
<tr><td>3.</td><td class="lbl">Trade Name, if any</td><td>${d.tradeName}</td></tr><tr><td>4.</td><td class="lbl">Constitution of Business</td><td>${d.constitution}</td></tr>
<tr><td>5.</td><td class="lbl">Address of Principal Place of Business</td><td>${d.address}</td></tr><tr><td>6.</td><td class="lbl">Date of Liability</td><td>${d.liabilityDate || "Applicable under Act"}</td></tr>
<tr><td>7.</td><td class="lbl">Period of Validity</td><td>From ${d.validityFrom || "Registration Date"} To -----------</td></tr><tr><td>8.</td><td class="lbl">Type of Registration</td><td>${d.regType}</td></tr>
<tr><td>9.</td><td class="lbl">Date of Registration</td><td>${d.regDate}</td></tr><tr><td>10.</td><td class="lbl">Date of Issue of Certificate</td><td>${d.issueDate}</td></tr>
</table>
${d.additionalPlaces?.length ? `<table class="tbl"><tr class="sec-hdr"><th colspan="2">Details of Additional Places of Business</th></tr><tr><th style="width:10%">Sl. No.</th><th>Address</th></tr>${d.additionalPlaces.map((a: string, i: number) => `<tr><td>${i + 1}.</td><td>${a}</td></tr>`).join("")}</table>` : ""}
${d.signatories?.length ? `<table class="tbl"><tr class="sec-hdr"><th colspan="3">Details of Proprietor / Partners / Directors / Promoters</th></tr><tr><th style="width:10%">Sl. No.</th><th>Name</th><th>Designation</th></tr>${d.signatories.map((s: any, i: number) => `<tr><td>${i + 1}.</td><td style="font-weight:700">${s.name}</td><td>${s.designation}</td></tr>`).join("")}</table>` : ""}
${d.activities?.length ? `<table class="tbl"><tr class="sec-hdr"><th colspan="2">Nature of Business Activities</th></tr><tr>${d.activities.map((act: string, i: number) => `<td>${i + 1}. ${act}</td>`).join("")}</tr></table>` : ""}
<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">
<div class="badge"><b style="color:#1E5EFF">TaxEdge Certificate Information</b><br>GSTIN: ${d.gstin}<br>Certificate Type: Form GST REG-06<br>Generated: ${d.issueDate}<br>Status: Digitally Generated Demo Copy</div>
<div style="width:55%;border:1px dashed #CBD5E1;padding:6px;font-size:8.5px;color:#475569;text-align:center">This document is generated by TaxEdge for demonstration purposes and is not an official government-issued certificate.</div>
</div>
<div class="ftr-bar">TAXEDGE • DIGITALLY GENERATED DEMO CERTIFICATE</div>
<div class="bot-note"><span>TaxEdge Demo Copy • Not a Government Document</span><span>Form GST REG-06 Reference</span></div>
</div></div></body></html>`;

interface SectionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}

function SectionCard({ icon, title, action, children }: SectionCardProps) {
  return (
    <View style={st.card}>
      <View style={st.contactHeaderRow}>
        <View style={st.cardHeaderRow}>
          <View style={st.cardIconBox}>
            <Ionicons name={icon} size={18} color="#1E5EFF" />
          </View>
          <Text style={st.cardLabel}>{title}</Text>
        </View>
        {action}
      </View>
      {children}
    </View>
  );
}

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  onPress: () => void;
  outline?: boolean;
  variant?: "primary" | "outline" | "text";
  onPressIn?: () => void;
  onPressOut?: () => void;
}

function ActionButton({ icon, text, onPress, outline, variant, onPressIn, onPressOut }: ActionButtonProps) {
  const isPrimary = variant === "primary" || outline === false;
  const isText = variant === "text";

  if (isPrimary) {
    return (
      <TouchableOpacity style={st.orangeCta} activeOpacity={0.9} onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress}>
        <Ionicons name={icon} size={20} color="#FFF" style={{ marginRight: 8 }} />
        <Text style={st.orangeCtaText}>{text}</Text>
      </TouchableOpacity>
    );
  }
  if (isText) {
    return (
      <TouchableOpacity style={st.textOnlyBtn} activeOpacity={0.8} onPress={onPress}>
        <Ionicons name={icon} size={16} color="#64748B" style={{ marginRight: 6 }} />
        <Text style={st.textOnlyBtnText}>{text}</Text>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity style={st.blueOutlineBtn} activeOpacity={0.8} onPress={onPress}>
      <Ionicons name={icon} size={18} color="#1E5EFF" style={{ marginRight: 8 }} />
      <Text style={st.blueOutlineBtnText}>{text}</Text>
    </TouchableOpacity>
  );
}

export function GstCertificateScreen() {
  const router = useRouter(), insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ gstin?: string; legalName?: string; tradeName?: string; constitution?: string; address?: string; signatoryName?: string; director?: string; state?: string }>();
  const customer = useAuthStore((s) => s.customer), applications = useApplicationStore((s) => s.applications);
  const saveGstCertificateDraft = useApplicationStore((s) => s.saveGstCertificateDraft);
  const clearGstCertificateDraft = useApplicationStore((s) => s.clearGstCertificateDraft);
  const gstCertificateDraft = useApplicationStore((s) => s.gstCertificateDraft);
  const createApplication = useApplicationStore((s) => s.createApplication);
  const gstDraft = useApplicationStore((s) => s.gstDraft), registrationDraft = useGstStore((s) => s.registrationDraft);
  const registeredMobile = customer?.mobile ? `+91 ${customer.mobile}` : "+91 9347074726", registeredEmail = customer?.email || "user@taxedge.in";
  const [gstin, setGstin] = useState(params.gstin || "");
  const [requestType, setRequestType] = useState("Download Existing Certificate (Form REG-06)"), [showTypeModal, setShowTypeModal] = useState(false);
  const [error, setError] = useState(""), [gstinError, setGstinError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false), [isCompleted, setIsCompleted] = useState(false);
  const [certificatePdfUri, setCertificatePdfUri] = useState<string | null>(null), [generatedFileName, setGeneratedFileName] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const floatAnim = useRef(new Animated.Value(0)).current, btnScale = useRef(new Animated.Value(1)).current, fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (gstCertificateDraft?.formData) {
      if (gstCertificateDraft.formData.gstin && !gstin) {
        setGstin(gstCertificateDraft.formData.gstin);
      }
      if (gstCertificateDraft.formData.requestType) {
        setRequestType(gstCertificateDraft.formData.requestType);
      }
    }
  }, [gstCertificateDraft]);

  useEffect(() => {
    if (!isCompleted) return;
    const backAction = () => {
      router.replace("/(main)/applications");
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [isCompleted]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([Animated.timing(floatAnim, { toValue: -6, duration: 1800, useNativeDriver: true }), Animated.timing(floatAnim, { toValue: 0, duration: 1800, useNativeDriver: true })])).start();
  }, [isCompleted]);

  const { showDraftModal, markSubmitted, handleSaveAndExit, handleDiscardAndExit, handleCancel } = useUniversalDraftGuard({
    isDirty: () => Boolean(gstin),
    onSaveDraft: () => {
      saveGstCertificateDraft({
        formData: { gstin, requestType },
        step: 0,
        updatedAt: new Date().toISOString().split("T")[0],
      });
    },
    onDiscardDraft: () => { clearGstCertificateDraft(); },
    isSubmitted: () => isCompleted,
  });

  const handleGstinChange = (text: string) => { setGstin(text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()); setGstinError(""); };
  const getButtonText = () => isProcessing ? "GENERATING CERTIFICATE..." : "DOWNLOAD CERTIFICATE (REG-06)";

  const findRegistrationData = (targetGstin: string) => {
    const clean = targetGstin.trim().toUpperCase();
    const app = applications.find((a) => a.formData?.gstin?.toUpperCase() === clean) || applications.find((a) => a.serviceId === "gst-registration");
    const fd = app?.formData || {}, dBiz = gstDraft?.businessData || {}, sDraft = (registrationDraft || {}) as any, cust = customer || ({} as any);
    const stateMap: Record<string, string> = { "07": "Delhi", "24": "Gujarat", "27": "Maharashtra", "29": "Karnataka", "33": "Tamil Nadu", "36": "Telangana", "19": "West Bengal", "09": "Uttar Pradesh", "06": "Haryana", "08": "Rajasthan", "32": "Kerala", "37": "Andhra Pradesh" };
    const state = params.state || fd.state || dBiz.state || sDraft.state || cust.state || stateMap[clean.slice(0, 2)] || "";

    const legalName = params.legalName || fd.legalName || dBiz.legalName || sDraft.legalName || cust.businessName || cust.name || (clean ? `ENTERPRISE ${clean}` : "TAXPAYER ENTERPRISE");
    const tradeName = params.tradeName || fd.businessName || dBiz.businessName || sDraft.businessName || legalName;
    const constitution = params.constitution || fd.businessType || dBiz.businessType || sDraft.constitution || "Private Limited Company";

    const addrParts = [fd.businessAddress || dBiz.businessAddress, fd.city || dBiz.city, fd.district || dBiz.district, state, fd.pinCode || dBiz.pinCode].filter(Boolean);
    const address = params.address || (addrParts.length > 0 ? addrParts.join(", ") : (cust.address || (state ? `Registered Office, ${state}` : "Registered Business Address")));

    const sigName = params.director || params.signatoryName || fd.signatoryName || dBiz.signatoryName || cust.name || "";
    const sigDesignation = fd.signatoryDesignation || dBiz.signatoryDesignation || "Director";
    const signatories = sigName ? [{ name: sigName.toUpperCase(), designation: sigDesignation }] : [];

    const additionalPlaces = (fd.additionalAddress ? [fd.additionalAddress] : (dBiz.additionalAddress ? [dBiz.additionalAddress] : [])).filter(Boolean);
    const natureStr = fd.natureOfBusiness || dBiz.natureOfBusiness || "";
    const activities = natureStr ? natureStr.split(",").map((s: string) => s.trim()).filter(Boolean) : [];

    return {
      gstin: clean, legalName: String(legalName).toUpperCase(), tradeName: String(tradeName).toUpperCase(), constitution, address,
      liabilityDate: fd.businessStartDate || dBiz.businessStartDate || "", validityFrom: fd.businessStartDate || dBiz.businessStartDate || "01/04/2026",
      regType: fd.compositionScheme?.includes("composition") ? "Composition" : "Regular",
      regDate: fd.appliedDate || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }),
      issueDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }),
      additionalPlaces, signatories, activities, state,
    };
  };

  const downloadAndSharePdf = async (uri: string, fileName: string) => {
    try {
      if (Platform.OS === "web") {
        const link = document.createElement("a"); link.href = uri; link.download = fileName; link.click(); return;
      }
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: fileName, UTI: "com.adobe.pdf" });
      } else {
        Alert.alert("Certificate Ready", `PDF generated successfully as ${fileName}`);
      }
    } catch (err: any) {
      if (err?.message?.includes?.("cancel") || err?.message?.includes?.("dismiss")) return;
      Alert.alert("Certificate Ready", `Your certificate PDF (${fileName}) is ready.`);
    }
  };

  const handleAction = async () => {
    if (!GstValidators.isValidGstin(gstin)) { setGstinError("Enter a valid 15-character GSTIN (e.g. 29AAAAA0000A1Z5)"); Alert.alert("Invalid GSTIN", "Please enter a valid 15-character GSTIN to download certificate."); return; }
    if (!requestType) { setError("Please select a request type."); return; }
    setIsProcessing(true);
    try {
      const regData = findRegistrationData(gstin);
      const cleanGstin = regData.gstin.replace(/[^a-zA-Z0-9]/g, "");
      const fileName = cleanGstin ? `GST-Certificate-${cleanGstin}.pdf` : "GST-Certificate.pdf";
      const html = buildCertificateHtml(regData);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      setCertificatePdfUri(uri);
      setGeneratedFileName(fileName);
      markSubmitted();
      setIsCompleted(true);
      try {
        createApplication(
          "gst-certificate",
          "GST Certificate (REG-06)",
          "GST",
          {
            gstin: regData.gstin,
            legalName: regData.legalName,
            tradeName: regData.tradeName,
            constitution: regData.constitution,
            address: regData.address,
            requestType,
            issueDate: regData.issueDate,
          },
          getInitialGstDocuments("gst-certificate"),
          0,
          "Paid"
        );
      } catch {}
      clearGstCertificateDraft();
      try { notificationService.notifyCertificateReady("GST", gstin); } catch {}
      await downloadAndSharePdf(uri, fileName);
    } catch {
      Alert.alert("Unable to create the certificate", "Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const pressIn = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();

  const handleDownload = () => {
    if (certificatePdfUri) {
      downloadAndSharePdf(certificatePdfUri, generatedFileName);
    } else {
      handleAction();
    }
  };

  const handleShare = () => {
    if (certificatePdfUri) {
      downloadAndSharePdf(certificatePdfUri, generatedFileName);
    }
  };

  const handleApplications = () => {
    router.replace("/(main)/applications");
  };

  const handleHome = () => {
    router.replace("/(main)/home");
  };

  const renderActionButton = (
    icon: keyof typeof Ionicons.glyphMap,
    text: string,
    onPress: () => void,
    variant: "primary" | "outline" | "text" = "outline",
    onPressIn?: () => void,
    onPressOut?: () => void
  ) => (
    <ActionButton
      icon={icon}
      text={text}
      onPress={onPress}
      variant={variant}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    />
  );

  const renderCertificateActions = () => (
    <Animated.View style={{ transform: [{ scale: btnScale }], width: "100%", marginTop: 18, gap: 10 }}>
      {renderActionButton("cloud-download-outline", "Download Certificate", handleDownload, "primary", pressIn, pressOut)}
      {renderActionButton("share-social-outline", "Share Certificate", handleShare, "outline")}
      {renderActionButton("briefcase-outline", "Track in My Applications", handleApplications, "outline")}
      {renderActionButton("home-outline", "Go to Home", handleHome, "text")}
    </Animated.View>
  );

  const renderCertificateFooter = () => (
    <View style={st.footerWrap}>
      <View style={st.footerRow}>
        <Ionicons name="shield-checkmark-outline" size={14} color="#1E5EFF" />
        <Text style={st.footerSafeText}>Your data is safe with us</Text>
      </View>
      <Text style={st.footerGovText}>TaxEdge Form GST REG-06 Generator</Text>
    </View>
  );

  if (isCompleted) {
    const detailRows = [
      { icon: "document-text-outline", label: "Document", val: "GST Registration Certificate" },
      { icon: "document-outline", label: "Format", val: "PDF" },
      { icon: "shield-checkmark-outline", label: "Status", isStatus: true },
      { icon: "calendar-outline", label: "Generated On", val: `${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` },
      { icon: "pricetag-outline", label: "File Name", val: generatedFileName || `GST-Certificate-${gstin}.pdf` },
    ];
    return (
      <View style={st.root}>
        <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={[st.topBar, { paddingTop: Math.max(insets.top, 12) + 4 }]}>
          <TouchableOpacity activeOpacity={0.7} onPress={handleApplications} style={st.backBtn}><Ionicons name="chevron-back" size={22} color="#0F172A" /></TouchableOpacity>
        </View>
        <ScrollView style={st.flex1} contentContainerStyle={st.readyScroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={[st.readyHeroWrap, { transform: [{ translateY: floatAnim }] }]}>
            <View style={st.podiumBase} /><View style={st.podiumRing} />
            <View style={st.readyDocCard}>
              <Text style={st.docGstTag}>GST</Text>
              <View style={st.docLineWide} /><View style={st.docLineMed} /><View style={st.docLineWide} />
              <View style={st.readyCheckBadge}><Ionicons name="checkmark" size={24} color="#FFF" /></View>
            </View>
            <View style={[st.confettiDot, { top: 12, left: 30, backgroundColor: "#FF7A00" }]} /><View style={[st.confettiDot, { top: 22, right: 34, backgroundColor: "#1E5EFF" }]} />
            <View style={[st.confettiDot, { bottom: 40, left: 16, backgroundColor: "#1E5EFF" }]} /><View style={[st.confettiDot, { bottom: 35, right: 20, backgroundColor: "#FF7A00" }]} />
          </Animated.View>
          <Text style={st.readyTitle}>Certificate <Text style={{ color: "#1E5EFF" }}>Ready!</Text></Text>
          <Text style={st.readySub}>Your GST Registration Certificate (Form REG-06) for <Text style={st.blueBold}>{gstin}</Text> is ready.</Text>
          <View style={st.detailsCard}>
            {detailRows.map((item, idx) => (
              <React.Fragment key={item.label}>
                {idx > 0 && <View style={st.divider} />}
                <View style={st.detailRow}>
                  <View style={st.detailIconBox}><Ionicons name={item.icon as any} size={17} color="#1E5EFF" /></View>
                  <Text style={st.detailLabel}>{item.label}</Text>
                  {item.isStatus ? <View style={st.statusPill}><Text style={st.statusPillText}>● Ready</Text></View> : <Text style={st.detailVal} numberOfLines={1}>{item.val}</Text>}
                </View>
              </React.Fragment>
            ))}
          </View>
          {renderCertificateActions()}
          {renderCertificateFooter()}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={st.root}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[st.topBar, { paddingTop: Math.max(insets.top, 12) + 4 }]}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} style={st.backBtn}><Ionicons name="chevron-back" size={22} color="#0F172A" /></TouchableOpacity>
        <Text style={st.headerTitle}>GST Certificate</Text>
        <View style={st.taxEdgeBadge}><Text style={st.taxText}>Tax</Text><Text style={st.edgeText}>Edge</Text></View>
      </View>
      <ScrollView style={st.flex1} contentContainerStyle={st.inputScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View style={[st.heroContainer, { opacity: fadeAnim }]}>
          <View style={st.heroLeft}>
            <Text style={st.heroKicker}>YOUR BUSINESS, OUR SUPPORT</Text>
            <Text style={st.heroTitle}>Get Your GST{"\n"}Registration Certificate</Text>
            <Text style={st.heroSub}>Download official Form REG-06 GST Registration Certificate with digital verification</Text>
          </View>
          <Animated.View style={[st.heroGraphicWrap, { transform: [{ translateY: floatAnim }] }]}>
            <View style={st.heroGlowCircle} />
            <View style={st.heroDoc}>
              <View style={st.heroDocHeader} /><Text style={st.heroDocGst}>GST</Text>
              <View style={st.heroDocLine} /><View style={st.heroDocLine} /><View style={st.heroDocLineShort} />
              <View style={st.heroDownloadCircle}><Ionicons name="arrow-down" size={16} color="#FFF" /></View>
            </View>
          </Animated.View>
        </Animated.View>
        <SectionCard icon="business" title={<>GSTIN (15-Character) <Text style={st.star}>*</Text></>}>
          <TextInput style={[st.input, isFocused && st.inputFocused, Boolean(gstinError) && st.inputError]} placeholder="e.g. 29AAAAA0000A1Z5" placeholderTextColor="#94A3B8" value={gstin} onChangeText={handleGstinChange} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} autoCapitalize="characters" maxLength={15} />
          {gstinError ? <Text style={st.errorText}>{gstinError}</Text> : <Text style={st.helperText}>Enter your 15-digit GST Identification Number</Text>}
        </SectionCard>
        <SectionCard
          icon="call"
          title="Registered Contact Authorization"
          action={
            <TouchableOpacity style={st.editBtn} activeOpacity={0.7}>
              <Ionicons name="create-outline" size={14} color="#1E5EFF" />
              <Text style={st.editText}>Edit</Text>
            </TouchableOpacity>
          }
        >
          <Text style={st.contactPhone}>{registeredMobile}</Text>
          <Text style={st.contactEmail}>{registeredEmail}</Text>
          <Text style={st.contactSubText}>Official certificate copy will be issued to registered signatory credentials</Text>
        </SectionCard>
        <SectionCard icon="document-text" title={<>Request Type <Text style={st.star}>*</Text></>}>
          <TouchableOpacity style={[st.dropdownBox, Boolean(error) && st.inputError]} activeOpacity={0.7} onPress={() => setShowTypeModal(true)}>
            <Text style={[st.dropdownText, !requestType && st.placeholderText]}>{requestType || "Select Request Type"}</Text>
            <Ionicons name="chevron-down" size={18} color="#64748B" />
          </TouchableOpacity>
          {error ? <Text style={st.errorText}>{error}</Text> : null}
        </SectionCard>
        <View style={st.infoCard}>
          <Ionicons name="information-circle" size={20} color="#1E5EFF" style={{ marginRight: 10 }} />
          <Text style={st.infoText}>Your certificate will be generated using your GST registration details and saved as a PDF on your device.</Text>
        </View>
        <Animated.View style={{ transform: [{ scale: btnScale }], marginTop: 6 }}>
          <TouchableOpacity style={[st.orangeCta, isProcessing && st.orangeCtaDisabled]} activeOpacity={0.9} onPressIn={pressIn} onPressOut={pressOut} onPress={handleAction} disabled={isProcessing}>
            <Text style={st.orangeCtaText}>{getButtonText()}</Text>
            <View style={st.ctaArrowCircle}><Ionicons name={isProcessing ? "sync-outline" : "arrow-forward"} size={16} color="#FF7A00" /></View>
          </TouchableOpacity>
        </Animated.View>
        <View style={st.footerRowCenter}><Ionicons name="shield-checkmark-outline" size={14} color="#64748B" style={{ marginRight: 6 }} /><Text style={st.verifiedText}>Secure • Reliable • TaxEdge Verified</Text></View>
      </ScrollView>
      <GstSelectModal visible={showTypeModal} title="Select Request Type" options={CERTIFICATE_REQUEST_TYPES} selectedValue={requestType} onSelect={(v) => { setRequestType(v); setError(""); }} onClose={() => setShowTypeModal(false)} />
      <UniversalDraftModal visible={showDraftModal} title="Save Progress?" message="You have unsaved changes in your GST certificate request. Save your progress so you can resume anytime without re-entering details." saveButtonText="Save as Draft & Exit" discardButtonText="Discard & Exit" cancelButtonText="Keep Editing" onSaveAndExit={handleSaveAndExit} onDiscardAndExit={handleDiscardAndExit} onCancel={handleCancel} />
    </View>
  );
}

export default GstCertificateScreen;
