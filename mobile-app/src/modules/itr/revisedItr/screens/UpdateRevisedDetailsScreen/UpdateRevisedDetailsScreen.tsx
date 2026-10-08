import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRevisedProgressStore } from "../../store/revisedProgressStore";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RevisedItrHeader } from "../../components/common";
import { RevisedFormField } from "../../components/update";
import { DEFAULT_REVISED_FORM_FIELDS } from "../../mock/revisedItrData";
import { RevisedFormFields } from "../../types/revisedItr.types";
import { logger } from "@/core/logging/logger";
import {
  styles,
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
  getBottomBarInsetsStyle,
} from "./UpdateRevisedDetailsScreen.styles";

export const UpdateRevisedDetailsScreen: React.FC = () => {
  const router = useRouter();
  const maxStepReached = useRevisedProgressStore((s) => s.maxStepReached);
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
      acknowledgementNumber?: string;
      assessmentYear?: string;
      revisionReason?: string;
      otherReasonText?: string;
      revisedDetails?: string;
    }>();

  const reason = params.revisionReason || "missed_income";
  const originalValues: RevisedFormFields = DEFAULT_REVISED_FORM_FIELDS;

  const storeFormData = useRevisedProgressStore((s) => s.formData);
  const setStoreFormData = useRevisedProgressStore((s) => s.setFormData);
  
  const getInitialForm = () => {
    if (params.revisedDetails) {
      try {
        return JSON.parse(params.revisedDetails);
      } catch (e) {
        logger.debug("[UpdateRevisedDetailsScreen] JSON parse fallback for revisedDetails", { error: e });
      }
    }
    return storeFormData || DEFAULT_REVISED_FORM_FIELDS;
  };
  
  const [form, setForm] = useState<RevisedFormFields>(getInitialForm());
  
  React.useEffect(() => {
    if (!storeFormData) {
      setStoreFormData(DEFAULT_REVISED_FORM_FIELDS);
    }
  }, []);
  
  // Update store when form changes
  React.useEffect(() => {
    setStoreFormData(form);
  }, [form]);
  const [errors, setErrors] = useState<Partial<Record<keyof RevisedFormFields, string>>>({});

  const parseNum = (str: string): number => {
    const cleaned = (str || "").replace(/[^\d.-]/g, "");
    const val = parseFloat(cleaned);
    return isNaN(val) ? 0 : val;
  };

  const formatRupee = (amount: number): string => {
    const abs = Math.abs(amount).toLocaleString("en-IN");
    if (amount > 0) return `+₹${abs}`;
    if (amount < 0) return `-₹${abs}`;
    return "—";
  };

  const getChange = (orig: string, rev: string): string => {
    if (!rev || rev.trim() === "") return "—";
    const o = parseNum(orig);
    const r = parseNum(rev);
    const diff = r - o;
    if (diff === 0) return "—";
    return formatRupee(diff);
  };

  const handleChange = (field: keyof RevisedFormFields, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RevisedFormFields, string>> = {};

    if (reason === "missed_income" || reason === "other") {
      if (!form.salaryBusinessIncome.trim()) {
        newErrors.salaryBusinessIncome = "Salary / Business income is required.";
      }
      if (!form.taxableIncome.trim()) {
        newErrors.taxableIncome = "Taxable income is required.";
      }
    }

    if (reason === "wrong_deduction") {
      if (!form.taxableIncome.trim()) {
        newErrors.taxableIncome = "Taxable income is required.";
      }
    }

    if (reason === "incorrect_bank") {
      const cleanBank = form.bankAccount.replace(/[^\w]/g, "");
      if (!cleanBank || cleanBank.length < 4) {
        newErrors.bankAccount = "Enter a valid bank account number.";
      }
      const cleanIfsc = form.ifsc.trim().toUpperCase();
      if (!cleanIfsc) {
        newErrors.ifsc = "IFSC code is required.";
      } else if (cleanIfsc.length !== 11) {
        newErrors.ifsc = "IFSC must be 11 characters.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;

    if (maxStepReached >= 3) {
      router.push({
        pathname: "/service/revised-itr-review",
        params: {
          acknowledgementNumber: params.acknowledgementNumber,
          assessmentYear: params.assessmentYear || "AY 2025—26",
          revisionReason: params.revisionReason,
            revisedDetails: JSON.stringify(form),
          }
        });
        return;
      }

    // Navigate to Screen 4: Upload Supporting Documents
    router.push({
      pathname: "/service/revised-itr-documents",
      params: {
        acknowledgementNumber: params.acknowledgementNumber,
        assessmentYear: params.assessmentYear || "AY 2025—26",
        revisionReason: params.revisionReason,
        revisedDetails: JSON.stringify(form),
      },
    });
  };

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top)]}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <RevisedItrHeader subtitle="Update Details" />

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          getScrollContentInsetsStyle(insets.bottom),
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Update only what changed</Text>
          <Text style={styles.pageSubtitle}>
            Edit only the figures that need correcting.
          </Text>
        </View>

        {params.otherReasonText ? (
          <View style={styles.reasonNotice}>
            <Text style={styles.reasonNoticeText}>
              Reason: {params.otherReasonText}
            </Text>
          </View>
        ) : null}

        {/* 1. Missed Income Fields */}
        {(reason === "missed_income" || reason === "other") && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Income Correction</Text>
            </View>

            <RevisedFormField
              label="Salary / Business income"
              value={form.salaryBusinessIncome}
              originalValue={`₹${originalValues.salaryBusinessIncome}`}
              changeValue={getChange(originalValues.salaryBusinessIncome, form.salaryBusinessIncome)}
              onChangeText={(val) => handleChange("salaryBusinessIncome", val.replace(/[^0-9]/g, ""))}
                maxLength={12}
                keyboardType="numeric"
              isMandatory
              placeholder="Enter revised income"
              error={errors.salaryBusinessIncome}
            />

            <RevisedFormField
              label="Other income"
              value={form.otherIncome}
              originalValue={`₹${originalValues.otherIncome}`}
              changeValue={getChange(originalValues.otherIncome, form.otherIncome)}
              onChangeText={(val) => handleChange("otherIncome", val.replace(/[^0-9]/g, ""))}
                maxLength={12}
                keyboardType="numeric"
              placeholder="Enter revised income"
              error={errors.otherIncome}
            />
          </View>
        )}

        {/* 2. Wrong Deduction Fields */}
        {(reason === "wrong_deduction" || reason === "other") && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Deduction Correction</Text>
            </View>

            <RevisedFormField
              label="80C deduction"
              value={form.sec80c}
              originalValue={`₹${originalValues.sec80c}`}
              changeValue={getChange(originalValues.sec80c, form.sec80c)}
              onChangeText={(val) => handleChange("sec80c", val.replace(/[^0-9]/g, ""))}
                maxLength={12}
                keyboardType="numeric"
              placeholder="Enter amount"
            />

            <RevisedFormField
              label="80D deduction"
              value={form.sec80d}
              originalValue={`₹${originalValues.sec80d}`}
              changeValue={getChange(originalValues.sec80d, form.sec80d)}
              onChangeText={(val) => handleChange("sec80d", val.replace(/[^0-9]/g, ""))}
                maxLength={12}
                keyboardType="numeric"
              placeholder="Enter amount"
            />

            <RevisedFormField
              label="Home loan interest"
              value={form.homeLoanInterest}
              originalValue={`₹${originalValues.homeLoanInterest}`}
              changeValue={getChange(originalValues.homeLoanInterest, form.homeLoanInterest)}
              onChangeText={(val) => handleChange("homeLoanInterest", val.replace(/[^0-9]/g, ""))}
                maxLength={12}
                keyboardType="numeric"
              placeholder="Enter amount"
            />
          </View>
        )}

        {/* 3. Incorrect Bank Fields */}
        {(reason === "incorrect_bank" || reason === "other") && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Bank Details Correction</Text>
            </View>

            <RevisedFormField
              label="Bank account for refund"
              value={form.bankAccount}
              originalValue={originalValues.bankAccount}
              onChangeText={(val) => handleChange("bankAccount", val)}
                maxLength={18}
              isMandatory
              placeholder="Enter bank account number"
              error={errors.bankAccount}
            />

            <RevisedFormField
              label="IFSC"
              value={form.ifsc}
              originalValue={originalValues.ifsc}
              onChangeText={(val) => handleChange("ifsc", val.toUpperCase())}
                maxLength={11}
              isMandatory
              autoCapitalize="characters"
              placeholder="Enter 11-digit IFSC"
              error={errors.ifsc}
            />
          </View>
        )}

        {/* 4. Taxable Income (for income, deduction, or other revisions) */}
        {reason !== "incorrect_bank" && (
          <View>
            <RevisedFormField
              label="Taxable income"
              value={form.taxableIncome}
              originalValue={`₹${originalValues.taxableIncome}`}
              changeValue={getChange(originalValues.taxableIncome, form.taxableIncome)}
              onChangeText={(val) => handleChange("taxableIncome", val.replace(/[^0-9]/g, ""))}
                maxLength={12}
                keyboardType="numeric"
              isMandatory
              placeholder="Enter taxable income"
              error={errors.taxableIncome}
            />
          </View>
        )}
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
          onPress={handleContinue}
          style={styles.continueButton}
        >
          <Text style={styles.continueButtonText}>{maxStepReached >= 3 ? "Update and Continue" : "Continue"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UpdateRevisedDetailsScreen;
