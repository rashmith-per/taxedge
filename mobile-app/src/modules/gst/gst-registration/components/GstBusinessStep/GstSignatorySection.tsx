import React from "react";
import { View, Keyboard } from "react-native";
import { GstBusinessFormData, FormErrors } from "./GstBusinessStep";
import { AccordionSection, sanitizeAlphanumericUpper } from "./GstFormElements";
import { styles } from "./GstBusinessStep.styles";
import {
  normalizePersonName,
  finalizeTrim,
} from "@/modules/gst/utils/gstSpaceValidation";
import { getMaxDobForEighteen } from "@/modules/gst/validators/dobValidators";

interface GstSignatorySectionProps {
  data: GstBusinessFormData;
  errors: FormErrors;
  isSignatoryExpanded: boolean;
  signatoryErrorCount: number;
  onToggle: () => void;
  updateField: (field: keyof GstBusinessFormData, val: any) => void;
  blurField: (field: keyof GstBusinessFormData) => void;
  renderInput: (field: keyof GstBusinessFormData, label: string, placeholder: string, opts?: any) => React.ReactNode;
  renderDatePicker: (field: keyof GstBusinessFormData, label: string, opts?: any) => React.ReactNode;
  signatoryYRef: React.MutableRefObject<number>;
  fieldOffsetsRef: React.MutableRefObject<Record<string, number>>;
  onSectionLayout?: (section: "bank" | "signatory" | "consent", y: number) => void;
  onFieldLayout?: (field: string, y: number) => void;
  getYesterdayDate: () => Date;
}

export const GstSignatorySection: React.FC<GstSignatorySectionProps> = ({
  data,
  errors,
  isSignatoryExpanded,
  signatoryErrorCount,
  onToggle,
  updateField,
  blurField,
  renderInput,
  renderDatePicker,
  signatoryYRef,
  fieldOffsetsRef,
  onSectionLayout,
  onFieldLayout,
  getYesterdayDate,
}) => {
  return (
    <View
      onLayout={(e) => {
        const y = e.nativeEvent.layout.y;
        signatoryYRef.current = y;
        onSectionLayout?.("signatory", y);
      }}
    >
      <AccordionSection
        iconName="person-circle-outline"
        title="Authorised Signatory"
        subtitle="Primary contact & PAN verification"
        isExpanded={isSignatoryExpanded}
        errorCount={signatoryErrorCount}
        onToggle={onToggle}
      >
        <View
          onLayout={(e) => {
            const y = signatoryYRef.current + e.nativeEvent.layout.y;
            fieldOffsetsRef.current.signatoryName = y;
            onFieldLayout?.("signatoryName", y);
          }}
        >
          {renderInput("signatoryName", "Signatory Name *", "Full name", {
            maxLength: 100,
            transform: normalizePersonName,
            onBlurOverride: (v: string) => updateField("signatoryName", finalizeTrim(v)),
          })}
        </View>
        <View
          style={styles.row}
          onLayout={(e) => {
            const y = signatoryYRef.current + e.nativeEvent.layout.y;
            fieldOffsetsRef.current.signatoryPan = y;
            fieldOffsetsRef.current.signatoryDob = y;
            onFieldLayout?.("signatoryPan", y);
            onFieldLayout?.("signatoryDob", y);
          }}
        >
          <View style={styles.halfField}>
            {renderInput("signatoryPan", "Signatory PAN *", "ABCPE1234F", {
              autoCapitalize: "characters",
              maxLength: 10,
              transform: sanitizeAlphanumericUpper,
            })}
          </View>
          <View style={styles.halfField}>
            {renderDatePicker("signatoryDob", "Date of Birth *", {
              maximumDate: getMaxDobForEighteen(),
            })}
          </View>
        </View>
        <View
          onLayout={(e) => {
            const y = signatoryYRef.current + e.nativeEvent.layout.y;
            fieldOffsetsRef.current.signatoryDesignation = y;
            onFieldLayout?.("signatoryDesignation", y);
          }}
        >
          {renderInput("signatoryDesignation", "Designation *", "Proprietor / Director / Partner", {
            maxLength: 50,
            transform: normalizePersonName,
            onBlurOverride: (v: string) => updateField("signatoryDesignation", finalizeTrim(v)),
          })}
        </View>
        <View
          style={styles.row}
          onLayout={(e) => {
            const y = signatoryYRef.current + e.nativeEvent.layout.y;
            fieldOffsetsRef.current.signatoryMobile = y;
            fieldOffsetsRef.current.signatoryEmail = y;
            onFieldLayout?.("signatoryMobile", y);
            onFieldLayout?.("signatoryEmail", y);
          }}
        >
          <View style={styles.halfField}>
            {renderInput("signatoryMobile", "Signatory Mobile *", "10-digit", {
              keyboardType: "numeric",
              maxLength: 10,
            })}
          </View>
          <View style={styles.halfField}>
            {renderInput("signatoryEmail", "Signatory Email *", "email@business.com", {
              keyboardType: "email-address",
              maxLength: 150,
              autoCapitalize: "none",
              onBlurOverride: (email: string) => updateField("signatoryEmail", email.trim()),
            })}
          </View>
        </View>
      </AccordionSection>
    </View>
  );
};
