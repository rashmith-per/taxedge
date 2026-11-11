import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { gstApi } from "@/modules/gst/services/gstApi";
import { GstValidators } from "@/modules/gst/utils/gstValidators";
import { getCurrentFinancialYear } from "@/modules/gst/utils/gstDateUtils";
import { dismissKeyboardThen } from "@/shared/components/KeyboardAwareFormLayout";
import { styles } from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/GstFilingPeriodStep.styles";
import { GstFilingSelectModal } from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/GstFilingSelectModal";
import { GstCalculationMethodSection } from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/GstCalculationMethodSection";
import { RecursivePills } from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/RecursivePills";
import { GstVerifiedEntityCard } from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/GstVerifiedEntityCard";
import { GstFilingSelectionModals } from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/GstFilingSelectionModals";
import { GstFrequencyPeriodSection } from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/GstFrequencyPeriodSection";
import {
  validateGstin,
  validateEstimatedAmount,
} from "@/modules/gst/gst-filing/utils/gstFilingValidation";
import { validateGstinLive } from "@/modules/gst/utils/gstValidation";
import { normalizeStructuredCode } from "@/modules/gst/utils/gstSpaceValidation";
import { GstinInfoIcon } from "@/modules/gst/components/common";
import {
  FILING_PERIODS,
  FILING_NATURE_OPTIONS,
  FINANCIAL_YEARS,
  getFilingPeriodsForFrequency,
  getReturnTypesForFrequency,
} from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/gstPeriodUtils";

export {
  FILING_PERIODS,
  FILING_NATURE_OPTIONS,
  FINANCIAL_YEARS,
  getFilingPeriodsForFrequency,
  getReturnTypesForFrequency,
};

export interface GstFilingPeriodData {
  periodType: string;
  financialYear?: string;
  filingPeriod?: string;
  filingMonth: string;
  gstin: string;
  filingType: string;
  filingNature?: "Regular Return" | "Nil Return";
  businessName?: string;
  tradeName?: string;
  legalName?: string;
  taxpayerScheme?: string;
  state?: string;
  isVerifiedEntity?: boolean;
  calculationMethod?: "ca_assisted" | "manual_estimates";
  taxableSales?: string;
  turnover?: string;
  exemptSales?: string;
  taxablePurchases?: string;
  eligibleItc?: string;
  customerId?: string;
  filingId?: string;
}

interface GstFilingPeriodStepProps {
  data: GstFilingPeriodData;
  onChange: (fields: Partial<GstFilingPeriodData>) => void;
  onBlurField?: (field: keyof GstFilingPeriodData) => void;
  onError?: (field: string, error: string) => void;
  errors?: Record<string, string>;
}

export const GstFilingPeriodStep: React.FC<GstFilingPeriodStepProps> = ({
  data,
  onChange,
  onBlurField,
  onError,
  errors = {},
}) => {
  const [showYearModal, setShowYearModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const gstinLookupRequestId = useRef(0);
  const lastQueriedGstinRef = useRef<string>("");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const rawGstin = data.gstin ? data.gstin.trim().toUpperCase() : "";

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!rawGstin || validateGstin(rawGstin, false) !== null) {
      return;
    }

    if (data.isVerifiedEntity && lastQueriedGstinRef.current === rawGstin) {
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (lastQueriedGstinRef.current === rawGstin && data.isVerifiedEntity) {
        return;
      }

      lastQueriedGstinRef.current = rawGstin;
      const requestId = ++gstinLookupRequestId.current;
      setIsLookingUp(true);

      try {
        const entity = await gstApi.lookupGstin(rawGstin);
        if (
          requestId === gstinLookupRequestId.current &&
          entity &&
          entity.gstin === rawGstin
        ) {
          onChange({
            businessName: entity.legalName,
            tradeName: entity.tradeName,
            taxpayerScheme: entity.taxpayerScheme,
            state: entity.state,
            isVerifiedEntity: true,
          });
        }
      } catch {
        // Safe failover on lookup failure
      } finally {
        if (requestId === gstinLookupRequestId.current) {
          setIsLookingUp(false);
        }
      }
    }, 350);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [data.gstin, data.isVerifiedEntity, onChange]);

  const handleGstinChange = (text: string) => {
    const cleaned = normalizeStructuredCode(text).slice(0, 15);
    if (cleaned === data.gstin) {
      return;
    }

    if (isLookingUp) {
      setIsLookingUp(false);
    }

    onChange({
      gstin: cleaned,
      isVerifiedEntity: false,
      businessName: undefined,
      tradeName: undefined,
      legalName: undefined,
      taxpayerScheme: undefined,
      state: undefined,
    });

    // Progressive live validation — error appears at the relevant character position
    onError?.("gstin", validateGstinLive(cleaned) ?? "");
  };

  const currentPeriods = useMemo(
    () =>
      getFilingPeriodsForFrequency(
        data.periodType,
        data.financialYear || getCurrentFinancialYear("FY ")
      ),
    [data.periodType, data.financialYear]
  );

  const currentReturnTypes = useMemo(
    () => getReturnTypesForFrequency(data.periodType),
    [data.periodType]
  );

  const getPeriodModalTitle = () => {
    if (data.periodType === "Quarterly") return "Select Filing Quarter";
    if (data.periodType === "Monthly") return "Select Filing Month";
    if (data.periodType === "Annual") return "Select Filing Year";
    return "Select Filing Period";
  };

  const selectedPeriodValue = data.filingPeriod || data.filingMonth;

  return (
    <View style={styles.container}>
      {/* CARD 1: Filing Frequency & Period */}
      <GstFrequencyPeriodSection
        data={data}
        errors={errors}
        filingPeriods={FILING_PERIODS}
        onChange={onChange}
        onError={onError}
        onBlurField={onBlurField}
        onOpenYearModal={() => dismissKeyboardThen(() => setShowYearModal(true))}
        onOpenPeriodModal={() => dismissKeyboardThen(() => setShowPeriodModal(true))}
        selectedPeriodValue={selectedPeriodValue}
      />

      {/* CARD 2: Taxpayer & Return Details */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconBox}>
            <Ionicons name="document-text-outline" size={18} color={BrandColors.PRIMARY_ORANGE} />
          </View>
          <View style={styles.sectionTitleWrap}>
            <Text style={styles.sectionMainTitle}>Taxpayer & Return Details</Text>
            <Text style={styles.sectionSubtitle}>Enter 15-character GSTIN & return type</Text>
          </View>
        </View>

        {/* 4. GSTIN (15-Character) */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { marginBottom: 0 }]}>
              GSTIN (15-Character) <Text style={styles.star}>*</Text>
            </Text>
            <GstinInfoIcon />
          </View>
          <TextInput
            style={[styles.input, errors.gstin && styles.inputError]}
            placeholder="Enter GSTIN"
            placeholderTextColor="#94A3B8"
            value={data.gstin}
            onChangeText={handleGstinChange}
            onBlur={() => {
              if (data.gstin) {
                const err = validateGstin(data.gstin, true);
                onError?.("gstin", err || "");
              }
              onBlurField?.("gstin");
            }}
            onSubmitEditing={() => {
              if (data.gstin) {
                const err = validateGstin(data.gstin, true);
                onError?.("gstin", err || "");
              }
            }}
            returnKeyType="done"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={15}
          />
          {isLookingUp ? (
            <ActivityIndicator
              size="small"
              color={BrandColors.PRIMARY_ORANGE}
              style={styles.lookupIndicator}
            />
          ) : null}
          {errors.gstin ? (
            <Text style={styles.errorText}>{errors.gstin}</Text>
          ) : null}

          {/* Backend-Verified Entity Card (auto-resolved from GST portal) */}
          <GstVerifiedEntityCard
            isVerifiedEntity={data.isVerifiedEntity}
            state={data.state}
            tradeName={data.tradeName}
            businessName={data.businessName}
            taxpayerScheme={data.taxpayerScheme}
          />
        </View>

        {/* 5. Filing Return Type Dropdown */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Filing Return Type *</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => dismissKeyboardThen(() => setShowTypeModal(true))}
            style={[styles.selectInput, errors.filingType && styles.inputError]}
          >
            <Text
              style={[styles.selectText, !data.filingType && styles.placeholderText]}
              numberOfLines={1}
            >
              {data.filingType || "Select return type"}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#64748B" />
          </TouchableOpacity>
          {errors.filingType ? (
            <Text style={styles.errorText}>{errors.filingType}</Text>
          ) : null}
        </View>

        {/* 6. Filing Type (Regular vs Nil) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Filing Type *</Text>
          <View style={styles.periodPillsRow}>
            <RecursivePills
              items={FILING_NATURE_OPTIONS}
              selectedValue={data.filingNature || "Regular Return"}
              onSelect={(type) =>
                onChange({ filingNature: type as "Regular Return" | "Nil Return" })
              }
            />
          </View>
        </View>
      </View>

      {/* 7. Tax Calculation Method */}
      {data.filingNature !== "Nil Return" ? (
        <GstCalculationMethodSection
          calculationMethod={data.calculationMethod}
          taxableSales={data.taxableSales}
          taxablePurchases={data.taxablePurchases}
          eligibleItc={data.eligibleItc}
          errors={errors}
          onChange={(fields) => {
            onChange(fields);
            const isManual = fields.calculationMethod === "manual_estimates" || data.calculationMethod === "manual_estimates";
            if ("taxableSales" in fields) {
              const err = validateEstimatedAmount(fields.taxableSales, "sales", isManual);
              onError?.("taxableSales", err || "");
            }
            if ("taxablePurchases" in fields) {
              const err = validateEstimatedAmount(fields.taxablePurchases, "purchases", isManual);
              onError?.("taxablePurchases", err || "");
            }
            if ("eligibleItc" in fields) {
              const err = validateEstimatedAmount(fields.eligibleItc, "eligible ITC", isManual);
              onError?.("eligibleItc", err || "");
            }
          }}
          onBlurField={(field) => {
            const isManual = data.calculationMethod === "manual_estimates";
            if (field === "taxableSales") {
              const err = validateEstimatedAmount(data.taxableSales, "sales", isManual);
              onError?.("taxableSales", err || "");
            } else if (field === "taxablePurchases") {
              const err = validateEstimatedAmount(data.taxablePurchases, "purchases", isManual);
              onError?.("taxablePurchases", err || "");
            } else if (field === "eligibleItc") {
              const err = validateEstimatedAmount(data.eligibleItc, "eligible ITC", isManual);
              onError?.("eligibleItc", err || "");
            }
          }}
        />
      ) : null}

      {/* Selection Modals */}
      <GstFilingSelectionModals
        showYearModal={showYearModal}
        setShowYearModal={setShowYearModal}
        financialYears={FINANCIAL_YEARS}
        selectedYear={data.financialYear}
        onSelectYear={(item) => {
          onChange({
            financialYear: item,
            filingPeriod: "",
            filingMonth: "",
          });
        }}
        showPeriodModal={showPeriodModal}
        setShowPeriodModal={setShowPeriodModal}
        periodModalTitle={getPeriodModalTitle()}
        periods={currentPeriods}
        selectedPeriod={selectedPeriodValue}
        onSelectPeriod={(item) => {
          onChange({
            filingPeriod: item,
            filingMonth: item,
          });
        }}
        showTypeModal={showTypeModal}
        setShowTypeModal={setShowTypeModal}
        returnTypes={currentReturnTypes}
        selectedReturnType={data.filingType}
        onSelectReturnType={(item) => {
          onChange({ filingType: item });
        }}
      />
    </View>
  );
};
