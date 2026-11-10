import React from "react";
import { View, Text } from "react-native";
import { UniversalDatePicker } from "@/shared/components/UniversalDatePicker";
import { GstinInfoIcon } from "@/modules/gst/components/common";
import {
  FormInput,
  FormSelect,
  SectionCard,
  AccordionSection,
  sanitizeAlphanumericUpper,
} from "./GstFormElements";
import { GstBusinessFormData, FormErrors } from "./GstBusinessStep";
import {
  normalizePersonName,
  normalizeBankName,
  finalizeTrim,
} from "@/modules/gst/utils/gstSpaceValidation";
import { styles } from "./GstBusinessStep.styles";

interface BankDetailsProps {
  data: GstBusinessFormData;
  errors: FormErrors;
  isBankExpanded: boolean;
  bankErrorCount: number;
  onToggle: () => void;
  updateField: (field: keyof GstBusinessFormData, value: string) => void;
  blurField: (field: keyof GstBusinessFormData) => void;
  onChange: (fields: Partial<GstBusinessFormData>) => void;
  inputRefs: React.MutableRefObject<Record<string, any>>;
  bankYRef: React.MutableRefObject<number>;
  onSectionLayout?: (section: "bank" | "signatory" | "consent", y: number) => void;
  accountTypes: readonly string[];
}

export const GstBankDetailsSection: React.FC<BankDetailsProps> = React.memo(({
  data,
  errors,
  isBankExpanded,
  bankErrorCount,
  onToggle,
  updateField,
  blurField,
  onChange,
  inputRefs,
  bankYRef,
  onSectionLayout,
  accountTypes,
}) => (
  <View
    onLayout={(e) => {
      const y = e.nativeEvent.layout.y;
      bankYRef.current = y;
      onSectionLayout?.("bank", y);
    }}
  >
    <AccordionSection
      iconName="wallet-outline"
      title="Bank Details"
      subtitle="Account for refunds & credits"
      isExpanded={isBankExpanded}
      errorCount={bankErrorCount}
      onToggle={onToggle}
    >
      <FormInput
        field="accountHolderName"
        label="Account Holder Name *"
        placeholder="As per bank records"
        value={data.accountHolderName ?? ""}
        inputRef={(node) => { inputRefs.current.accountHolderName = node; }}
        onChangeField={(_f, t) => updateField("accountHolderName", normalizePersonName(t))}
        onBlurField={(_f) => { updateField("accountHolderName", finalizeTrim(data.accountHolderName)); blurField("accountHolderName"); }}
        error={errors.accountHolderName}
        maxLength={100}
      />
      <FormInput
        field="bankAccountNumber"
        label="Bank Account Number *"
        placeholder="Enter account number"
        value={data.bankAccountNumber ?? ""}
        inputRef={(node) => { inputRefs.current.bankAccountNumber = node; }}
        keyboardType="numeric"
        maxLength={18}
        onChangeField={(_f, acc) => {
          const cleanAcc = acc.replace(/[^0-9]/g, "");
          return data.confirmBankAccountNumber
            ? onChange({ bankAccountNumber: cleanAcc, confirmBankAccountNumber: data.confirmBankAccountNumber })
            : updateField("bankAccountNumber", cleanAcc);
        }}
        onBlurField={(_f) => {
          updateField("bankAccountNumber", (data.bankAccountNumber || "").trim());
          if (data.confirmBankAccountNumber) blurField("confirmBankAccountNumber");
          blurField("bankAccountNumber");
        }}
        error={errors.bankAccountNumber}
      />
      <FormInput
        field="confirmBankAccountNumber"
        label="Confirm Account Number *"
        placeholder="Re-enter account number"
        value={data.confirmBankAccountNumber ?? ""}
        inputRef={(node) => { inputRefs.current.confirmBankAccountNumber = node; }}
        keyboardType="numeric"
        maxLength={18}
        onChangeField={(_f, acc) => updateField("confirmBankAccountNumber", acc.replace(/[^0-9]/g, ""))}
        onBlurField={(_f) => {
          updateField("confirmBankAccountNumber", (data.confirmBankAccountNumber || "").trim());
          blurField("confirmBankAccountNumber");
        }}
        error={errors.confirmBankAccountNumber}
      />
      <FormInput
        field="ifscCode"
        label="IFSC Code *"
        placeholder="e.g. HDFC0001234"
        value={data.ifscCode ?? ""}
        inputRef={(node) => { inputRefs.current.ifscCode = node; }}
        autoCapitalize="characters"
        maxLength={11}
        onChangeField={(_f, t) => updateField("ifscCode", sanitizeAlphanumericUpper(t))}
        onBlurField={(_f) => blurField("ifscCode")}
        error={errors.ifscCode}
      />
      <View style={styles.row}>
        <View style={styles.halfField}>
          <FormInput
            field="bankName"
            label="Bank Name *"
            placeholder="Enter Bank Name (e.g. HDFC Bank)"
            value={data.bankName ?? ""}
            inputRef={(node) => { inputRefs.current.bankName = node; }}
            maxLength={100}
            onChangeField={(_f, t) => updateField("bankName", normalizeBankName(t))}
            onBlurField={(_f) => { updateField("bankName", finalizeTrim(data.bankName)); blurField("bankName"); }}
            error={errors.bankName}
          />
        </View>
        <View style={styles.halfField}>
          <FormInput
            field="branchName"
            label="Branch Name *"
            placeholder="Enter Branch Name"
            value={data.branchName ?? ""}
            inputRef={(node) => { inputRefs.current.branchName = node; }}
            maxLength={100}
            onChangeField={(_f, t) => updateField("branchName", normalizeBankName(t))}
            onBlurField={(_f) => { updateField("branchName", finalizeTrim(data.branchName)); blurField("branchName"); }}
            error={errors.branchName}
          />
        </View>
      </View>
      <FormSelect
        field="accountType"
        label="Account Type *"
        placeholder="Select account type"
        value={data.accountType ?? ""}
        options={accountTypes as string[]}
        onSelectField={(_f, v) => updateField("accountType", v)}
        error={errors.accountType}
      />
    </AccordionSection>
  </View>
));
GstBankDetailsSection.displayName = "GstBankDetailsSection";
