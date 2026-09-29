import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { GstValidators } from "@/modules/gst/utils/gstValidators";
import {
  GstFilingPeriodStep,
  GstFilingPeriodData,
} from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/GstFilingPeriodStep";

import {
  GstFilingDocumentsStep,
  INITIAL_FILING_DOCS,
  FilingDocItem,
} from "@/modules/gst/gst-filing/components/GstFilingDocumentsStep/GstFilingDocumentsStep";

import { GstFilingReviewStep } from "@/modules/gst/gst-filing/components/GstFilingReviewStep/GstFilingReviewStep";
import { GstPaymentMethodStep } from "@/modules/gst/gst-filing/components/payment/GstPaymentMethodStep/GstPaymentMethodStep";
import { GstPaymentSuccessStep } from "@/modules/gst/gst-filing/components/payment/GstPaymentSuccessStep/GstPaymentSuccessStep";
import { GstPaymentReceiptStep } from "@/modules/gst/gst-filing/components/payment/GstPaymentReceiptStep/GstPaymentReceiptStep";
import { GstApplicationStatusStep } from "@/modules/gst/gst-status/components/GstApplicationStatusStep/GstApplicationStatusStep";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { KeyboardAwareScrollView } from "@/shared/components/KeyboardAwareFormLayout";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { styles } from "./GstFilingScreen.styles";
import { useApplicationStore } from "@/store/applicationStore";
import { applicationService } from "@/modules/applications/services/applicationService";
import { gstApi } from "@/modules/gst/services/gstApi";

export const GstFilingScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ appId?: string; step?: string }>();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [filingId, setFilingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State: Starts clean without arbitrary dummy pre-fills
  const [periodData, setPeriodData] = useState<GstFilingPeriodData>({
    periodType: "",
    financialYear: "FY 2025-26",
    filingPeriod: "",
    filingMonth: "",
    gstin: "",
    filingType: "",
    filingNature: "Regular Return",
    calculationMethod: "ca_assisted",
  });
  const [periodErrors, setPeriodErrors] = useState<Record<string, string>>({});
  const [documents, setDocuments] =
    useState<FilingDocItem[]>(INITIAL_FILING_DOCS);

  // Payment State
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [upiError, setUpiError] = useState("");

  // Result metadata
  const [createdAppId, setCreatedAppId] = useState("");

  // Access stores
  const gstFilingDraft = useApplicationStore((state) => state.gstFilingDraft);
  const saveGstFilingDraft = useApplicationStore(
    (state) => state.saveGstFilingDraft,
  );
  const clearGstFilingDraft = useApplicationStore(
    (state) => state.clearGstFilingDraft,
  );

  // Universal Draft Guard Hook for Back Gesture and Hardware Back Interception
  const {
    showDraftModal,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
  } = useUniversalDraftGuard({
    isDirty: () =>
      Boolean(
        periodData.periodType ||
        periodData.financialYear ||
        periodData.filingPeriod ||
        periodData.filingMonth ||
        periodData.gstin ||
        periodData.filingType ||
        documents.some((d) => Boolean(d.fileUri)),
      ),
    onSaveDraft: () => {
      saveGstFilingDraft({
        id: "gst-filing-draft",
        stepIndex: currentStep,
        periodData,
        documents,
        updatedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    },
    onDiscardDraft: () => {
      clearGstFilingDraft();
    },
    isSubmitted: () => currentStep >= 4,
  });

  // Restore existing application or draft on mount
  useEffect(() => {
    const restoreTimer = setTimeout(() => {
    if (params.appId) {
      const existingApp = useApplicationStore
        .getState()
        .applications.find((a) => a.id === params.appId);
      if (existingApp) {
        setCreatedAppId(existingApp.id);
        const fData = (existingApp.formData || {}) as Record<string, any>;
        setPeriodData((prev) => ({
          ...prev,
          gstin: fData.gstin || prev.gstin,
          businessName:
            fData.businessName ||
            fData.tradeName ||
            fData.applicantName ||
            prev.businessName,
          tradeName: fData.tradeName || fData.businessName || prev.tradeName,
          taxpayerScheme: fData.taxpayerScheme || prev.taxpayerScheme,
          filingNature: fData.filingNature || prev.filingNature,
          financialYear: fData.financialYear || prev.financialYear,
          filingPeriod:
            fData.filingPeriod || fData.filingMonth || prev.filingPeriod,
          filingMonth:
            fData.filingMonth || fData.filingPeriod || prev.filingMonth,
          filingType: fData.filingType || prev.filingType,
          filingFrequency: fData.filingFrequency || prev.periodType,
          periodType: fData.filingFrequency || prev.periodType,
          taxableSales: fData.turnover || prev.taxableSales,
          turnover: fData.turnover || prev.turnover,
          eligibleItc: fData.eligibleItc || prev.eligibleItc,
        }));

        if (
          Array.isArray(existingApp.documents) &&
          existingApp.documents.length > 0
        ) {
          setDocuments((prevDocs) =>
            prevDocs.map((initDoc) => {
              const matched = existingApp.documents.find(
                (d) =>
                  d.name?.toLowerCase() === initDoc.name?.toLowerCase() ||
                  (d as any).id === initDoc.id,
              );
              if (matched && matched.status === "Uploaded") {
                return {
                  ...initDoc,
                  fileUri:
                    matched.fileUri || "https://taxedge.in/docs/" + initDoc.id,
                  fileName: matched.name,
                };
              }
              return initDoc;
            }),
          );
        }

        if (params.step) {
          const stepNum = parseInt(params.step, 10);
          if (!isNaN(stepNum)) setCurrentStep(stepNum);
        } else {
          setCurrentStep(2);
        }
        return;
      }
    }

    if (gstFilingDraft) {
      if (gstFilingDraft.periodData) {
        setPeriodData((prev) => ({ ...prev, ...gstFilingDraft.periodData }));
      }
      if (gstFilingDraft.documents && gstFilingDraft.documents.length > 0) {
        setDocuments(gstFilingDraft.documents as FilingDocItem[]);
      }
      if (
        typeof gstFilingDraft.stepIndex === "number" &&
        gstFilingDraft.stepIndex < 4
      ) {
        setCurrentStep(gstFilingDraft.stepIndex);
      }
    }
    }, 0);

    return () => clearTimeout(restoreTimer);
  }, [gstFilingDraft, params.appId, params.step]);

  // Universal Scroll-to-Top resetting whenever user transitions to another step
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentStep]);

  const getScreenTitle = () => {
    switch (currentStep) {
      case 0:
        return "GST Filing Period";
      case 1:
        return "Filing Documents";
      case 2:
        return "Filing Review & Computation";
      case 3:
        return "Complete Payment";
      case 4:
        return "Payment Successful";
      case 5:
        return "Payment Receipt";
      default:
        return "Application Status";
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case 0:
        return "Continue to Documents";
      case 1:
        return "Continue to Review";
      case 2:
        return "Proceed to Submit →";
      case 3:
        return "Payment service unavailable";
      default:
        return "";
    }
  };

  const validatePeriodStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (!GstValidators.isNotEmpty(periodData.periodType)) {
      errs.periodType = "Please select a filing frequency";
    }
    if (
      !periodData.financialYear ||
      !GstValidators.isNotEmpty(periodData.financialYear)
    ) {
      errs.financialYear = "Please select a financial year";
    }
    const periodVal = periodData.filingPeriod || periodData.filingMonth;
    if (!periodVal || !GstValidators.isNotEmpty(periodVal)) {
      errs.filingPeriod = "Please select a filing return period";
    }
    if (!GstValidators.isValidGstin(periodData.gstin)) {
      errs.gstin = "Enter a valid 15-character GSTIN (e.g. 29AAAAA0000A1Z5)";
    }
    if (!GstValidators.isNotEmpty(periodData.filingType)) {
      errs.filingType = "Please select a return type";
    }

    setPeriodErrors(errs);
    if (Object.keys(errs).length > 0) {
      const labels: Record<string, string> = {
        periodType: "Filing frequency",
        financialYear: "Financial year",
        filingPeriod: "Filing period",
        gstin: "GSTIN",
        filingType: "Return type",
      };
      const invalidFields = Object.keys(errs).map((key) => labels[key] || key);
      Alert.alert(
        "Review Filing Details",
        `Please correct the following fields:\n\n${invalidFields.map((field) => `• ${field}`).join("\n")}`,
      );
      return false;
    }
    return true;
  };

  const validatePaymentStep = (): boolean => {
    if (selectedMethod === "upi") {
      if (!GstValidators.isValidUpi(upiId)) {
        setUpiError("Enter a valid UPI ID (e.g. yourname@bank / mobile@upi)");
        Alert.alert(
          "Invalid UPI ID",
          "Please enter a valid UPI ID to complete payment.",
        );
        return false;
      }
    }
    setUpiError("");
    return true;
  };

  const handleBack = () => {
    if (currentStep === 5 || currentStep === 6) {
      setCurrentStep(4);
    } else if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const requiredDocs = documents.filter((d) => d.required);
  const missingDocs = requiredDocs.filter((d) => !d.fileUri);
  const missingDocsCount = missingDocs.length;
  const uploadedDocsCount = documents.filter((d) => Boolean(d.fileUri)).length;

  const handleUpdateDocuments = (updatedDocs: FilingDocItem[]) => {
    setDocuments(updatedDocs);
    if (createdAppId) {
      const existing = useApplicationStore
        .getState()
        .applications.find((a) => a.id === createdAppId);
      if (existing) {
        const appDocs = updatedDocs.map((d) => ({
          name: d.name,
          status: (d.fileUri ? "Uploaded" : "Pending") as
            | "Uploaded"
            | "Pending",
          fileUri: d.fileUri,
        }));
        applicationService
          .updateApplication({
            ...existing,
            documents: appDocs,
          })
          .catch(() => {});
      }
    }
  };

  const mapDocNameToEnum = (name: string) => {
    if (name.includes("Sales Invoices")) return "SALES_INVOICE";
    if (name.includes("Purchase Invoices")) return "PURCHASE_INVOICES";
    if (name.includes("GSTR-2B")) return "GSTR_2B_ITC_STATEMENT";
    if (name.includes("Credit Notes")) return "CREDIT_NOTES";
    if (name.includes("Debit Notes")) return "DEBIT_NOTES";
    if (name.includes("E-Invoice")) return "E_INVOICE_DATA";
    if (name.includes("E-Way Bill")) return "E_WAY_BILL_DATA";
    if (name.includes("Expense Invoices"))
      return "EXPENSE_INVOICES_AND_VOUCHERS";
    if (name.includes("Bank Statement")) return "BANK_STATEMENT";
    if (name.includes("Previous GST Returns")) return "PREVIOUS_GST_RETURNS";
    if (name.includes("Previous Filing Acknowledgement"))
      return "PREVIOUS_FILING_ACKNOWLEDGEMENT";
    return "OTHER_SUPPORTING_DOCUMENTS";
  };

  const handleContinue = async () => {
    if (currentStep === 0) {
      if (!validatePeriodStep()) return;

      setIsSubmitting(true);
      try {
        const freq = periodData.periodType.toUpperCase().replace(" ", "_");
        const rawReturn = periodData.filingType
          ?.split(" ")[0]
          .replace("-", "_");

        const payload = {
          gstin: periodData.gstin,
          financialYear:
            periodData.financialYear?.replace("FY ", "") || "2025-26",
          filingPeriod: periodData.filingPeriod || periodData.filingMonth,
          filingFrequency: freq === "ANNUAL" ? "ANNUAL_FINANCIAL_YEAR" : freq,
          returnType: rawReturn,
          filingType:
            periodData.filingNature === "Nil Return" ? "NIL_RETURN" : "REGULAR",
          taxCalculationMethod:
            periodData.calculationMethod === "ca_assisted"
              ? "TAXEDGE_CA_CALCULATION"
              : "ESTIMATION_FIGURES",
          estimatedTaxableSales:
            periodData.calculationMethod === "manual_estimates"
              ? Number(periodData.taxableSales || periodData.turnover || 0)
              : null,
          estimatedTaxablePurchases:
            periodData.calculationMethod === "manual_estimates"
              ? Number(periodData.taxablePurchases || 0)
              : null,
          estimatedEligibleItc:
            periodData.calculationMethod === "manual_estimates"
              ? Number(periodData.eligibleItc || 0)
              : null,
        };

        // Agar pehle se ID ban chuki hai (yani user wapas back aaya tha aur edit kiya hai), toh PUT call se update kare
        if (filingId) {
          await gstApi.updateFiling(filingId, payload);
          setCurrentStep(1);
        } else {
          // Nayi request hai, toh POST call kare
          await gstApi.createFiling(payload);
          const filings = await gstApi.fetchFilings(periodData.gstin);
          if (filings && filings.length > 0) {
            // Backend doesn't sort, so we must sort by createdAt to get the true latest
            const sortedFilings = [...filings].sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            );
            const latest = sortedFilings[sortedFilings.length - 1];
            setFilingId(latest.id);
          }
          setCurrentStep(1);
        }
      } catch (e: any) {
        Alert.alert(
          "Error",
          "Failed to save filing period to backend. " +
            (e.message || String(e)),
        );
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep === 1) {
      if (!filingId) {
        setCurrentStep(2);
        return;
      }
      setIsSubmitting(true);
      try {
        const docsToUpload = documents.filter(
          (d) => d.fileUri && !(d as any).uploadedToBackend,
        );
        await Promise.all(
          docsToUpload.map(async (doc) => {
            const enumType = mapDocNameToEnum(doc.name);
            await gstApi.uploadFilingDocument(
              filingId,
              enumType,
              doc.fileUri!,
              doc.fileName || "doc.jpg",
            );
            (doc as any).uploadedToBackend = true;
          }),
        );
        setDocuments([...documents]);
        setCurrentStep(2);
      } catch (e: any) {
        Alert.alert(
          "Upload Error",
          e.message || "Failed to upload some documents to backend.",
        );
        // Do not allow continue on failure so the user knows it failed
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep === 2) {
      if (missingDocsCount > 0) {
        Alert.alert(
          "Documents Missing",
          `You have ${missingDocsCount} missing required document(s). Please upload all required documents before submitting your return.`,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Upload Now", onPress: () => setCurrentStep(1) },
          ],
        );
        return;
      }

      if (filingId && periodData.calculationMethod === "manual_estimates") {
        setIsSubmitting(true);
        try {
          const freq = periodData.periodType.toUpperCase().replace(" ", "_");
          const rawReturn = periodData.filingType
            ?.split(" ")[0]
            .replace("-", "_");
          const payload = {
            gstin: periodData.gstin,
            financialYear:
              periodData.financialYear?.replace("FY ", "") || "2025-26",
            filingPeriod: periodData.filingPeriod || periodData.filingMonth,
            filingFrequency: freq === "ANNUAL" ? "ANNUAL_FINANCIAL_YEAR" : freq,
            returnType: rawReturn,
            filingType:
              periodData.filingNature === "Nil Return"
                ? "NIL_RETURN"
                : "REGULAR",
            taxCalculationMethod: "ESTIMATION_FIGURES",
            estimatedTaxableSales: Number(
              periodData.taxableSales || periodData.turnover || 0,
            ),
            estimatedTaxablePurchases: Number(periodData.taxablePurchases || 0),
            estimatedEligibleItc: Number(periodData.eligibleItc || 0),
          };
          await gstApi.updateFiling(filingId, payload);
        } catch (e) {
          console.log("Update computation error", e);
        } finally {
          setIsSubmitting(false);
        }
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!validatePaymentStep()) return;
      setIsSubmitting(true);
      Alert.alert(
        "Payment unavailable",
        "Online payment processing and backend verification are not configured yet. Your filing was not marked as paid.",
        [{ text: "OK", onPress: () => setIsSubmitting(false) }],
      );
      return;
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

      {/* Main Scroll Content with ScrollView ref for scroll-to-top (keyboard-aware) */}
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          currentStep >= 4 && { paddingBottom: 24 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        overScrollMode="always"
        nestedScrollEnabled={true}
      >
        {currentStep === 0 && (
          <GstFilingPeriodStep
            data={periodData}
            errors={periodErrors}
            onChange={(fields) => {
              setPeriodData((prev) => ({ ...prev, ...fields }));
              setPeriodErrors((prev) => {
                const next = { ...prev };
                Object.keys(fields).forEach((k) => delete next[k]);
                return next;
              });
            }}
          />
        )}

        {currentStep === 1 && (
          <GstFilingDocumentsStep
            documents={documents}
            onUpdateDocuments={handleUpdateDocuments}
            filingPeriodText={`${periodData.filingType ? periodData.filingType.split(" ")[0] : "GSTR-1"} — ${periodData.filingPeriod || periodData.filingMonth || "Current Period"}`}
            filingNature={periodData.filingNature || "Regular Return"}
          />
        )}

        {currentStep === 2 && (
          <GstFilingReviewStep
            key={`${periodData.taxableSales || periodData.turnover || "0"}-${periodData.eligibleItc || "0"}`}
            gstin={periodData.gstin}
            businessName={
              periodData.tradeName ||
              periodData.businessName ||
              "Registered Business"
            }
            taxpayerScheme={periodData.taxpayerScheme || "Regular Scheme"}
            filingNature={periodData.filingNature || "Regular Return"}
            financialYear={periodData.financialYear || "FY 2025-26"}
            filingMonth={
              periodData.filingPeriod || periodData.filingMonth || "August 2025"
            }
            filingType={periodData.filingType || "GSTR-1"}
            filingFrequency={periodData.periodType || "Monthly"}
            uploadedDocsCount={uploadedDocsCount}
            totalRequiredDocsCount={requiredDocs.length}
            missingDocsCount={missingDocsCount}
            grossTaxableTurnover={
              periodData.taxableSales || periodData.turnover || 0
            }
            eligibleItc={periodData.eligibleItc || 0}
            onEditFilingDetails={() => setCurrentStep(0)}
            onEditTaxComputation={() => setCurrentStep(0)}
            onEditFilingFee={() => setCurrentStep(3)}
            onEditDocuments={() => setCurrentStep(1)}
            onReuploadDocuments={() => setCurrentStep(1)}
            onUpdateComputation={(turnover, itc) => {
              setPeriodData((prev) => ({
                ...prev,
                taxableSales: String(turnover),
                turnover: String(turnover),
                eligibleItc: String(itc),
              }));
              if (createdAppId) {
                const existing = useApplicationStore
                  .getState()
                  .applications.find((a) => a.id === createdAppId);
                if (existing) {
                  applicationService
                    .updateApplication({
                      ...existing,
                      formData: {
                        ...existing.formData,
                        turnover: String(turnover),
                        eligibleItc: String(itc),
                      },
                    })
                    .catch(() => {});
                }
              }
            }}
            onApprove={handleContinue}
            onRequestChanges={() =>
              Alert.alert(
                "Request Changes",
                "Your request has been forwarded to our Chartered Accountant. You will receive an updated return summary shortly.",
              )
            }
          />
        )}

        {currentStep === 3 && (
          <GstPaymentMethodStep
            amount="Amount unavailable"
            selectedMethod={selectedMethod}
            onSelectMethod={setSelectedMethod}
            upiId={upiId}
            onChangeUpiId={(id) => {
              setUpiId(id);
              setUpiError("");
            }}
            upiError={upiError}
          />
        )}

        {currentStep === 4 && (
          <GstPaymentSuccessStep
            amount="₹2,344"
            serviceName={`GST Filing (${periodData.filingType ? periodData.filingType.split(" ")[0] : "GSTR-3B"})`}
            txnId="Not available"
            paymentMethod={selectedMethod.toUpperCase()}
            filingPeriod={
              periodData.filingPeriod || periodData.filingMonth || "July 2026"
            }
            gstin={periodData.gstin || "Not provided"}
            onViewReceipt={() => setCurrentStep(5)}
            onViewApplication={() => setCurrentStep(6)}
          />
        )}

        {currentStep === 5 && (
          <GstPaymentReceiptStep
            amount="₹2,344"
            serviceName={`GST Filing Service (${periodData.filingType ? periodData.filingType.split(" ")[0] : "GSTR-3B"})`}
            invoiceNo={createdAppId ? `INV-2026-${createdAppId.slice(-5)}` : "Not available"}
            gstin={periodData.gstin || "Not provided"}
            period={
              periodData.filingPeriod || periodData.filingMonth || "July 2026"
            }
            txnId="Not available"
            paymentMethod={selectedMethod.toUpperCase()}
          />
        )}

        {currentStep === 6 && (
          <GstApplicationStatusStep
            appId={createdAppId || "Not available"}
            businessName={
              periodData.tradeName ||
              periodData.businessName ||
              (periodData.gstin
                ? `GSTIN: ${periodData.gstin}`
                : "Registered Business")
            }
            serviceName={`GST Filing (${periodData.filingPeriod || periodData.filingMonth || "Current Period"})`}
            appliedDate="Today"
            estCompletion="1-2 Business Days"
            isFilingWorkflow={true}
            onReuploadDocuments={() => setCurrentStep(1)}
          />
        )}

        {/* Action Button - Placed inside scroll content at the natural bottom */}
        {currentStep <= 3 && (
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleContinue}
              style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
              disabled={isSubmitting}
            >
              <Text style={styles.submitBtnText}>
                {isSubmitting ? "Saving..." : getButtonText()}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAwareScrollView>

      {/* Universal Save As Draft Confirmation Modal (Matching Image 1) */}
      <UniversalDraftModal
        visible={showDraftModal}
        title="Save Filing Progress?"
        message="You have unsaved changes in your GST return filing. Save your progress so you can resume anytime without re-entering details."
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

export default GstFilingScreen;
