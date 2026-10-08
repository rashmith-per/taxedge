import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "../../../../../shared/theme";
import { LoanPropertyFormData } from "../../../types/loans.types";
import { pinCodeService } from "@/shared/services/lookup/pinCodeService";
import { styles } from "./PropertyLoanPropertyStep.styles";

export type PropertyDropdownKey =
  | "state"
  | "propertyType"
  | "propertySubType"
  | "constructionStatus"
  | "currentUsage"
  | "areaType"
  | "propertyAge"
  | "approvingAuthority";

export interface PropertyLocationCardProps {
  data: LoanPropertyFormData;
  onChange: (field: keyof LoanPropertyFormData, value: string) => void;
  onOpenPicker: (key: PropertyDropdownKey) => void;
  errors?: Record<string, string>;
}

export const PropertyLocationCard: React.FC<PropertyLocationCardProps> = ({
  data,
  onChange,
  onOpenPicker,
  errors = {},
}) => {
  const [isFetchingPin, setIsFetchingPin] = useState(false);

  const handleFetchPincodeDetails = async () => {
    const cleanPin = (data.pincode || "").trim();
    if (!cleanPin || cleanPin.length !== 6) {
      Alert.alert(
        "Invalid PIN Code",
        "Please enter a valid 6-digit Indian PIN code first."
      );
      return;
    }

    setIsFetchingPin(true);
    try {
      const details = await pinCodeService.lookup(cleanPin);
      if (details.city) onChange("city", details.city);
      if (details.district) onChange("district", details.district);
      if (details.state) onChange("state", details.state);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unable to fetch PIN code details. Please fill manually.";
      Alert.alert("PIN Code Lookup", errorMessage);
    } finally {
      setIsFetchingPin(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <Ionicons name="location" size={16} color={BrandColors.PRIMARY_ORANGE || "#FF7A00"} />
          </View>
          <Text style={styles.cardTitle}>Property Location</Text>
        </View>
      </View>

      {/* PIN Code with Fetch Details */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            PIN Code <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TouchableOpacity
            onPress={handleFetchPincodeDetails}
            activeOpacity={0.7}
            disabled={isFetchingPin}
          >
            {isFetchingPin ? (
              <ActivityIndicator
                size="small"
                color={BrandColors.PRIMARY_ORANGE}
              />
            ) : (
              <Text style={styles.fetchDetailsText}>Fetch Details</Text>
            )}
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.inputWithIcon,
            errors.pincode ? styles.inputError : null,
          ]}
        >
          <View style={styles.iconBoxLeft}>
            <Ionicons name="location-outline" size={18} color="#64748B" />
          </View>
          <TextInput
            style={styles.inputFlex}
            placeholder="Enter PIN code"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            maxLength={6}
            value={data.pincode}
            onChangeText={(text) => onChange("pincode", text.replace(/\D/g, ""))}
          />
        </View>
        {errors.pincode ? (
          <Text style={styles.errorText}>{errors.pincode}</Text>
        ) : null}
      </View>

      {/* City */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          City <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View
          style={[
            styles.inputWithIcon,
            errors.city ? styles.inputError : null,
          ]}
        >
          <View style={styles.iconBoxLeft}>
            <Ionicons name="business-outline" size={18} color="#64748B" />
          </View>
          <TextInput
            style={styles.inputFlex}
            placeholder="Enter city"
            placeholderTextColor="#94A3B8"
            value={data.city}
            onChangeText={(text) => onChange("city", text)}
          />
        </View>
        {errors.city ? (
          <Text style={styles.errorText}>{errors.city}</Text>
        ) : null}
      </View>

      {/* District */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          District <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View
          style={[
            styles.inputWithIcon,
            errors.district ? styles.inputError : null,
          ]}
        >
          <View style={styles.iconBoxLeft}>
            <Ionicons name="business-outline" size={18} color="#64748B" />
          </View>
          <TextInput
            style={styles.inputFlex}
            placeholder="Enter district"
            placeholderTextColor="#94A3B8"
            value={data.district}
            onChangeText={(text) => onChange("district", text)}
          />
        </View>
        {errors.district ? (
          <Text style={styles.errorText}>{errors.district}</Text>
        ) : null}
      </View>

      {/* State Dropdown */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          State <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TouchableOpacity
          style={[
            styles.dropdownSelector,
            Boolean(data.state) && styles.dropdownSelectorActive,
            errors.state ? styles.inputError : null,
          ]}
          onPress={() => onOpenPicker("state")}
          activeOpacity={0.8}
        >
          <Text
            style={
              data.state ? styles.dropdownText : styles.dropdownPlaceholder
            }
          >
            {data.state || "Select state..."}
          </Text>
          <Ionicons
            name="chevron-down"
            size={18}
            color={data.state ? BrandColors.PRIMARY_ORANGE : "#64748B"}
          />
        </TouchableOpacity>
        {errors.state ? (
          <Text style={styles.errorText}>{errors.state}</Text>
        ) : null}
      </View>

      {/* Property Address */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Property Address <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View
          style={[
            styles.inputWithIcon,
            errors.propertyAddress ? styles.inputError : null,
          ]}
        >
          <View style={styles.iconBoxLeft}>
            <Ionicons name="home-outline" size={18} color="#64748B" />
          </View>
          <TextInput
            style={[styles.inputFlex, styles.multilineInput]}
            placeholder="Enter complete property address"
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            value={data.propertyAddress}
            onChangeText={(text) => onChange("propertyAddress", text)}
          />
        </View>
        {errors.propertyAddress ? (
          <Text style={styles.errorText}>{errors.propertyAddress}</Text>
        ) : null}
      </View>

      {/* Landmark (Optional) */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Landmark (Optional)</Text>
        <View style={styles.inputWithIcon}>
          <View style={styles.iconBoxLeft}>
            <Ionicons name="location-outline" size={18} color="#64748B" />
          </View>
          <TextInput
            style={styles.inputFlex}
            placeholder="Enter landmark"
            placeholderTextColor="#94A3B8"
            value={data.landmark}
            onChangeText={(text) => onChange("landmark", text)}
          />
        </View>
      </View>
    </View>
  );
};

export default PropertyLocationCard;
