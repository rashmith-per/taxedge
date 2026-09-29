/**
 * Screen: GST Registration
 * Migrated to modular architecture.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { gstApi } from "@/modules/gst/services/gstApi";
import { GstValidators } from "@/modules/gst/utils/gstValidators";
import { GstStepIndicator } from "@/modules/gst/gst-registration/components/GstStepIndicator/GstStepIndicator";
import {
  GstBusinessStep,
  GstBusinessFormData,
} from "@/modules/gst/gst-registration/components/GstBusinessStep/GstBusinessStep";
import {
  GstUnifiedDocumentStep,
  INITIAL_DOCUMENTS,
  DocumentItem,
} from "@/modules/gst/gst-registration/components/GstUnifiedDocumentStep/GstUnifiedDocumentStep";
import { GstReviewStep } from "@/modules/gst/gst-registration/components/GstReviewStep/GstReviewStep";
import { GstRegistrationPaymentStep } from "@/modules/gst/gst-registration/components/GstRegistrationPaymentStep";
import { GstApplicationStatusStep } from "@/modules/gst/gst-status/components/GstApplicationStatusStep/GstApplicationStatusStep";
import { useApplicationStore } from "@/store/applicationStore";
import { useNotificationStore } from "@/store/notificationStore";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { styles } from "./GstRegistrationScreen.styles";

const STEPS = ["Business", "Documents", "Review", "Payment"];

export const GstRegistrationScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [screenIndex, setScreenIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [declared, setDeclared] = useState(true);
  const [createdAppId, setCreatedAppId] = useState<string>("GST-2026-84920");
  const [createdGstId, setCreatedGstId] = useState<string>("");

  // Stores
  const gstDraft = useApplicationStore((state) => state.gstDraft);
  const saveGstDraft = useApplicationStore((state) => state.saveGstDraft);
  const clearGstDraft = useApplicationStore((state) => state.clearGstDraft);
  const createApplication = useApplicationStore(
    (state) => state.createApplication,
  );
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  // Form State
  const [businessData, setBusinessData] = useState<GstBusinessFormData>({
    legalName: "",
    businessName: "",
    businessType: "",
    natureOfBusiness: "",
    placeOfBusiness: "",
    businessStartDate: "",
    reasonForRegistration: "",
    compositionScheme: "",
    businessAddress: "",
    city: "",
    district: "",
    state: "",
    pinCode: "",
    hsnCode: "",
    accountHolderName: "",
    bankAccountNumber: "",
    confirmBankAccountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
    accountType: "",
    signatoryName: "",
    signatoryPan: "",
    signatoryDob: "",
    signatoryDesignation: "",
    signatoryMobile: "",
    signatoryEmail: "",
    addressProofType: "Rental Agreement",
    aadhaarConsent: false,
  });
  const [businessErrors, setBusinessErrors] = useState<Record<string, string>>(
    {},
  );

  // Unified Documents State
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);

  // Universal Draft Guard Hook
  const {
    showDraftModal,
    openDraftModal,
    markSubmitted,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
  } = useUniversalDraftGuard({
    isDirty: () => {
      const hasBusiness = Object.values(businessData).some(
        (v) =>
          (typeof v === "string" &&
            v.trim() !== "" &&
            v !== "Rental Agreement") ||
          (typeof v === "boolean" && v === true),
      );
      const hasDocs = documents.some((d) => Boolean(d.fileUri));
      return hasBusiness || hasDocs;
    },
    onSaveDraft: () => {
      saveGstDraft({
        id: "draft-gst",
        stepIndex: screenIndex,
        personalData: {},
        businessData: businessData as any,
        createdGstId: createdGstId,
        documents: documents as any,
        updatedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    },
    onDiscardDraft: () => {
      clearGstDraft();
    },
    isSubmitted: () => screenIndex >= 3,
  });

  // Scroll to top on step transition
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [screenIndex]);

  // Auto-restore draft on mount if available
  useEffect(() => {
    if (gstDraft) {
      if (gstDraft.businessData) {
        setBusinessData((prev) => ({
          ...prev,
          ...gstDraft.businessData,
          businessName:
            gstDraft.businessData.businessName ||
            (gstDraft.businessData as any).registeredBusinessName ||
            (gstDraft.personalData as any)?.businessName ||
            "",
          businessType:
            gstDraft.businessData.businessType ||
            (gstDraft.personalData as any)?.businessType ||
            "",
        }));
      }
      if (gstDraft.documents && Array.isArray(gstDraft.documents)) {
        setDocuments(gstDraft.documents as DocumentItem[]);
      }
      if (typeof gstDraft.stepIndex === "number" && gstDraft.stepIndex < 3) {
        setScreenIndex(gstDraft.stepIndex);
      }
      if (gstDraft.createdGstId) {
        setCreatedGstId(gstDraft.createdGstId);
      }
    }
  }, []);

  const getScreenTitle = () => {
    switch (screenIndex) {
      case 0:
        return "GST Registration";
      case 1:
        return "Upload Documents";
      case 2:
        return "Review Application";
      case 3:
        return "Service Payment";
      default:
        return "Application Status";
    }
  };

  const getButtonText = () => {
    switch (screenIndex) {
      case 0:
        return "Continue to Documents";
      case 1:
        return "Continue to Review";
      case 2:
        return "Proceed to Payment (₹1,499)";
      default:
        return "";
    }
  };

  // Functional real-time change & blur handlers for Business
  const handleBusinessChange = (fields: Partial<GstBusinessFormData>) => {
    setBusinessData((prev) => {
      const updated = { ...prev, ...fields };
      setBusinessErrors((prevErrors) => {
        return Object.keys(fields).reduce<Record<string, string>>(
          (acc, k) => {
            const key = k as keyof GstBusinessFormData;
            if (acc[key]) {
              const val = updated[key];
              const strVal = typeof val === "boolean" ? String(val) : val || "";
              const revalidated = GstValidators.validateBusinessField(
                key,
                strVal,
              );
              return { ...acc, [key]: revalidated };
            }
            return acc;
          },
          { ...prevErrors },
        );
      });
      return updated;
    });
  };

  const handleBusinessBlur = (field: keyof GstBusinessFormData) => {
    const val = businessData[field];
    const strVal = typeof val === "boolean" ? String(val) : val || "";
    const errorMsg = GstValidators.validateBusinessField(field, strVal);
    setBusinessErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const validateBusinessDetails = (): boolean => {
    const errs = GstValidators.validateBusinessForm(
      businessData as unknown as Record<string, string>,
    );
    setBusinessErrors(errs);
    if (Object.keys(errs).length > 0) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      Alert.alert(
        "Required Fields Missing",
        "Please enter all the required fields correctly to proceed.",
      );
      return false;
    }
    return true;
  };

  const validateDocuments = (): boolean => {
    const mandatoryMissing = documents.filter((d) => d.required && !d.fileUri);
    if (mandatoryMissing.length > 0) {
      const missingNames = mandatoryMissing.map((d) => d.name).join(", ");
      Alert.alert(
        "Required Documents Missing",
        `Please upload the following required documents before proceeding:\n\n\u2022 ${missingNames.split(", ").join("\n\u2022 ")}`,
      );
      return false;
    }
    return true;
  };

  const hasAnyDataEntered = () => {
    const hasBusiness = Object.values(businessData).some(
      (v) =>
        (typeof v === "string" &&
          v.trim() !== "" &&
          v !== "Rental Agreement") ||
        (typeof v === "boolean" && v === true),
    );
    const hasDocs = documents.some((d) => Boolean(d.fileUri));
    return hasBusiness || hasDocs;
  };

  const handleBack = () => {
    if (screenIndex === 4) {
      router.replace("/(main)/home");
      return;
    }

    if (screenIndex > 0) {
      setScreenIndex((prev) => prev - 1);
      return;
    }

    // On Step 0 (or exit) - open custom draft modal (matching Image 4) if any data entered
    if (hasAnyDataEntered()) {
      openDraftModal();
    } else {
      router.back();
    }
  };

  const getBackendPayload = () => {
    const mapEnum = (val: string) =>
      (val || "")
        .toUpperCase()
        .replace(/[^A-Z0-9_]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");

    const rawConstitution = mapEnum(businessData.businessType);
    let constitution = "PROPRIETORSHIP";
    if (rawConstitution.includes("PARTNERSHIP_FIRM"))
      constitution = "PARTNERSHIP";
    else if (rawConstitution.includes("LLP")) constitution = "LLP";
    else if (rawConstitution.includes("PRIVATE"))
      constitution = "PRIVATE_LIMITED_COMPANY";
    else if (rawConstitution.includes("PUBLIC"))
      constitution = "PUBLIC_LIMITED_COMPANY";
    else if (rawConstitution.includes("HUF")) constitution = "HUF";
    else if (
      rawConstitution.includes("SOCIETY") ||
      rawConstitution.includes("TRUST")
    )
      constitution = "SOCIETY_TRUST_CLUB";
    else if (rawConstitution.includes("AOP") || rawConstitution.includes("BOI"))
      constitution = "AOP_BOI";
    else if (rawConstitution.includes("GOVERNMENT"))
      constitution = "GOVERNMENT_DEPARTMENT";
    else if (rawConstitution.includes("FOREIGN"))
      constitution = "FOREIGN_COMPANY";
    else if (rawConstitution.includes("PARTNERSHIP"))
      constitution = "PARTNERSHIP";

    const rawNature = mapEnum(businessData.natureOfBusiness);
    let nature = "SERVICE_PROVIDER";
    if (
      rawNature.includes("WHOLESALER") ||
      rawNature.includes("DISTRIBUTOR") ||
      rawNature.includes("RETAILER") ||
      rawNature.includes("TRADER")
    )
      nature = "TRADER";
    else if (rawNature.includes("MANUFACTURER")) nature = "MANUFACTURER";
    else if (rawNature.includes("E_COMMERCE")) nature = "E_COMMERCE";
    else if (rawNature.includes("WORK_CONTRACT")) nature = "WORK_CONTRACT";
    else if (rawNature.includes("IMPORT") || rawNature.includes("EXPORT"))
      nature = "IMPORT_EXPORT";
    else if (rawNature.includes("WARE_HOUSE") || rawNature.includes("DEPOT"))
      nature = "WARE_HOUSE_DEPOT";

    const rawReason = mapEnum(businessData.reasonForRegistration);
    let reason = "VOLUNTARY_REGISTRATION";
    if (rawReason.includes("E_COMMERCE")) reason = "ECOMMERCE_OPERATOR_SELLER";
    else if (rawReason.includes("THRESHOLD") || rawReason.includes("TURN_OVER"))
      reason = "CROSSED_TURN_OVER_THRESHOLD";
    else if (rawReason.includes("INTER_STATE")) reason = "INTER_STATE_SUPPLY";
    else if (rawReason.includes("CASUAL")) reason = "CASUAL_TAXABLE_PERSON";
    else if (rawReason.includes("INPUT_SERVICE"))
      reason = "INPUT_SERVICE_DISTRIBUTOR";

    const formatDate = (dateStr: string) => {
      if (!dateStr || dateStr.trim() === "") return new Date().toISOString().split("T")[0];
      if (dateStr.includes("/")) {
        const parts = dateStr.split("/");
        if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
      if (dateStr.includes("-")) {
        const parts = dateStr.split("-");
        if (parts[0].length === 2 && parts[2].length === 4) {
          return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
        }
      }
      return dateStr;
    };

    return {
      legalName: businessData.legalName,
      tradeName: businessData.businessName,
      constitutionOfBusiness: constitution,
      natureOfBusiness: nature,
      dateOfCommencement: formatDate(businessData.businessStartDate),
      reasonForRegistration: reason,
      compositionScheme: mapEnum(businessData.compositionScheme).includes("YES")
        ? "YES_COMPOSITION_SCHEME"
        : "NO_REGULAR_SCHEME",
      placeOfBusiness: "PRINCIPAL_PLACE_OF_BUSINESS",
      businessAddress: businessData.businessAddress,
      city: businessData.city,
      district: businessData.district,
      state: businessData.state,
      pinCode: businessData.pinCode,
      hsnSac: businessData.hsnCode,
      accountHolderName: businessData.accountHolderName,
      bankAccountNumber: businessData.bankAccountNumber,
      ifscCode: businessData.ifscCode,
      bankName: businessData.bankName,
      branchName: businessData.branchName,
      accountType: mapEnum(businessData.accountType) || "CURRENT",
      authorisedSignatory: businessData.signatoryName ? "YES" : "NO",
      signatoryName: businessData.signatoryName || businessData.legalName,
      signatoryPan: businessData.signatoryPan,
      signatoryDob: formatDate(businessData.signatoryDob),
      designation: businessData.signatoryDesignation || "Owner",
      signatoryMobile: businessData.signatoryMobile,
      signatoryEmail: businessData.signatoryEmail,
    };
  };

  const handleContinue = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (screenIndex === 0) {
        if (!validateBusinessDetails()) return;
        saveGstDraft({
          id: "draft-gst",
          stepIndex: 1,
          personalData: {},
          businessData: businessData as any,
          createdGstId: createdGstId,
          documents: documents as any,
          updatedAt: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        } as any);

        // API call to create or update GST Registration
        try {
          const payload = getBackendPayload();
          if (createdGstId) {
            await gstApi.updateRegistration(createdGstId, payload);
          } else {
            const response = await gstApi.submitRegistration(payload);
            // Backend returns the plain GST ID text (e.g. "Business registered successfully with Business ID: GST123456789012")
            const responseStr = typeof response === "string" ? response : JSON.stringify(response);
            const match = responseStr.match(/(GST\d+)/);
            const gstId = match ? match[1] : (typeof response === "string" ? response : (response?.gstId || response?.businessId || ""));
            setCreatedGstId(gstId);
            saveGstDraft({
              id: "draft-gst",
              stepIndex: 1,
              personalData: {},
              businessData: businessData as any,
              createdGstId: gstId,
              documents: documents as any,
              updatedAt: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            });
          }
          setScreenIndex(1);
        } catch (err: any) {
          const msg = err?.message || "Failed to save business details";
          Alert.alert("Registration Error", msg);
          console.error("GST Registration submit error:", err);
        }
      } else if (screenIndex === 1) {
        if (!validateDocuments()) return;
        saveGstDraft({
          id: "draft-gst",
          stepIndex: 2,
          personalData: {},
          businessData: businessData as any,
          createdGstId: createdGstId,
          documents: documents as any,
          updatedAt: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        } as any);

        // Upload documents if we have a GST ID
        if (createdGstId) {
          try {
            const uploadPromises = documents.map(async (doc) => {
              if (!doc.fileUri) return;
              let docType = doc.id.toUpperCase().replace(/[\s-]+/g, "_");
              let actualAddressProofType = "";

              if (docType.includes("PAN")) docType = "PAN_CARD";
              if (docType.includes("AADHAAR")) docType = "AADHAAR_CARD";
              if (docType.includes("ADDRESS_PROOF")) {
                docType = "PRINCIPAL_PLACE_ADDRESS_PROOF";
                actualAddressProofType = (doc.subtitle || "")
                  .toUpperCase()
                  .replace(/[\s-]+/g, "_");
              }
              if (docType.includes("BUSINESS_PROOF"))
                docType = "BUSINESS_REGISTRATION_PROOF";
              if (
                docType.includes("BANK_STATEMENT") ||
                docType.includes("BANK_PROOF")
              )
                docType = "BANK_PASSBOOK_OR_CANCELLED_CHEQUE";
              if (
                docType.includes("PHOTOGRAPH") ||
                docType.includes("AUTHORIZATION_PROOF")
              )
                docType = "PASSPORT_SIZE_PHOTOGRAPH";

              return gstApi.uploadDocument(
                createdGstId,
                docType,
                actualAddressProofType,
                doc.fileUri,
                doc.fileName || "doc.jpg",
              );
            });
            await Promise.all(uploadPromises);
          } catch (err) {
            Alert.alert("Error", "Failed to upload some documents");
            console.error(err);
          }
        }

        setScreenIndex(2);
      } else if (screenIndex === 2) {
        if (!declared) {
          Alert.alert(
            "Declaration Required",
            "Please accept the declaration to proceed to payment.",
          );
          return;
        }

        saveGstDraft({
          id: "draft-gst",
          stepIndex: 3,
          personalData: {},
          businessData: businessData as any,
          createdGstId: createdGstId,
          documents: documents as any,
          updatedAt: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });

        // Update business details if edited
        if (createdGstId) {
          try {
            await gstApi.updateRegistration(createdGstId, getBackendPayload());
          } catch (e) {}
        }

        setScreenIndex(3);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (txnId: string, paymentMethod: string) => {
    try {
      // 3. Complete locally to update UI tracker
      const appId = createApplication(
        "gst-registration",
        "GST Registration",
        "GST",
        {
          ...businessData,
          applicantName:
            businessData.businessName ||
            businessData.legalName ||
            "Your Business",
          appliedDate: new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          transactionId: txnId,
          paymentMethod: paymentMethod,
          paymentAmount: 1499,
          paymentStatus: "Paid",
        } as any,
        documents.map((d) => ({
          name: d.name,
          status: "Uploaded" as const,
          fileUri: d.fileUri,
          fileName: d.fileName,
          fileSize: d.fileSize,
        })),
        1499,
        "Paid",
      );

      setCreatedAppId(appId);
      markSubmitted();
      clearGstDraft();

      addNotification(
        "GST Application Submitted",
        `Your GST Registration (ID: ${appId}) has been successfully submitted and is under verification.`,
        "gst",
      );

      setScreenIndex(4);
    } catch (error) {
      console.error("Integration Error: ", error);
      Alert.alert(
        "Submission Failed",
        "Could not connect to the backend server. Please try again.",
      );
    }
  };

  return (
    <View style={styles.root}>
      {/* Top Header Bar */}
      <View
        style={[styles.headerBar, { paddingTop: Math.max(insets.top, 12) + 6 }]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBack}
          style={styles.backButton}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={BrandColors.TEXT_PRIMARY}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
        <View style={styles.placeholderBox} />
      </View>

      {/* 4-Step Indicator */}
      {screenIndex < 4 && (
        <GstStepIndicator steps={STEPS} currentStep={screenIndex} />
      )}

      {/* Main Scroll Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          screenIndex === 4 && { paddingBottom: 24 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        overScrollMode="always"
        nestedScrollEnabled={true}
      >
        {screenIndex === 0 && (
          <GstBusinessStep
            data={businessData}
            errors={businessErrors}
            onChange={handleBusinessChange}
            onBlurField={handleBusinessBlur}
          />
        )}

        {screenIndex === 1 && (
          <GstUnifiedDocumentStep
            documents={documents}
            onUpdateDocuments={(updated) => {
              setDocuments(updated);
              saveGstDraft({
                id: "draft-gst",
                stepIndex: 1,
                personalData: {},
                businessData: businessData as any,
                createdGstId: createdGstId,
                documents: updated as any,
                updatedAt: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              });
            }}
          />
        )}

        {screenIndex === 2 && (
          <GstReviewStep
            businessData={businessData}
            documents={documents}
            onEditStep={(stepIdx) => setScreenIndex(stepIdx)}
            declared={declared}
            onToggleDeclaration={() => setDeclared((prev) => !prev)}
          />
        )}

        {screenIndex === 3 && (
          <GstRegistrationPaymentStep
            businessName={
              businessData.businessName ||
              businessData.legalName ||
              "Your Business"
            }
            onPaymentSuccess={handlePaymentSuccess}
            onBackToReview={() => setScreenIndex(2)}
          />
        )}

        {screenIndex === 4 && (
          <GstApplicationStatusStep
            appId={createdAppId}
            businessName={businessData.businessName || "Your Business"}
            appliedDate="Today"
            serviceName="GST Registration"
          />
        )}

        {/* Action Button - In scroll view so it stays cleanly at the bottom */}
        {screenIndex < 3 && (
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleContinue}
              style={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>{getButtonText()}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Universal Save As Draft Confirmation Modal */}
      <UniversalDraftModal
        visible={showDraftModal}
        title="Save Application Progress?"
        message="You have unsaved changes in your GST registration application. Save your progress so you can resume anytime without re-entering details."
        saveButtonText="Save as Draft & Exit"
        discardButtonText="Discard & Exit"
        cancelButtonText="Keep Editing"
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        onCancel={handleCancel}
      />
    </View>
  );
};

export default GstRegistrationScreen;
