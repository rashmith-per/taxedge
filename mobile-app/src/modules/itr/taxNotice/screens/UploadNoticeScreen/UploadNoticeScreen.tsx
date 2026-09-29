import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  TaxNoticeHeader,
  TaxNoticeDatePickerInput,
} from "../../components/common";
import { NoticeUploadCard } from "../../components/upload";
import { TaxNoticeFormData } from "../../types/taxNotice.types";
import {
  INITIAL_TAX_NOTICE_FORM_DATA,
  NOTICE_TYPE_OPTIONS,
} from "../../mock/taxNoticeData";
import { useApplicationStore } from "@/store/applicationStore";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import {
  styles,
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
  getBottomBarInsetsStyle,
} from "./UploadNoticeScreen.styles";

export const UploadNoticeScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const taxNoticeDraft = useApplicationStore((state) => state.taxNoticeDraft);
  const saveTaxNoticeDraft = useApplicationStore((state) => state.saveTaxNoticeDraft);
  const clearTaxNoticeDraft = useApplicationStore((state) => state.clearTaxNoticeDraft);

  const authUser = useAuthStore((state) => state.authenticatedUser);
  const customer = useAuthStore((state) => state.customer);
  const profilePan = customer?.pan || authUser?.pan || "";

  // 2-step flow: 1 = Notice Details, 2 = Upload Notice
  const [currentStep, setCurrentStep] = useState<1 | 2>(() => {
    if (taxNoticeDraft?.step === "UPLOAD") return 2;
    return 1;
  });

  // Pure functional initial state: restore from draft or start clean (no predefined mock values)
  const [formData, setFormData] = useState<TaxNoticeFormData>(() => {
    if (taxNoticeDraft && taxNoticeDraft.formData) {
      return {
        ...INITIAL_TAX_NOTICE_FORM_DATA,
        ...taxNoticeDraft.formData,
        pan: taxNoticeDraft.formData.pan || profilePan,
      } as TaxNoticeFormData;
    }
    return {
      ...INITIAL_TAX_NOTICE_FORM_DATA,
      pan: profilePan,
    };
  });

  const [showAyDropdown, setShowAyDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const ayOptions = [
    "AY 2026–27",
    "AY 2025–26",
    "AY 2024–25",
    "AY 2023–24",
    "AY 2022–23",
  ];

  // Universal Draft Guard Hook for intercepting back navigation
  const {
    showDraftModal,
    openDraftModal,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
  } = useUniversalDraftGuard({
    isDirty: () =>
      Boolean(
        (formData.pan && formData.pan !== profilePan) ||
        formData.noticeNumber ||
        formData.noticeDate ||
        formData.responseDueDate ||
        formData.customerExplanation ||
        formData.noticeFileName
      ),
    onSaveDraft: () => {
      saveTaxNoticeDraft({
        formData,
        step: currentStep === 1 ? "DETAILS" : "UPLOAD",
        updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    },
    onDiscardDraft: () => {
      clearTaxNoticeDraft();
    },
  });

  const handleFieldChange = (field: keyof TaxNoticeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleUploadSuccess = (fileInfo: {
    uri: string;
    name: string;
    size: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      noticeFileUri: fileInfo.uri,
      noticeFileName: fileInfo.name,
      noticeFileSize: fileInfo.size,
    }));
    if (errors.file) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.file;
        return next;
      });
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    const panTrimmed = (formData.pan || "").trim().toUpperCase();
    if (!panTrimmed) {
      newErrors.pan = "PAN is required.";
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panTrimmed)) {
      newErrors.pan = "Enter a valid 10-character PAN (e.g. ABCDE1234F).";
    }

    if (!formData.assessmentYear.trim()) {
      newErrors.assessmentYear = "Assessment year is required.";
    }

    if (!formData.noticeType.trim()) {
      newErrors.noticeType = "Please select the notice type.";
    }

    if (!formData.noticeDate.trim()) {
      newErrors.noticeDate = "Notice date is required.";
    }

    if (!formData.noticeNumber.trim()) {
      newErrors.noticeNumber = "Notice reference number / DIN is required.";
    }

    if (!formData.responseDueDate.trim()) {
      newErrors.responseDueDate = "Response due date is required.";
    }

    if (!formData.customerExplanation.trim()) {
      newErrors.customerExplanation = "Please provide a brief explanation of your case.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.noticeFileName) {
      newErrors.file = "Please upload your Income Tax notice document.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Continue = () => {
    if (!validateStep1()) return;
    // Persist draft for step transition
    saveTaxNoticeDraft({
      formData,
      step: "UPLOAD",
      updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    setCurrentStep(2);
  };

  const handleStep2Continue = () => {
    if (!validateStep2()) return;

    saveTaxNoticeDraft({
      formData,
      step: "UPLOAD",
      updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });

    // Navigate to Screen 3: Staff Review & Notice Summary
    router.push({
      pathname: "/service/tax-notice-summary" as any,
      params: {
        pan: formData.pan,
        noticeNumber: formData.noticeNumber,
        noticeDate: formData.noticeDate,
        responseDueDate: formData.responseDueDate,
        noticeType: formData.noticeType,
        assessmentYear: formData.assessmentYear,
        customerExplanation: formData.customerExplanation,
        noticeFileName: formData.noticeFileName,
      },
    });
  };

  const handleHeaderBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      openDraftModal();
    }
  };

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top)]}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header with Draft Action */}
      <TaxNoticeHeader
        subtitle={currentStep === 1 ? "Notice Details" : "Upload Tax Notice"}
        onBack={handleHeaderBack}
        onSaveDraft={() => {
          saveTaxNoticeDraft({
            formData,
            step: currentStep === 1 ? "DETAILS" : "UPLOAD",
            updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          });
          Alert.alert("Draft Saved", "Your notice details have been saved as a draft.");
        }}
      />

      {/* Main Form Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          getScrollContentInsetsStyle(insets.bottom),
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step Progress Track */}
        <View style={styles.stepIndicatorContainer}>
          <View
            style={[
              styles.stepIndicatorBar,
              currentStep >= 1 ? styles.stepIndicatorActive : null,
            ]}
          />
          <View
            style={[
              styles.stepIndicatorBar,
              currentStep >= 2 ? styles.stepIndicatorActive : null,
            ]}
          />
        </View>

        {currentStep === 1 ? (
          /* ================= STEP 1: NOTICE DETAILS ================= */
          <View>
            <Text style={styles.stepLabel}>Step 1 of 2: Notice Details</Text>
            <View style={styles.titleSection}>
              <Text style={styles.pageTitle}>Enter Notice Information</Text>
              <Text style={styles.pageSubtitle}>
                Provide details from your notice. This helps our Tax Executive analyze the legal sections and prepare your defense.
              </Text>
            </View>

            {/* Field 1: PAN */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Permanent Account Number (PAN) <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[styles.textInput, errors.pan ? styles.inputError : null]}
                placeholder="Enter 10-digit PAN (e.g. ABCDE1234F)"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                maxLength={10}
                value={formData.pan}
                onChangeText={(text) => handleFieldChange("pan", text.toUpperCase())}
              />
              {errors.pan ? <Text style={styles.errorText}>{errors.pan}</Text> : null}
            </View>

            {/* Field 2: Assessment Year */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Assessment Year (AY) <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowAyDropdown(!showAyDropdown)}
                style={styles.dropdownSelector}
              >
                <Text style={styles.dropdownValue}>{formData.assessmentYear}</Text>
                <Ionicons
                  name={showAyDropdown ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>

              {showAyDropdown && (
                <View style={styles.dropdownMenu}>
                  {ayOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      activeOpacity={0.7}
                      onPress={() => {
                        handleFieldChange("assessmentYear", opt);
                        setShowAyDropdown(false);
                      }}
                      style={styles.dropdownItem}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          formData.assessmentYear === opt
                            ? styles.dropdownItemActive
                            : null,
                        ]}
                      >
                        {opt}
                      </Text>
                      {formData.assessmentYear === opt && (
                        <Ionicons name="checkmark" size={16} color="#F97316" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Field 3: Notice Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Notice Type / Section <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                style={[
                  styles.dropdownSelector,
                  errors.noticeType ? styles.inputError : null,
                ]}
              >
                <Text
                  style={[
                    styles.dropdownValue,
                    !formData.noticeType ? { color: "#94A3B8" } : null,
                  ]}
                  numberOfLines={1}
                >
                  {formData.noticeType || "Select Notice Type"}
                </Text>
                <Ionicons
                  name={showTypeDropdown ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>

              {showTypeDropdown && (
                <View style={styles.dropdownMenu}>
                  {NOTICE_TYPE_OPTIONS.map((item) => (
                    <TouchableOpacity
                      key={item.value}
                      activeOpacity={0.7}
                      onPress={() => {
                        handleFieldChange("noticeType", item.label);
                        setShowTypeDropdown(false);
                      }}
                      style={styles.dropdownItem}
                    >
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text
                          style={[
                            styles.dropdownItemText,
                            formData.noticeType === item.label
                              ? styles.dropdownItemActive
                              : null,
                          ]}
                        >
                          {item.label}
                        </Text>
                        <Text style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                          {item.description}
                        </Text>
                      </View>
                      {formData.noticeType === item.label && (
                        <Ionicons name="checkmark" size={16} color="#F97316" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {errors.noticeType ? (
                <Text style={styles.errorText}>{errors.noticeType}</Text>
              ) : null}
            </View>

            {/* Field 4: Notice Date (Interactive Calendar DatePicker) */}
            <TaxNoticeDatePickerInput
              label="Notice Date"
              required
              value={formData.noticeDate}
              onChange={(dateStr) => handleFieldChange("noticeDate", dateStr)}
              placeholder="Select date mentioned on notice"
              helperText="Date of issuance stated on the top right of your notice"
              error={errors.noticeDate}
              maximumDate={new Date()}
            />

            {/* Field 5: Notice Reference Number / DIN */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Notice Reference Number / DIN <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.noticeNumber ? styles.inputError : null,
                ]}
                placeholder="e.g. CPC/2526/A3/284419260 or DIN"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                value={formData.noticeNumber}
                onChangeText={(text) => handleFieldChange("noticeNumber", text)}
              />
              <Text style={styles.inputHint}>
                Document Identification Number (DIN) or CPC Communication number
              </Text>
              {errors.noticeNumber ? (
                <Text style={styles.errorText}>{errors.noticeNumber}</Text>
              ) : null}
            </View>

            {/* Field 6: Response Due Date (Interactive Calendar DatePicker) */}
            <TaxNoticeDatePickerInput
              label="Response Due Date"
              required
              value={formData.responseDueDate}
              onChange={(dateStr) => handleFieldChange("responseDueDate", dateStr)}
              placeholder="Select response due date"
              helperText="Last date allowed by the IT Department to file response (typically 15-30 days)"
              error={errors.responseDueDate}
            />

            {/* Field 7: Customer Explanation */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Your Explanation / Background <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  errors.customerExplanation ? styles.inputError : null,
                ]}
                multiline
                numberOfLines={4}
                placeholder="Describe your case, income sources, reason for discrepancy, or if you already paid taxes..."
                placeholderTextColor="#94A3B8"
                value={formData.customerExplanation}
                onChangeText={(text) => handleFieldChange("customerExplanation", text)}
              />
              {errors.customerExplanation ? (
                <Text style={styles.errorText}>{errors.customerExplanation}</Text>
              ) : null}
            </View>

            {/* Blue Guidance Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconCircle}>
                <Ionicons name="information" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.infoText}>
                You can find the DIN, notice date, and assessment year on the top portion of your Income Tax communication.
              </Text>
            </View>
          </View>
        ) : (
          /* ================= STEP 2: UPLOAD NOTICE ================= */
          <View>
            <Text style={styles.stepLabel}>Step 2 of 2: Upload Notice</Text>
            <View style={styles.titleSection}>
              <Text style={styles.pageTitle}>Upload your Income Tax notice</Text>
              <Text style={styles.pageSubtitle}>
                Upload the official notice PDF or clear photograph. Our team will cross-verify the document details with your information.
              </Text>
            </View>

            {/* Upload Card with 3-Option Modal (Drive, Gallery, Camera) */}
            <NoticeUploadCard
              fileName={formData.noticeFileName}
              fileSize={formData.noticeFileSize}
              onUploadSuccess={handleUploadSuccess}
              error={errors.file}
            />
            {errors.file ? <Text style={styles.errorText}>{errors.file}</Text> : null}

            {/* Notice Summary Details Box */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                padding: 16,
                marginTop: 16,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#0B1F3A",
                  marginBottom: 10,
                }}
              >
                Entered Notice Information
              </Text>
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 13, color: "#64748B" }}>PAN:</Text>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#0B1F3A" }}>
                    {formData.pan || "Not entered"}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 13, color: "#64748B" }}>Assessment Year:</Text>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#0B1F3A" }}>
                    {formData.assessmentYear}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 13, color: "#64748B" }}>Notice Type:</Text>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#0B1F3A" }} numberOfLines={1}>
                    {formData.noticeType}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 13, color: "#64748B" }}>Notice Date:</Text>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#0B1F3A" }}>
                    {formData.noticeDate || "Not selected"}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 13, color: "#64748B" }}>Response Due Date:</Text>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#EA580C" }}>
                    {formData.responseDueDate || "Not selected"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconCircle}>
                <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.infoText}>
                Your notice is kept strictly confidential and processed by certified tax experts under end-to-end encryption.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.bottomBar, getBottomBarInsetsStyle(insets.bottom)]}>
        {currentStep === 1 ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleStep1Continue}
            style={styles.continueButton}
          >
            <Text style={styles.continueButtonText}>Continue to Upload Notice</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setCurrentStep(1)}
              style={styles.backStepButton}
            >
              <Text style={styles.backStepButtonText}>Edit Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleStep2Continue}
              style={styles.primaryStepButton}
            >
              <Text style={styles.primaryStepButtonText}>Continue to Staff Review</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Universal Draft Confirmation Modal */}
      <UniversalDraftModal
        visible={showDraftModal}
        title="Save Notice Progress?"
        message="You have unsaved notice information. Save as draft to continue anytime without losing your inputs."
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        onCancel={handleCancel}
      />
    </View>
  );
};

export default UploadNoticeScreen;

