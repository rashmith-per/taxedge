import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { BrandColors } from "@/shared/theme";
import { GstServiceBanner, GstSelectModal, GstDatePickerModal } from "@/modules/gst/components/common";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { GstValidators } from "@/modules/gst/utils/gstValidators";
import { pickImageFromCamera } from "@/modules/gst/utils/imageUploadHelper";
import { styles, CANCELLATION_REASONS, ACCEPTED_PROOFS } from "./GstCancellationScreen.styles";
import { useApplicationStore } from "@/store/applicationStore";
import { gstCancellationApi } from "@/modules/gst/services/gstCancellationApi";
import { GstCancellationSuccess } from "../../components/GstCancellationSuccess";
import { GstCancellationReview } from "../../components/GstCancellationReview";
import { GstSupportingProof } from "../../components/GstSupportingProof";

type Doc = { uri: string; name: string; size: string };
type Form = {
  gstin: string; reason: string; otherReason: string; cancellationDate: string;
  closingStock: string; pendingLiabilities: string; lastGstr3b: string;
  supportingDoc: Doc | null; isVoluntaryUnderOneYear: boolean | null;
  areAllReturnsFiled: boolean | null; isFinalReturnDeclared: boolean;
};

const emptyForm: Form = {
  gstin: "", reason: "", otherReason: "", cancellationDate: "",
  closingStock: "", pendingLiabilities: "", lastGstr3b: "", supportingDoc: null,
  isVoluntaryUnderOneYear: null, areAllReturnsFiled: null, isFinalReturnDeclared: false
};

export default function GstCancellationScreen() {
  const router = useRouter(), insets = useSafeAreaInsets();
  const [step, setStep] = useState<"FORM" | "REVIEW" | "SUCCESS">("FORM");
  const [form, setForm] = useState<Form>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reasonOpen, setReasonOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [proofsOpen, setProofsOpen] = useState(false);
  const [reviewDeclared, setReviewDeclared] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ arn: string; date: string; appId: string } | null>(null);

  const set = (k: keyof Form, v: any) => setForm(p => ({ ...p, [k]: v }));
  const clear = (k: string) => setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  const err = (k: string) => errors[k] ? <Text style={styles.errorText}>{errors[k]}</Text> : null;

  const { saveGstCancellationDraft, clearGstCancellationDraft } = useApplicationStore();
  const { showDraftModal, markSubmitted, handleSaveAndExit, handleDiscardAndExit, handleCancel } = useUniversalDraftGuard({
    isDirty: () => Boolean(form.gstin || form.reason || form.cancellationDate || form.closingStock || form.lastGstr3b || form.supportingDoc),
    onSaveDraft: () => saveGstCancellationDraft({
      formData: {
        gstin: form.gstin, reason: form.reason, otherReason: form.otherReason,
        cancellationDate: form.cancellationDate, closingStock: form.closingStock,
        pendingLiabilities: form.pendingLiabilities, lastGstr3b: form.lastGstr3b
      },
      step, updatedAt: new Date().toISOString().split("T")[0]
    }),
    onDiscardDraft: clearGstCancellationDraft,
    isSubmitted: () => step === "SUCCESS"
  });

  const pickDoc = async () => {
    try {
      const r = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
        copyToCacheDirectory: true
      });
      if (!r.canceled && r.assets?.[0]) {
        const f = r.assets[0];
        set("supportingDoc", {
          uri: f.uri, name: f.name,
          size: f.size ? `${(f.size / 1048576).toFixed(1)} MB` : "0.1 MB"
        });
      }
    } catch {
      Alert.alert("Picker Error", "Could not select document. Please try again.");
    }
  };

  const scanDoc = async () => {
    const uri = await pickImageFromCamera(false);
    if (uri) set("supportingDoc", { uri, name: `Scan_${Date.now().toString().slice(-4)}.jpg`, size: "1.2 MB" });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!GstValidators.isValidGstin(form.gstin)) e.gstin = "Please enter a valid 15-character GSTIN.";
    if (!form.reason) e.reason = "Please select a reason for cancellation.";
    if (form.reason === "Other Valid Reason" && !GstValidators.isNotEmpty(form.otherReason, 3)) e.otherReason = "Please specify the reason.";
    if (form.isVoluntaryUnderOneYear === null) e.isVoluntaryUnderOneYear = "Please answer this question.";
    else if (form.isVoluntaryUnderOneYear) e.isVoluntaryUnderOneYear = "You cannot cancel a voluntary registration before 1 year.";
    if (form.areAllReturnsFiled === null) e.areAllReturnsFiled = "Please answer this question.";
    else if (!form.areAllReturnsFiled) e.areAllReturnsFiled = "Please file all pending GST returns first.";
    if (!form.cancellationDate) e.cancellationDate = "Cancellation date is required.";
    if (!GstValidators.isNotEmpty(form.closingStock, 3)) e.closingStock = "Please enter closing stock details or 'Nil'.";
    if (!GstValidators.isNotEmpty(form.lastGstr3b, 3)) e.lastGstr3b = "Latest filed GSTR-3B ARN / period is required.";
    if (!form.isFinalReturnDeclared) e.declaration = "Please confirm the final return filing declaration.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    if (submitting) return;
    if (!reviewDeclared) {
      return Alert.alert("Declaration Required", "Please tick the declaration checkbox to authorise filing.");
    }
    setSubmitting(true);
    try {
      await gstCancellationApi.createCancellation({
        gstin: form.gstin, reason: form.reason, otherReason: form.otherReason,
        cancellationDate: form.cancellationDate, closingStock: form.closingStock,
        pendingLiabilities: form.pendingLiabilities, lastGstr3b: form.lastGstr3b,
        supportingDoc: form.supportingDoc
      });

      const arn = `AA290926${Math.floor(100000 + Math.random() * 900000)}`;
      const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

      const appId = useApplicationStore.getState().createApplication(
        "gst-cancellation", "GST Cancellation (REG-16)", "GST",
        {
          gstin: form.gstin, arn,
          reason: form.reason === "Other Valid Reason" ? form.otherReason : form.reason,
          cancellationDate: form.cancellationDate, closingStock: form.closingStock,
          pendingLiabilities: form.pendingLiabilities || "Nil", lastGstr3b: form.lastGstr3b,
          submissionDate: date, supportingDoc: form.supportingDoc?.name || "None"
        },
        form.supportingDoc ? [form.supportingDoc.name, "Last GSTR-3B Filing Proof"] : ["Last GSTR-3B Filing Proof", "Closing Stock Valuation"],
        0
      );

      setResult({ arn, date, appId });
      markSubmitted();
      setStep("SUCCESS");
    } catch (e: any) {
      Alert.alert("Submission Failed", e?.message || "Failed to submit GST Cancellation.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackPress = () => router.back();
  const toggleProofsOpen = () => setProofsOpen(p => !p);
  const toggleDeclaration = () => {
    set("isFinalReturnDeclared", !form.isFinalReturnDeclared);
    clear("declaration");
  };
  const handleReviewPress = () => {
    if (validate()) setStep("REVIEW");
  };

  const renderChoiceButton = (key: "isVoluntaryUnderOneYear" | "areAllReturnsFiled", value: boolean) => (
    <TouchableOpacity
      key={String(value)}
      style={[styles.selectBox, { flex: 1, alignItems: "center", justifyContent: "center" }, form[key] === value && { borderColor: BrandColors.PRIMARY_BLUE, backgroundColor: "#F0F9FF" }]}
      activeOpacity={0.7}
      onPress={() => { set(key, value); clear(key); }}
    >
      <Text style={[styles.selectText, form[key] === value && { color: BrandColors.PRIMARY_BLUE, fontWeight: "600" }]}>
        {value ? "Yes" : "No"}
      </Text>
    </TouchableOpacity>
  );

  const choice = (key: "isVoluntaryUnderOneYear" | "areAllReturnsFiled") => (
    <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
      {renderChoiceButton(key, true)}
      {renderChoiceButton(key, false)}
    </View>
  );

  const renderProofItem = (text: string, index: number) => (
    <View key={index} style={styles.acceptedProofItem}>
      <Text style={styles.acceptedProofBullet}>•</Text>
      <Text style={styles.acceptedProofText}>{text}</Text>
    </View>
  );

  const renderAcceptedProofs = () => (
    <View style={styles.acceptedProofsCard}>
      <View style={styles.acceptedProofsHeader}>
        <Ionicons name="information-circle" size={20} color={BrandColors.PRIMARY_ORANGE} />
        <Text style={styles.acceptedProofsTitle}>Accepted proofs</Text>
      </View>
      <View style={styles.acceptedProofList}>
        {renderProofItem(ACCEPTED_PROOFS[0], 0)}
        {renderProofItem(ACCEPTED_PROOFS[1], 1)}
        {renderProofItem(ACCEPTED_PROOFS[2], 2)}
        {proofsOpen && (
          <>
            {renderProofItem(ACCEPTED_PROOFS[3], 3)}
            {renderProofItem(ACCEPTED_PROOFS[4], 4)}
            {renderProofItem(ACCEPTED_PROOFS[5], 5)}
          </>
        )}
      </View>
      <TouchableOpacity style={styles.viewMoreBtn} activeOpacity={0.7} onPress={toggleProofsOpen}>
        <Text style={styles.viewMoreText}>{proofsOpen ? "View Less" : "View More"}</Text>
        <Ionicons name={proofsOpen ? "chevron-up" : "chevron-down"} size={14} color={BrandColors.PRIMARY_ORANGE} />
      </TouchableOpacity>
    </View>
  );

  const renderDeclaration = () => (
    <>
      <TouchableOpacity style={styles.declarationRow} activeOpacity={0.8} onPress={toggleDeclaration}>
        <View style={[styles.checkbox, form.isFinalReturnDeclared && styles.checkboxActive]}>
          {form.isFinalReturnDeclared && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.declarationLabel}>Final Return Declaration (GSTR-10) <Text style={styles.star}>*</Text></Text>
          <Text style={styles.declarationSubText}>I confirm all outward tax dues are settled and will file final return GSTR-10 within 3 months of cancellation order.</Text>
        </View>
      </TouchableOpacity>
      {err("declaration")}
    </>
  );

  const renderReviewButton = () => (
    <TouchableOpacity style={styles.actionOrangeBtn} activeOpacity={0.85} onPress={handleReviewPress}>
      <Text style={styles.actionOrangeBtnText}>Review Cancellation</Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
      <TouchableOpacity activeOpacity={0.7} onPress={handleBackPress} style={styles.backButton}>
        <Ionicons name="chevron-back" size={20} color={BrandColors.TEXT_PRIMARY} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>GST Cancellation</Text>
      <View style={styles.placeholderBox} />
    </View>
  );

  const input = (key: keyof Form, label: string, placeholder: string, required = true, area = false) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label} {required && <Text style={styles.star}>*</Text>}</Text>
      <TextInput
        style={[area ? styles.textArea : styles.input, errors[key] && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        {...(area ? { multiline: true, numberOfLines: 4, maxLength: 300 } : key === "gstin" ? { maxLength: 15 } : {})}
        value={String(form[key] ?? "")}
        onChangeText={t => {
          const v = key === "gstin" ? t.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() : t;
          set(key, v); clear(key);
        }}
      />
      {area ? (
        <View style={styles.counterRow}>
          {err(key) || <View />}
          <Text style={styles.charCount}>{String(form[key] ?? "").length}/300</Text>
        </View>
      ) : err(key)}
    </View>
  );

  if (step === "SUCCESS" && result) return <GstCancellationSuccess submissionResult={result} gstin={form.gstin} cancellationDate={form.cancellationDate} />;
  if (step === "REVIEW") return <GstCancellationReview formData={form} isReviewDeclared={reviewDeclared} setIsReviewDeclared={setReviewDeclared} isSubmitting={submitting} handleSubmitCancellation={submit} onBack={() => setStep("FORM")} />;

  return (
    <View style={styles.root}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {renderHeader()}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <GstServiceBanner iconName="ban" text="Formally surrender and cancel your GST registration via Form REG-16" />
        {input("gstin", "GSTIN (15-Character)", "e.g. 29AAAAA0000A1Z5")}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Reason for Cancellation <Text style={styles.star}>*</Text></Text>
          <TouchableOpacity style={[styles.selectBox, errors.reason && styles.inputError]} activeOpacity={0.7} onPress={() => setReasonOpen(true)}>
            <Text style={[styles.selectText, !form.reason && styles.placeholderText]}>{form.reason || "Select Reason for Cancellation"}</Text>
            <Ionicons name="chevron-down" size={18} color="#64748B" />
          </TouchableOpacity>
          {err("reason")}
        </View>
        {form.reason === "Other Valid Reason" && input("otherReason", "Please Specify Reason", "Describe reason for cancelling")}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Date Cancellation Is Sought <Text style={styles.star}>*</Text></Text>
          <TouchableOpacity style={[styles.selectBox, errors.cancellationDate && styles.inputError]} activeOpacity={0.7} onPress={() => setDateOpen(true)}>
            <Text style={[styles.selectText, !form.cancellationDate && styles.placeholderText]}>{form.cancellationDate || "Select effective cancellation date"}</Text>
            <Ionicons name="calendar-outline" size={18} color="#083B75" />
          </TouchableOpacity>
          {err("cancellationDate")}
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Did you register voluntarily AND is your registration less than 1 year old? <Text style={styles.star}>*</Text></Text>
          {choice("isVoluntaryUnderOneYear")}
          {err("isVoluntaryUnderOneYear")}
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Are all your GST returns filed up to today? <Text style={styles.star}>*</Text></Text>
          {choice("areAllReturnsFiled")}
          {err("areAllReturnsFiled")}
        </View>
        {input("closingStock", "Details of Closing Stock & Input Tax Reversal", "Describe closing inventory value and ITC reversal or enter 'Nil'", true, true)}
        {input("pendingLiabilities", "Pending Dues / Liabilities (Optional)", "Enter any pending penalty or tax dues, if any", false)}
        {input("lastGstr3b", "Last GSTR-3B Filed ARN / Period", "e.g. AA290826000000X / July 2026")}
        <GstSupportingProof supportingDoc={form.supportingDoc} setSupportingDoc={v => set("supportingDoc", v)} handleBrowseFiles={pickDoc} handleScanFile={scanDoc} />
        {renderAcceptedProofs()}
        {renderDeclaration()}
        {renderReviewButton()}
      </ScrollView>
      <GstSelectModal visible={reasonOpen} title="Select Reason for Cancellation" options={CANCELLATION_REASONS} selectedValue={form.reason} onSelect={v => { set("reason", v); clear("reason"); }} onClose={() => setReasonOpen(false)} />
      <GstDatePickerModal visible={dateOpen} title="Date Cancellation Is Sought" selectedDate={form.cancellationDate} onSelectDate={d => { set("cancellationDate", d); clear("cancellationDate"); }} onClose={() => setDateOpen(false)} />
      <UniversalDraftModal visible={showDraftModal} title="Save Cancellation Draft?" message="You have unsaved changes in your GST cancellation request. Save your progress so you can resume anytime." saveButtonText="Save as Draft & Exit" discardButtonText="Discard & Exit" cancelButtonText="Keep Editing" onSaveAndExit={handleSaveAndExit} onDiscardAndExit={handleDiscardAndExit} onCancel={handleCancel} />
    </View>
  );
}