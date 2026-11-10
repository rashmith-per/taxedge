import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "./GstFilingPeriodStep.styles";
import { RecursivePills } from "./RecursivePills";
import { dismissKeyboardThen } from "@/shared/components/KeyboardAwareFormLayout";
import { GstFilingPeriodData } from "./GstFilingPeriodStep";

interface FrequencyPeriodSectionProps {
  data: GstFilingPeriodData;
  errors: Record<string, string>;
  filingPeriods: readonly string[];
  onChange: (fields: Partial<GstFilingPeriodData>) => void;
  onError?: (field: string, error: string) => void;
  onBlurField?: (field: keyof GstFilingPeriodData) => void;
  onOpenYearModal: () => void;
  onOpenPeriodModal: () => void;
  selectedPeriodValue?: string;
}

export const GstFrequencyPeriodSection: React.FC<FrequencyPeriodSectionProps> = React.memo(({
  data,
  errors,
  filingPeriods,
  onChange,
  onError,
  onBlurField,
  onOpenYearModal,
  onOpenPeriodModal,
  selectedPeriodValue,
}) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconBox}>
        <Ionicons name="calendar-outline" size={18} color={BrandColors.PRIMARY_ORANGE} />
      </View>
      <View style={styles.sectionTitleWrap}>
        <Text style={styles.sectionMainTitle}>Filing Frequency & Period</Text>
        <Text style={styles.sectionSubtitle}>Select filing frequency and return period</Text>
      </View>
    </View>

    {/* 1. Select Filing Frequency (Pills) */}
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>Select Filing Frequency *</Text>
      <View style={styles.periodPillsRow}>
        <RecursivePills
          items={filingPeriods}
          selectedValue={data.periodType}
          onSelect={(period) => {
            onChange({
              periodType: period,
              filingPeriod: "",
              filingMonth: "",
              filingType: "",
            });
            onError?.("periodType", "");
            onError?.("filingPeriod", "");
            onBlurField?.("periodType");
          }}
        />
      </View>
      <Text style={styles.frequencyHint}>
        Frequency filters both the period list and the return types below.
      </Text>
      {errors.periodType ? (
        <Text style={styles.errorText}>{errors.periodType}</Text>
      ) : null}
    </View>

    {/* 2. Financial Year Dropdown */}
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>Financial Year *</Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => dismissKeyboardThen(onOpenYearModal)}
        style={[styles.selectInput, errors.financialYear && styles.inputError]}
      >
        <Text
          style={[styles.selectText, !data.financialYear && styles.placeholderText]}
        >
          {data.financialYear || "Select financial year"}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#64748B" />
      </TouchableOpacity>
      <Text style={styles.frequencyHint}>
        Historical periods are available based on GST portal eligibility and filing rules.
      </Text>
      {errors.financialYear ? (
        <Text style={styles.errorText}>{errors.financialYear}</Text>
      ) : null}
    </View>

    {/* 3. Filing Period / Return Period Dropdown */}
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>Filing Period / Return Period *</Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          if (!data.periodType) {
            onError?.("filingPeriod", "Select filing frequency first");
            return;
          }
          dismissKeyboardThen(onOpenPeriodModal);
        }}
        style={[
          styles.selectInput,
          (errors.filingPeriod || errors.filingMonth) && styles.inputError,
          !data.periodType && { opacity: 0.75 },
        ]}
      >
        <Text
          style={[styles.selectText, !selectedPeriodValue && styles.placeholderText]}
        >
          {selectedPeriodValue || (!data.periodType ? "Select filing frequency first" : "Select return period")}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#64748B" />
      </TouchableOpacity>
      {errors.filingPeriod || errors.filingMonth ? (
        <Text style={styles.errorText}>
          {errors.filingPeriod || errors.filingMonth}
        </Text>
      ) : null}
    </View>
  </View>
));
GstFrequencyPeriodSection.displayName = "GstFrequencyPeriodSection";
