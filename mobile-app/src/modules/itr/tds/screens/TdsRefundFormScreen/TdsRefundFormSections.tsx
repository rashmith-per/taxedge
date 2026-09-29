import React, { RefObject } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import {
  BankAccountType,
  BankRefundDetails,
  IncomeTaxDetails,
  PersonalDetails,
} from "../../types/customerIncome.types";
import { cleanAccountNumber } from "../../utils/tdsValidation";
import { CustomerFormErrors } from "../../validation/tdsCustomerSchema";
import { TdsRefundPersonalInfoCard } from "../../components/personal/TdsRefundPersonalInfoCard";
import { TdsConditionalIncomeSection } from "../../components/form/TdsConditionalIncomeSection";
import { styles } from "./TdsRefundFormScreen.styles";

export type UpdateBankField = <K extends keyof BankRefundDetails>(
  field: K,
  value: BankRefundDetails[K]
) => void;

export type UpdateIncomeField = <K extends keyof IncomeTaxDetails>(
  field: K,
  value: IncomeTaxDetails[K]
) => void;

/** Input refs owned by the screen; used to chain "next" focus across sections. */
export interface TdsFormInputRefs {
  accHolderRef: RefObject<TextInput | null>;
  accNumRef: RefObject<TextInput | null>;
  confirmAccNumRef: RefObject<TextInput | null>;
  ifscRef: RefObject<TextInput | null>;
  salaryRef: RefObject<TextInput | null>;
  otherIncomeRef: RefObject<TextInput | null>;
  interestRef: RefObject<TextInput | null>;
  tdsRef: RefObject<TextInput | null>;
  tcsRef: RefObject<TextInput | null>;
  advanceTaxRef: RefObject<TextInput | null>;
  selfTaxRef: RefObject<TextInput | null>;
}

const SectionHeader: React.FC<{ number: number; title: string }> = ({ number, title }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionNumberBadge}>
      <Text style={styles.sectionNumberText}>{number}</Text>
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

/* ========================================================
    SECTION 1: PERSONAL INFORMATION (COMPACT CARD)
======================================================== */
interface PersonalInfoSectionProps {
  personal: PersonalDetails;
  isLoading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  onSaveProfile: (updated: PersonalDetails) => Promise<void>;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  personal,
  isLoading,
  errorMessage,
  onRetry,
  onSaveProfile,
}) => (
  <TdsRefundPersonalInfoCard
    personalData={personal}
    isLoading={isLoading}
    isError={Boolean(errorMessage)}
    errorMessage={errorMessage || undefined}
    onRetry={onRetry}
    onSaveProfile={onSaveProfile}
  />
);

/* ========================================================
    SECTION 2: REFUND BANK ACCOUNT
======================================================== */
interface RefundBankAccountSectionProps {
  bank: BankRefundDetails;
  errors: CustomerFormErrors;
  inputs: TdsFormInputRefs;
  isIfscLoading: boolean;
  ifscError: string | null;
  updateBank: UpdateBankField;
  onIfscChange: (val: string) => void;
}

export const RefundBankAccountSection: React.FC<RefundBankAccountSectionProps> = ({
  bank,
  errors,
  inputs: { accHolderRef, accNumRef, confirmAccNumRef, ifscRef, salaryRef },
  isIfscLoading,
  ifscError,
  updateBank,
  onIfscChange,
}) => (
  <View style={styles.sectionCard}>
    <SectionHeader number={2} title="Refund Bank Account" />

    {/* Account Holder Name */}
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        Account Holder Name <Text style={styles.requiredAsterisk}>*</Text>
      </Text>
      <TextInput
        ref={accHolderRef}
        style={[styles.textInput, errors["bank.accountHolderName"] ? styles.textInputError : null]}
        placeholder="Enter account holder name"
        placeholderTextColor="#94A3B8"
        value={bank.accountHolderName}
        onChangeText={(t) => updateBank("accountHolderName", t)}
        returnKeyType="next"
        onSubmitEditing={() => accNumRef.current?.focus()}
      />
      {errors["bank.accountHolderName"] && (
        <Text style={styles.errorText}>{errors["bank.accountHolderName"]}</Text>
      )}
    </View>

    {/* Bank Account Number (Full Width for clean fit) */}
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        Bank Account Number <Text style={styles.requiredAsterisk}>*</Text>
      </Text>
      <TextInput
        ref={accNumRef}
        style={[styles.textInput, errors["bank.accountNumber"] ? styles.textInputError : null]}
        placeholder="Enter account number"
        placeholderTextColor="#94A3B8"
        keyboardType="number-pad"
        value={bank.accountNumber}
        onChangeText={(t) => updateBank("accountNumber", cleanAccountNumber(t))}
        returnKeyType="next"
        onSubmitEditing={() => confirmAccNumRef.current?.focus()}
      />
      {errors["bank.accountNumber"] && (
        <Text style={styles.errorText}>{errors["bank.accountNumber"]}</Text>
      )}
    </View>

    {/* Confirm Account Number (Full Width for clean fit) */}
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        Confirm Account Number <Text style={styles.requiredAsterisk}>*</Text>
      </Text>
      <TextInput
        ref={confirmAccNumRef}
        style={[styles.textInput, errors["bank.confirmAccountNumber"] ? styles.textInputError : null]}
        placeholder="Re-enter account number"
        placeholderTextColor="#94A3B8"
        keyboardType="number-pad"
        value={bank.confirmAccountNumber}
        onChangeText={(t) => updateBank("confirmAccountNumber", cleanAccountNumber(t))}
        returnKeyType="next"
        onSubmitEditing={() => ifscRef.current?.focus()}
      />
      {errors["bank.confirmAccountNumber"] && (
        <Text style={styles.errorText}>{errors["bank.confirmAccountNumber"]}</Text>
      )}
    </View>

    {/* IFSC Code with Auto-Lookup */}
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        IFSC Code <Text style={styles.requiredAsterisk}>*</Text>
      </Text>
      <View style={styles.ifscRow}>
        <View style={styles.ifscInputWrap}>
          <TextInput
            ref={ifscRef}
            style={[
              styles.textInput,
              errors["bank.ifscCode"] || ifscError ? styles.textInputError : null,
            ]}
            placeholder="Enter IFSC"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
            maxLength={11}
            value={bank.ifscCode}
            onChangeText={onIfscChange}
            returnKeyType="next"
            onSubmitEditing={() => salaryRef.current?.focus()}
          />
        </View>
        {isIfscLoading && <ActivityIndicator size="small" color={BrandColors.PRIMARY_ORANGE} />}
      </View>

      {/* IFSC Status */}
      {isIfscLoading && (
        <View style={styles.ifscLoadingBox}>
          <Text style={styles.ifscLoadingText}>Verifying IFSC with RBI directory...</Text>
        </View>
      )}

      {bank.isIfscVerified && bank.bankName && (
        <View style={styles.ifscSuccessBox}>
          <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
          <Text style={styles.ifscSuccessText} numberOfLines={1}>
            {bank.bankName} • {bank.branchName}
          </Text>
        </View>
      )}

      {(errors["bank.ifscCode"] || ifscError) && (
        <Text style={styles.errorText}>{errors["bank.ifscCode"] || ifscError}</Text>
      )}
    </View>

    {/* Bank Name & Branch (Read-Only after lookup) */}
    <View style={styles.fieldRow}>
      <View style={[styles.fieldGroup, styles.fieldRowItem]}>
        <Text style={styles.fieldLabel}>Bank Name</Text>
        <TextInput
          style={[styles.textInput, styles.textInputReadOnly]}
          editable={false}
          placeholder="Auto-fetched via IFSC"
          placeholderTextColor="#94A3B8"
          value={bank.bankName}
        />
      </View>

      <View style={[styles.fieldGroup, styles.fieldRowItem]}>
        <Text style={styles.fieldLabel}>Branch</Text>
        <TextInput
          style={[styles.textInput, styles.textInputReadOnly]}
          editable={false}
          placeholder="Auto-fetched via IFSC"
          placeholderTextColor="#94A3B8"
          value={bank.branchName}
        />
      </View>
    </View>

    {/* Account Type */}
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>Account Type</Text>
      <View style={styles.chipGroup}>
        {(["savings", "current"] as BankAccountType[]).map((type) => (
          <TouchableOpacity
            key={type}
            activeOpacity={0.8}
            onPress={() => updateBank("accountType", type)}
            style={[styles.chip, bank.accountType === type ? styles.chipActive : null]}
          >
            <Text style={[styles.chipText, bank.accountType === type ? styles.chipTextActive : null]}>
              {type === "savings" ? "Savings Account" : "Current Account"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  </View>
);

/* ========================================================
    SECTION 3: INCOME & TAX INFORMATION
======================================================== */
interface IncomeSectionProps {
  income: IncomeTaxDetails;
  inputs: TdsFormInputRefs;
  updateIncome: UpdateIncomeField;
}

export const IncomeTaxInfoSection: React.FC<IncomeSectionProps> = ({
  income,
  inputs: { salaryRef, otherIncomeRef, interestRef, tdsRef },
  updateIncome,
}) => (
  <View style={styles.sectionCard}>
    <SectionHeader number={3} title="Income & Tax Information" />

    {/* Regime Selector */}
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>Tax Regime</Text>
      <View style={styles.regimeSelector}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => updateIncome("taxRegime", "NEW")}
          style={[styles.regimeOption, income.taxRegime === "NEW" ? styles.regimeOptionActive : null]}
        >
          <Text style={[styles.regimeTitle, income.taxRegime === "NEW" ? styles.regimeTitleActive : null]}>
            New Tax Regime
          </Text>
          <Text style={styles.regimeDesc}>u/s 115BAC • Standard Slab</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => updateIncome("taxRegime", "OLD")}
          style={[styles.regimeOption, income.taxRegime === "OLD" ? styles.regimeOptionActive : null]}
        >
          <Text style={[styles.regimeTitle, income.taxRegime === "OLD" ? styles.regimeTitleActive : null]}>
            Old Tax Regime
          </Text>
          <Text style={styles.regimeDesc}>Supports 80C, 80D, Home Loan</Text>
        </TouchableOpacity>
      </View>
    </View>

    {/* Salary Income */}
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>Salaried Gross Income (₹)</Text>
      <TextInput
        ref={salaryRef}
        style={styles.textInput}
        placeholder="Enter salary"
        placeholderTextColor="#94A3B8"
        keyboardType="numeric"
        value={income.salaryIncome}
        onChangeText={(t) => updateIncome("salaryIncome", t)}
        returnKeyType="next"
        onSubmitEditing={() => otherIncomeRef.current?.focus()}
      />
    </View>

    {/* Other & Interest Income */}
    <View style={styles.fieldRow}>
      <View style={[styles.fieldGroup, styles.fieldRowItem]}>
        <Text style={styles.fieldLabel}>Other Income (₹)</Text>
        <TextInput
          ref={otherIncomeRef}
          style={styles.textInput}
          placeholder="Enter other income"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={income.otherIncome}
          onChangeText={(t) => updateIncome("otherIncome", t)}
          returnKeyType="next"
          onSubmitEditing={() => interestRef.current?.focus()}
        />
      </View>

      <View style={[styles.fieldGroup, styles.fieldRowItem]}>
        <Text style={styles.fieldLabel}>Interest Income (₹)</Text>
        <TextInput
          ref={interestRef}
          style={styles.textInput}
          placeholder="Enter interest"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={income.interestIncome}
          onChangeText={(t) => updateIncome("interestIncome", t)}
          returnKeyType="next"
          onSubmitEditing={() => tdsRef.current?.focus()}
        />
      </View>
    </View>

    {/* Progressive Disclosure 1: Rental Income */}
    <TdsConditionalIncomeSection
      title="Rental Income"
      subtitle="House property rent"
      enabled={income.hasRentalIncome}
      onToggle={(enabled) => updateIncome("hasRentalIncome", enabled)}
    >
      {income.hasRentalIncome && (
        <View style={styles.conditionalFields}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Annual Rent Received (₹)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter rental income"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={income.rentalIncome}
              onChangeText={(t) => updateIncome("rentalIncome", t)}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Property Taxes Paid (₹)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter municipal taxes"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={income.municipalTaxesPaid}
              onChangeText={(t) => updateIncome("municipalTaxesPaid", t)}
            />
          </View>
        </View>
      )}
    </TdsConditionalIncomeSection>

    {/* Progressive Disclosure 2: Capital Gains */}
    <TdsConditionalIncomeSection
      title="Capital Gains"
      subtitle="Stocks / MF / Property"
      enabled={income.hasCapitalGains}
      onToggle={(enabled) => updateIncome("hasCapitalGains", enabled)}
    >
      {income.hasCapitalGains && (
        <View style={styles.conditionalFields}>
          <View style={styles.fieldRow}>
            <View style={[styles.fieldGroup, styles.fieldRowItem]}>
              <Text style={styles.fieldLabel}>Short-Term Gains (₹)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter STCG"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={income.shortTermCapitalGains}
                onChangeText={(t) => updateIncome("shortTermCapitalGains", t)}
              />
            </View>
            <View style={[styles.fieldGroup, styles.fieldRowItem]}>
              <Text style={styles.fieldLabel}>Long-Term Gains (₹)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter LTCG"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={income.longTermCapitalGains}
                onChangeText={(t) => updateIncome("longTermCapitalGains", t)}
              />
            </View>
          </View>
        </View>
      )}
    </TdsConditionalIncomeSection>

    {/* Progressive Disclosure 3: Business Income */}
    <TdsConditionalIncomeSection
      title="Business / Profession"
      subtitle="Freelance or business income"
      enabled={income.hasBusinessIncome}
      onToggle={(enabled) => updateIncome("hasBusinessIncome", enabled)}
    >
      {income.hasBusinessIncome && (
        <View style={styles.conditionalFields}>
          <View style={styles.fieldRow}>
            <View style={[styles.fieldGroup, styles.fieldRowItem]}>
              <Text style={styles.fieldLabel}>Turnover (₹)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter turnover"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={income.grossTurnover}
                onChangeText={(t) => updateIncome("grossTurnover", t)}
              />
            </View>
            <View style={[styles.fieldGroup, styles.fieldRowItem]}>
              <Text style={styles.fieldLabel}>Net Profit (₹)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter profit"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={income.netBusinessProfit}
                onChangeText={(t) => updateIncome("netBusinessProfit", t)}
              />
            </View>
          </View>
        </View>
      )}
    </TdsConditionalIncomeSection>

    {/* Progressive Disclosure 4: Home Loan */}
    <TdsConditionalIncomeSection
      title="Home Loan Interest"
      subtitle="Self-occupied house property"
      enabled={income.hasHomeLoan}
      onToggle={(enabled) => updateIncome("hasHomeLoan", enabled)}
    >
      {income.hasHomeLoan && (
        <View style={styles.conditionalFields}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Interest Paid (Sec 24b) (₹)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter interest paid"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={income.homeLoanInterestSec24b}
              onChangeText={(t) => updateIncome("homeLoanInterestSec24b", t)}
            />
          </View>
        </View>
      )}
    </TdsConditionalIncomeSection>

    {/* Progressive Disclosure 5: Deductions (80C, 80D) */}
    <TdsConditionalIncomeSection
      title="Tax Deductions"
      subtitle="Section 80C, 80D, 80G"
      enabled={income.hasDeductions}
      onToggle={(enabled) => updateIncome("hasDeductions", enabled)}
    >
      {income.hasDeductions && (
        <View style={styles.conditionalFields}>
          <View style={styles.fieldRow}>
            <View style={[styles.fieldGroup, styles.fieldRowItem]}>
              <Text style={styles.fieldLabel}>80C (PPF, ELSS, LIC) (₹)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Up to ₹1.5L"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={income.deductions80C}
                onChangeText={(t) => updateIncome("deductions80C", t)}
              />
            </View>
            <View style={[styles.fieldGroup, styles.fieldRowItem]}>
              <Text style={styles.fieldLabel}>80D (Health Ins.) (₹)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Up to ₹75k"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={income.deductions80D}
                onChangeText={(t) => updateIncome("deductions80D", t)}
              />
            </View>
          </View>
        </View>
      )}
    </TdsConditionalIncomeSection>
  </View>
);

/* ========================================================
    SECTION 4: TDS & TAXES PAID (TAX CREDITS)
======================================================== */
interface TdsTaxesPaidSectionProps {
  income: IncomeTaxDetails;
  errors: CustomerFormErrors;
  inputs: TdsFormInputRefs;
  updateIncome: UpdateIncomeField;
}

export const TdsTaxesPaidSection: React.FC<TdsTaxesPaidSectionProps> = ({
  income,
  errors,
  inputs: { tdsRef, tcsRef, advanceTaxRef, selfTaxRef },
  updateIncome,
}) => (
  <View style={styles.sectionCard}>
    <SectionHeader number={4} title="TDS & Taxes Paid" />

    {/* Total TDS Deducted (Full Width) */}
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        Total TDS Deducted (₹) <Text style={styles.requiredAsterisk}>*</Text>
      </Text>
      <TextInput
        ref={tdsRef}
        style={[styles.textInput, errors["income.totalTdsDeducted"] ? styles.textInputError : null]}
        placeholder="Enter TDS amount"
        placeholderTextColor="#94A3B8"
        keyboardType="numeric"
        value={income.totalTdsDeducted}
        onChangeText={(t) => updateIncome("totalTdsDeducted", t)}
        returnKeyType="next"
        onSubmitEditing={() => tcsRef.current?.focus()}
      />
      {errors["income.totalTdsDeducted"] && (
        <Text style={styles.errorText}>{errors["income.totalTdsDeducted"]}</Text>
      )}
    </View>

    {/* TCS & Advance Tax (2 Columns - Spacious & Fits) */}
    <View style={styles.fieldRow}>
      <View style={[styles.fieldGroup, styles.fieldRowItem]}>
        <Text style={styles.fieldLabel}>TCS Amount (₹)</Text>
        <TextInput
          ref={tcsRef}
          style={styles.textInput}
          placeholder="Enter TCS"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={income.tcsAmount}
          onChangeText={(t) => updateIncome("tcsAmount", t)}
          returnKeyType="next"
          onSubmitEditing={() => advanceTaxRef.current?.focus()}
        />
      </View>

      <View style={[styles.fieldGroup, styles.fieldRowItem]}>
        <Text style={styles.fieldLabel}>Advance Tax (₹)</Text>
        <TextInput
          ref={advanceTaxRef}
          style={styles.textInput}
          placeholder="Enter advance tax"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={income.advanceTaxPaid}
          onChangeText={(t) => updateIncome("advanceTaxPaid", t)}
          returnKeyType="next"
          onSubmitEditing={() => selfTaxRef.current?.focus()}
        />
      </View>
    </View>

    {/* Self Assessment Tax (Full Width - Fits cleanly without clipping) */}
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>Self Assessment Tax Paid (₹)</Text>
      <TextInput
        ref={selfTaxRef}
        style={styles.textInput}
        placeholder="Enter self-assessment tax"
        placeholderTextColor="#94A3B8"
        keyboardType="numeric"
        value={income.selfAssessmentTaxPaid}
        onChangeText={(t) => updateIncome("selfAssessmentTaxPaid", t)}
        returnKeyType="done"
      />
    </View>
  </View>
);
