import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "../../../../../shared/theme";
import { VehicleLoanDetailsFormData } from "../../types/vehicleLoan.types";
import { LoanAmountInput, type LoanAmountPreset } from "../../../components/LoanAmountInput";
import { styles } from "./VehicleLoanFinancialsStep.styles";
import {
  VEHICLE_PURPOSES,
  TENURE_OPTIONS,
  TENURE_QUICK_PRESETS,
  VEHICLE_MODELS,
  AMOUNT_PRESETS,
  VEHICLE_CONDITIONS,
} from "./vehicleLoanFinancials.constants";
import { VehicleLoanSelectionModal, OptionRow } from "./components/VehicleLoanSelectionModal";

export interface VehicleLoanFinancialsStepProps {
  data: VehicleLoanDetailsFormData;
  onChange: (field: keyof VehicleLoanDetailsFormData, value: VehicleLoanDetailsFormData[keyof VehicleLoanDetailsFormData]) => void;
  errors?: Record<string, string>;
}


export const VehicleLoanFinancialsStep: React.FC<VehicleLoanFinancialsStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const [isPurposeModalOpen, setIsPurposeModalOpen] = useState(false);
  const [isTenureModalOpen, setIsTenureModalOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);

  const [isCustomTenure, setIsCustomTenure] = useState(() => {
    if (!data.preferredTenureMonths) return false;
    return !TENURE_OPTIONS.some((t) => t.value === data.preferredTenureMonths && t.value !== "Other");
  });

  const [isCustomModel, setIsCustomModel] = useState(() => {
    if (!data.vehicleMakeModel) return false;
    return !VEHICLE_MODELS.some((m) => m === data.vehicleMakeModel && !m.startsWith("Other"));
  });

  const isOthersSelected = data.purpose === "Others";
  const isUsedVehicle = data.vehicleCondition === "Pre-Owned / Used Vehicle";

  const handleSelectPurpose = (item: string) => {
    onChange("purpose", item);
    setIsPurposeModalOpen(false);
    if (item !== "Others") onChange("customPurpose", "");
    if (item === "Pre-Owned / Used Car" && !data.vehicleCondition) {
      onChange("vehicleCondition", "Pre-Owned / Used Vehicle");
    } else if (item === "New Car (Passenger)" && !data.vehicleCondition) {
      onChange("vehicleCondition", "New Vehicle");
    }
  };

  const handleSelectTenure = (val: string) => {
    setIsTenureModalOpen(false);
    if (val === "Other") {
      setIsCustomTenure(true);
      onChange("preferredTenureMonths", "");
    } else {
      setIsCustomTenure(false);
      onChange("preferredTenureMonths", val);
    }
  };

  const handleSelectModel = (model: string) => {
    setIsModelModalOpen(false);
    if (model.startsWith("Other")) {
      setIsCustomModel(true);
      onChange("vehicleMakeModel", "");
    } else {
      setIsCustomModel(false);
      onChange("vehicleMakeModel", model);
    }
  };

  const getTenureLabel = (val?: string) => {
    if (!val) return "Select Repayment Tenure...";
    const found = TENURE_OPTIONS.find((t) => t.value === val);
    if (found && found.value !== "Other") return found.label;
    return `${val} Months (Custom)`;
  };

  return (
    <View style={styles.container}>
      {/* 1. Required Auto Loan Amount Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons name="cash-outline" size={20} color={BrandColors.PRIMARY_ORANGE || "#EA580C"} />
            <Text style={styles.cardTitle}>Required Vehicle Loan Amount</Text>
          </View>
        </View>
        <Text style={styles.cardDescription}>Enter your required loan amount or select one of the quick presets below.</Text>

        <LoanAmountInput
          label="Amount (₹)"
          required
          placeholder="Enter required loan amount (₹)"
          value={data.requiredAmount}
          onChange={(value) => onChange("requiredAmount", value)}
          presets={AMOUNT_PRESETS}
          error={errors.requiredAmount}
        />
      </View>

      {/* 2. Vehicle Category & Purpose Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons name="car-outline" size={20} color={BrandColors.PRIMARY_ORANGE || "#EA580C"} />
            <Text style={styles.cardTitle}>Vehicle Category & Usage</Text>
          </View>
        </View>
        <Text style={styles.cardDescription}>Select your automobile category. Select "Others" if your specific requirement is not listed.</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Select Category / Purpose <Text style={styles.requiredStar}>*</Text></Text>
          <TouchableOpacity
            style={[styles.dropdownSelector, Boolean(data.purpose) && styles.dropdownSelectorActive, errors.purpose && styles.inputError]}
            onPress={() => setIsPurposeModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={data.purpose ? styles.dropdownText : styles.dropdownPlaceholder}>
              {data.purpose || "Select Vehicle Category / Purpose..."}
            </Text>
            <Ionicons name="chevron-down" size={18} color={data.purpose ? BrandColors.PRIMARY_ORANGE || "#EA580C" : "#64748B"} />
          </TouchableOpacity>
          {errors.purpose && <Text style={styles.errorText}>{errors.purpose}</Text>}

          {isOthersSelected && (
            <View style={styles.customInputContainer}>
              <Text style={styles.label}>Specify Custom Vehicle Purpose <Text style={styles.requiredStar}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.customPurpose && styles.inputError]}
                placeholder="Enter custom vehicle purpose"
                placeholderTextColor="#94A3B8"
                value={data.customPurpose || ""}
                onChangeText={(text) => onChange("customPurpose", text)}
              />
              {errors.customPurpose && <Text style={styles.errorText}>{errors.customPurpose}</Text>}
            </View>
          )}
        </View>
      </View>

      {/* 3. Repayment Tenure Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons name="time-outline" size={20} color={BrandColors.PRIMARY_ORANGE || "#EA580C"} />
            <Text style={styles.cardTitle}>Repayment Tenure</Text>
          </View>
        </View>
        <Text style={styles.cardDescription}>Select your intended loan tenure. Choose from short-term (below 1 year) to long-term (up to 7 years) or specify custom months.</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Select Tenure <Text style={styles.requiredStar}>*</Text></Text>
          <TouchableOpacity
            style={[styles.dropdownSelector, Boolean(data.preferredTenureMonths) && styles.dropdownSelectorActive, errors.preferredTenureMonths && styles.inputError]}
            onPress={() => setIsTenureModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={data.preferredTenureMonths ? styles.dropdownText : styles.dropdownPlaceholder}>
              {getTenureLabel(data.preferredTenureMonths)}
            </Text>
            <Ionicons name="chevron-down" size={18} color={data.preferredTenureMonths ? BrandColors.PRIMARY_ORANGE || "#EA580C" : "#64748B"} />
          </TouchableOpacity>
          {errors.preferredTenureMonths && <Text style={styles.errorText}>{errors.preferredTenureMonths}</Text>}

          <View style={styles.chipRow}>
            {TENURE_QUICK_PRESETS.map((item) => {
              const isSelected = data.preferredTenureMonths === item.value;
              return (
                <TouchableOpacity key={item.value} activeOpacity={0.7} onPress={() => handleSelectTenure(item.value)} style={[styles.chip, isSelected && styles.chipActive]}>
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {isCustomTenure && (
            <View style={styles.customInputContainer}>
              <Text style={styles.label}>Specify Custom Tenure (in Months) <Text style={styles.requiredStar}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.preferredTenureMonths && styles.inputError]}
                placeholder="Enter tenure in months (e.g. 15)"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={data.preferredTenureMonths || ""}
                onChangeText={(text) => onChange("preferredTenureMonths", text)}
              />
            </View>
          )}
        </View>
      </View>

      {/* 4. Vehicle Details & Valuation Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons name="speedometer-outline" size={20} color={BrandColors.PRIMARY_ORANGE || "#EA580C"} />
            <Text style={styles.cardTitle}>Vehicle Details & Valuation</Text>
          </View>
        </View>
        <Text style={styles.cardDescription}>Vehicle condition, model selection, estimated on-road price, and margin contribution.</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Vehicle Condition <Text style={styles.requiredStar}>*</Text></Text>
          <View style={styles.conditionRow}>
            {VEHICLE_CONDITIONS.map((cond) => {
              const isSelected = data.vehicleCondition === cond;
              return (
                <TouchableOpacity key={cond} activeOpacity={0.7} onPress={() => onChange("vehicleCondition", cond)} style={[styles.conditionPill, isSelected && styles.conditionPillActive]}>
                  <Text style={[styles.conditionPillText, isSelected && styles.conditionPillTextActive]}>{cond}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.vehicleCondition && <Text style={styles.errorText}>{errors.vehicleCondition}</Text>}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Vehicle Make & Model <Text style={styles.requiredStar}>*</Text></Text>
          <TouchableOpacity
            style={[styles.dropdownSelector, Boolean(data.vehicleMakeModel) && styles.dropdownSelectorActive, errors.vehicleMakeModel && styles.inputError]}
            onPress={() => setIsModelModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={data.vehicleMakeModel ? styles.dropdownText : styles.dropdownPlaceholder}>
              {data.vehicleMakeModel || "Select Vehicle Make & Model..."}
            </Text>
            <Ionicons name="chevron-down" size={18} color={data.vehicleMakeModel ? BrandColors.PRIMARY_ORANGE || "#EA580C" : "#64748B"} />
          </TouchableOpacity>
          {errors.vehicleMakeModel && <Text style={styles.errorText}>{errors.vehicleMakeModel}</Text>}

          {isCustomModel && (
            <View style={styles.customInputContainer}>
              <Text style={styles.label}>Specify Custom Make & Model <Text style={styles.requiredStar}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.vehicleMakeModel && styles.inputError]}
                placeholder="Enter custom make & model (e.g. Skoda Kushaq Style)"
                placeholderTextColor="#94A3B8"
                value={data.vehicleMakeModel || ""}
                onChangeText={(text) => onChange("vehicleMakeModel", text)}
              />
            </View>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Estimated On-Road Price / Valuation (₹) <Text style={styles.requiredStar}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.onRoadPrice && styles.inputError]}
            placeholder="Enter total on-road price / valuation (₹)"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={data.onRoadPrice || ""}
            onChangeText={(text) => onChange("onRoadPrice", text)}
          />
          {errors.onRoadPrice && <Text style={styles.errorText}>{errors.onRoadPrice}</Text>}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Expected Down Payment / Margin Money (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter expected down payment / margin amount (₹)"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={data.downPayment || ""}
            onChangeText={(text) => onChange("downPayment", text)}
          />
        </View>

        {isUsedVehicle && (
          <>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Vehicle Registration Number (RTO)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter registration number (e.g. MH02AB1234)"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                value={data.registrationNumber || ""}
                onChangeText={(text) => onChange("registrationNumber", text.toUpperCase())}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Manufacturing / Registration Year</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter manufacturing year (e.g. 2021)"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                maxLength={4}
                value={data.registrationYear || ""}
                onChangeText={(text) => onChange("registrationYear", text)}
              />
            </View>
          </>
        )}
      </View>

      {/* Purpose Modal */}
      <VehicleLoanSelectionModal visible={isPurposeModalOpen} title="Select Vehicle Category / Purpose" onClose={() => setIsPurposeModalOpen(false)}>
        {VEHICLE_PURPOSES.map((purpose) => (
          <OptionRow key={purpose} label={purpose} isSelected={data.purpose === purpose} onSelect={() => handleSelectPurpose(purpose)} />
        ))}
      </VehicleLoanSelectionModal>

      {/* Tenure Modal */}
      <VehicleLoanSelectionModal visible={isTenureModalOpen} title="Select Repayment Tenure" onClose={() => setIsTenureModalOpen(false)}>
        <Text style={styles.modalSectionHeader}>Below 1 Year (Short Term)</Text>
        {TENURE_OPTIONS.filter((t) => ["3", "6", "9"].includes(t.value)).map((item) => (
          <OptionRow key={item.value} label={item.label} isSelected={data.preferredTenureMonths === item.value} onSelect={() => handleSelectTenure(item.value)} />
        ))}
        <Text style={styles.modalSectionHeaderSpaced}>1 Year & Above</Text>
        {TENURE_OPTIONS.filter((t) => !["3", "6", "9"].includes(t.value)).map((item) => {
          const isSelected = item.value === "Other" ? isCustomTenure : data.preferredTenureMonths === item.value;
          return <OptionRow key={item.value} label={item.label} isSelected={isSelected} onSelect={() => handleSelectTenure(item.value)} />;
        })}
      </VehicleLoanSelectionModal>

      {/* Make & Model Modal */}
      <VehicleLoanSelectionModal visible={isModelModalOpen} title="Select Vehicle Make & Model" onClose={() => setIsModelModalOpen(false)}>
        {VEHICLE_MODELS.map((model) => {
          const isSelected = model.startsWith("Other") ? isCustomModel : data.vehicleMakeModel === model;
          return <OptionRow key={model} label={model} isSelected={isSelected} onSelect={() => handleSelectModel(model)} />;
        })}
      </VehicleLoanSelectionModal>
    </View>
  );
};

export default VehicleLoanFinancialsStep;
