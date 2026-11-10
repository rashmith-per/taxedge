/**
 * Component: GstBusinessStep
 * Refactored: Functional modular architecture with strict TypeScript concepts,
 * helper functions, DRY renderers, and robust exception handling (< 400 lines).
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard, TextInput } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "./GstBusinessStep.styles";
import { UniversalDatePicker } from "@/shared/components/UniversalDatePicker";
import { GstinInfoIcon, GstStatePickerModal } from "@/modules/gst/components/common";
import {
  FormInput,
  FormSelect,
  SectionCard,
  AccordionSection,
  sanitizeAlphanumericUpper,
} from "./GstFormElements";
import { GstBankDetailsSection } from "./GstBankDetailsSection";
import { GstConsentSection } from "./GstConsentSection";
import { GstSignatorySection } from "./GstSignatorySection";
import { BANK_FIELD_NAMES, SIGNATORY_FIELD_NAMES, isTextFormField } from "../../utils/gstDraftLifecycle";
import { formatUiDate } from "../../utils/gstRegistrationMapper";
import { GstValidators } from "@/modules/gst/utils/gstValidators";
import {
  normalizePersonName,
  normalizeBusinessName,
  normalizeBankName,
  normalizeAddress,
  normalizeAlphabeticLocation,
  finalizeTrim,
} from "@/modules/gst/utils/gstSpaceValidation";
import { logger } from "@/core/logging/logger";
import { hsnSacPolicy } from "@/modules/gst/utils/hsnSacPolicy";
import { useGstFieldLookups } from "@/modules/gst/gst-registration/hooks/useGstFieldLookups";
import {
  BUSINESS_TYPES, NATURE_OF_BUSINESS, REASONS,
  COMPOSITION_OPTIONS, PLACE_OPTIONS, ACCOUNT_TYPES,
  type GstBusinessFormData, type FormErrors,
} from "../../types/gstBusinessTypes";
export {
  BUSINESS_TYPES, NATURE_OF_BUSINESS, REASONS,
  COMPOSITION_OPTIONS, PLACE_OPTIONS, ACCOUNT_TYPES,
  type GstBusinessFormData, type FormErrors,
} from "../../types/gstBusinessTypes";

const BANK_FIELD_KEYS = BANK_FIELD_NAMES as readonly (keyof GstBusinessFormData)[]; const SIGNATORY_FIELD_KEYS = SIGNATORY_FIELD_NAMES as readonly (keyof GstBusinessFormData)[];

interface Props {
  data: GstBusinessFormData; onChange: (fields: Partial<GstBusinessFormData>) => void;
  onBlurField?: (field: keyof GstBusinessFormData) => void; errors?: FormErrors;
  onRequestScrollToSection?: (sectionKey: "bank" | "signatory", y?: number) => void;
  initialExpandedSection?: string | null; onSectionLayout?: (section: "bank" | "signatory" | "consent", y: number) => void;
  onFieldLayout?: (field: string, y: number) => void; focusedField?: string | null;
}

export const GstBusinessStep: React.FC<Props> = ({
  data,
  onChange,
  onBlurField,
  errors = {},
  onRequestScrollToSection,
  initialExpandedSection,
  onSectionLayout,
  onFieldLayout,
  focusedField,
}) => {
  const [userToggledBank, setUserToggledBank] = useState<boolean | null>(null);
  const [userToggledSignatory, setUserToggledSignatory] = useState<boolean | null>(null);
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const bankYRef = useRef(0);
  const signatoryYRef = useRef(0);
  const consentYRef = useRef(0);
  const inputRefs = useRef<Record<string, { focus?: () => void } | any>>({});
  const fieldOffsetsRef = useRef<Record<string, number>>({});

  const bankErrorCount = useMemo(() => BANK_FIELD_KEYS.filter((f) => Boolean(errors[f])).length, [errors]);
  const signatoryErrorCount = useMemo(() => SIGNATORY_FIELD_KEYS.filter((f) => Boolean(errors[f])).length, [errors]);
  const hasBankErrors = bankErrorCount > 0;
  const hasSignatoryErrors = signatoryErrorCount > 0;

  const isBankExpanded = hasBankErrors || (userToggledBank !== null ? userToggledBank : initialExpandedSection === "bank");
  const isSignatoryExpanded = hasSignatoryErrors || (userToggledSignatory !== null ? userToggledSignatory : initialExpandedSection === "signatory");

  useEffect(() => {
    if (!focusedField) return;
    if (isTextFormField(focusedField) && inputRefs.current[focusedField]) {
      const timer = setTimeout(() => { inputRefs.current[focusedField]?.focus(); }, 180);
      return () => clearTimeout(timer);
    }
  }, [focusedField]);

  useEffect(() => {
    const shouldExpandBank = initialExpandedSection === "bank" || hasBankErrors;
    const shouldExpandSignatory = initialExpandedSection === "signatory" || hasSignatoryErrors;
    const target = shouldExpandBank ? "bank" : shouldExpandSignatory ? "signatory" : null;
    if (!target) return;
    const timer = setTimeout(() => {
      if (shouldExpandBank) setUserToggledBank(true);
      if (shouldExpandSignatory) setUserToggledSignatory(true);
      const y = target === "bank" ? bankYRef.current : signatoryYRef.current;
      if (y > 0) onRequestScrollToSection?.(target, y);
    }, 150);
    return () => clearTimeout(timer);
  }, [initialExpandedSection, hasBankErrors, hasSignatoryErrors, onRequestScrollToSection]);

  const updateField = useCallback(<K extends keyof GstBusinessFormData>(field: K, value: GstBusinessFormData[K]) => {
    try { onChange({ [field]: value }); } catch (err) { logger.warn("[GstBusinessStep] Error updating field:", { field: String(field), error: err }); }
  }, [onChange]);

  const blurField = useCallback((field: keyof GstBusinessFormData) => {
    try { onBlurField?.(field); } catch (err) { logger.warn("[GstBusinessStep] Error blurring field:", { field: String(field), error: err }); }
  }, [onBlurField]);

  const handleInputChange = useCallback((f: string, t: string) => updateField(f as keyof GstBusinessFormData, t), [updateField]);
  const handleInputBlur = useCallback((f: string) => blurField(f as keyof GstBusinessFormData), [blurField]);
  const handleSelectField = useCallback((f: string, v: string) => updateField(f as keyof GstBusinessFormData, v), [updateField]);

  const renderInput = useCallback(
    (
      field: keyof GstBusinessFormData,
      label: string,
      placeholder: string,
      options?: {
        keyboardType?: "default" | "numeric" | "email-address";
        maxLength?: number;
        autoCapitalize?: "none" | "sentences" | "words" | "characters";
        transform?: (val: string) => string;
        onChangeOverride?: (val: string) => void;
        onBlurOverride?: (val: string) => void;
        errorOverride?: string;
        infoIcon?: React.ReactNode;
      },
    ) => {
      const val = (data?.[field] as string) ?? "";
      return (
        <FormInput
          key={field}
          field={field}
          label={label}
          value={val}
          inputRef={(node) => { inputRefs.current[field] = node; }}
          onChangeField={
            options?.onChangeOverride
              ? (_f, t) => options.onChangeOverride?.(options?.transform ? options.transform(t) : t)
              : options?.transform
              ? (_f, t) => handleInputChange(field, options.transform!(t))
              : handleInputChange
          }
          onBlurField={options?.onBlurOverride ? (_f) => { options.onBlurOverride?.(val); handleInputBlur(field); } : handleInputBlur}
          error={options?.errorOverride ?? errors?.[field]}
          placeholder={placeholder}
          keyboardType={options?.keyboardType}
          maxLength={options?.maxLength}
          autoCapitalize={options?.autoCapitalize}
          infoIcon={options?.infoIcon}
        />
      );
    },
    [data, errors, handleInputChange, handleInputBlur],
  );

  const renderSelect = useCallback(
    (field: keyof GstBusinessFormData, label: string, placeholder: string, options: readonly string[], cfg?: { searchable?: boolean; allowCustom?: boolean; searchPlaceholder?: string }) => (
      <FormSelect
        key={field}
        field={field}
        label={label}
        value={(data?.[field] as string) ?? ""}
        options={options as string[]}
        onSelectField={handleSelectField}
        error={errors?.[field]}
        placeholder={placeholder}
        searchable={cfg?.searchable}
        allowCustom={cfg?.allowCustom}
        searchPlaceholder={cfg?.searchPlaceholder}
      />
    ),
    [data, errors, handleSelectField],
  );

  const getYesterdayDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  };

  const renderDatePicker = useCallback(
    (field: keyof GstBusinessFormData, label: string, opts?: { maximumDate?: Date }) => (
      <UniversalDatePicker
        key={field}
        label={label}
        value={formatUiDate((data?.[field] as string) ?? "")}
        onChange={(d: string) => updateField(field, formatUiDate(d) || d)}
        error={errors?.[field]}
        valueFormat="DD-MM-YYYY"
        placeholder="DD-MM-YYYY"
        maximumDate={opts?.maximumDate}
      />
    ),
    [data, errors, updateField],
  );

  const renderStateField = () => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>State / UT *</Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setStateModalVisible(true)}
        style={[styles.selectInput, errors?.state && styles.inputError]}
        accessibilityRole="combobox"
        accessibilityLabel="State / UT"
      >
        <Text style={[styles.selectText, !data?.state && styles.placeholderText]}>
          {data?.state || "Select"}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#1E293B" />
      </TouchableOpacity>
      {errors?.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}
    </View>
  );

  const renderBusinessIdentity = () => (
    <SectionCard
      iconName="storefront-outline"
      title="Business Identity"
      subtitle="Legal name and constitutional details"
    >
      {renderInput("legalName", "Legal Name of Business (as per PAN) *", "Exactly as on the PAN card", {
        maxLength: 100,
        transform: normalizeBusinessName,
        onBlurOverride: (v) => updateField("legalName", finalizeTrim(v)),
      })}
      {renderInput("businessName", "Trade Name *", "Enter your business / trade name", {
        maxLength: 100,
        transform: normalizeBusinessName,
        onBlurOverride: (v) => updateField("businessName", finalizeTrim(v)),
        infoIcon: <GstinInfoIcon fieldType="tradeName" />,
      })}
      {renderSelect("businessType", "Constitution of Business *", "Select business type", BUSINESS_TYPES)}
      {renderSelect("natureOfBusiness", "Nature of Business *", "Select nature of business", NATURE_OF_BUSINESS)}
      {renderDatePicker("businessStartDate", "Date of Commencement of Business *", { maximumDate: new Date() })}
      {renderInput("businessPan", "Business PAN *", "Enter PAN (e.g., ABCPE1234F)", { autoCapitalize: "characters", maxLength: 10, transform: sanitizeAlphanumericUpper })}
    </SectionCard>
  );

  const renderRegistrationScheme = () => (
    <SectionCard
      iconName="ribbon-outline"
      title="Registration & Scheme"
      subtitle="Registration purpose and tax scheme"
    >
      {renderSelect("reasonForRegistration", "Reason for Registration *", "Select a reason", REASONS)}
      {renderSelect("compositionScheme", "Opting for Composition Scheme? *", "Select yes or no", COMPOSITION_OPTIONS)}
    </SectionCard>
  );

  const { pinLoading, handlePinLookup } = useGstFieldLookups({
    data,
    onChange,
  });

  const renderAddressSection = () => {
    const hsnClassification = hsnSacPolicy.classify(data?.hsnCode || "");
    return (
      <SectionCard
        iconName="location-outline"
        title="Principal Place of Business"
        subtitle="Registered business address & HSN details"
      >
        {renderSelect("placeOfBusiness", "Place of Business *", "Select place type", PLACE_OPTIONS)}
        {renderInput("businessAddress", "Business Address *", "Building, street, locality", {
          maxLength: 250,
          transform: normalizeAddress,
          onBlurOverride: (v) => updateField("businessAddress", finalizeTrim(v)),
        })}
        <View style={styles.row}>
          <View style={styles.halfField}>{renderInput("city", "City *", "City", {
            maxLength: 50,
            transform: normalizeAlphabeticLocation,
            onBlurOverride: (v) => updateField("city", finalizeTrim(v)),
          })}</View>
          <View style={styles.halfField}>{renderInput("district", "District *", "District", {
            maxLength: 50,
            transform: normalizeAlphabeticLocation,
            onBlurOverride: (v) => updateField("district", finalizeTrim(v)),
          })}</View>
        </View>
        <View style={styles.row}>
          <View style={styles.halfField}>
            {renderStateField()}
          </View>
          <View style={styles.halfField}>
            {renderInput("pinCode", "PIN Code *", "560001", {
              keyboardType: "numeric",
              maxLength: 6,
              onChangeOverride: (pin) => {
                updateField("pinCode", pin);
                if (GstValidators.isValidPinCode(pin)) handlePinLookup(pin);
              },
            })}
            {pinLoading && <Text style={styles.lookupInfoText}>Looking up PIN code...</Text>}
          </View>
        </View>
        {renderInput("hsnCode", "Primary HSN / SAC Code *", "e.g. 998311", {
          keyboardType: "numeric",
          maxLength: 8,
          infoIcon: <GstinInfoIcon fieldType="sacCode" />,
        })}
        {hsnClassification?.isValid && (
          <View style={{ marginTop: -8, marginBottom: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: hsnClassification.type === "SAC" ? "#EFF6FF" : "#F0FDF4", alignSelf: "flex-start", borderWidth: 1, borderColor: hsnClassification.type === "SAC" ? "#BFDBFE" : "#BBF7D0" }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: hsnClassification.type === "SAC" ? "#1D4ED8" : "#15803D" }}>
              ✓ {hsnClassification.label}
            </Text>
          </View>
        )}
      </SectionCard>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {renderBusinessIdentity()}
        {renderRegistrationScheme()}
        {renderAddressSection()}
        <GstBankDetailsSection
          data={data}
          errors={errors}
          isBankExpanded={isBankExpanded}
          bankErrorCount={bankErrorCount}
          onToggle={() => {
            const next = !isBankExpanded;
            setUserToggledBank(next);
            if (next) {
              Keyboard.dismiss();
              if (bankYRef.current > 0) onRequestScrollToSection?.("bank", bankYRef.current);
            }
          }}
          updateField={updateField}
          blurField={blurField}
          onChange={onChange}
          inputRefs={inputRefs}
          bankYRef={bankYRef}
          onSectionLayout={onSectionLayout}
          accountTypes={ACCOUNT_TYPES}
        />
        <GstSignatorySection
          data={data}
          errors={errors}
          isSignatoryExpanded={isSignatoryExpanded}
          signatoryErrorCount={signatoryErrorCount}
          onToggle={() => {
            const next = !isSignatoryExpanded;
            setUserToggledSignatory(next);
            if (next) {
              Keyboard.dismiss();
              if (signatoryYRef.current > 0) onRequestScrollToSection?.("signatory", signatoryYRef.current);
            }
          }}
          updateField={updateField}
          blurField={blurField}
          renderInput={renderInput}
          renderDatePicker={renderDatePicker}
          signatoryYRef={signatoryYRef}
          fieldOffsetsRef={fieldOffsetsRef}
          onSectionLayout={onSectionLayout}
          onFieldLayout={onFieldLayout}
          getYesterdayDate={getYesterdayDate}
        />
        <GstConsentSection
          aadhaarConsent={data?.aadhaarConsent}
          error={errors?.aadhaarConsent}
          onConsentChange={(val) => updateField("aadhaarConsent", val)}
          consentYRef={consentYRef}
          fieldOffsetsRef={fieldOffsetsRef}
          onSectionLayout={onSectionLayout}
          onFieldLayout={onFieldLayout}
        />
        <GstStatePickerModal
          visible={stateModalVisible}
          selectedState={data?.state || ""}
          onSelect={(st) => {
            updateField("state", st);
            setStateModalVisible(false);
          }}
          onClose={() => setStateModalVisible(false)}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};