import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SecurityCollateralItem } from "../../types/projectFinance.types";
import { SECURITY_TYPES, OWNERSHIP_TYPES } from "../../data/step6Data";
import { styles } from "./SecurityCollateralCard.styles";

interface SecurityCollateralItemCardProps {
  item: SecurityCollateralItem;
  index: number;
  totalCount: number;
  onUpdate: (field: keyof SecurityCollateralItem, value: any) => void;
  onDelete: () => void;
  onOpenPicker: (
    title: string,
    options: string[],
    field: keyof SecurityCollateralItem
  ) => void;
}

export const SecurityCollateralItemCard: React.FC<
  SecurityCollateralItemCardProps
> = ({ item, index, totalCount, onUpdate, onDelete, onOpenPicker }) => {
  return (
    <View style={styles.itemContainer}>
      {index > 0 && <View style={styles.divider} />}
      {totalCount > 1 && (
        <View style={styles.itemHeader}>
          <Text style={styles.itemIndexText}>Security #{index + 1}</Text>
          <TouchableOpacity onPress={onDelete}>
            <Text style={styles.deleteText}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Type of Security */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Type of Security <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() =>
            onOpenPicker("Select Security Type", SECURITY_TYPES, "typeOfSecurity")
          }
        >
          <Text
            style={
              item.typeOfSecurity ? styles.pickerText : styles.placeholderText
            }
          >
            {item.typeOfSecurity || "Select security type"}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Asset Description */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Asset Description <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter asset description"
          placeholderTextColor="#94A3B8"
          value={item.assetDescription}
          onChangeText={(text) => onUpdate("assetDescription", text)}
        />
      </View>

      {/* Estimated Value */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Estimated Value (₹) <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={item.estimatedValue}
          onChangeText={(text) => onUpdate("estimatedValue", text)}
        />
      </View>

      {/* Ownership Type */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Ownership Type <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() =>
            onOpenPicker("Select Ownership Type", OWNERSHIP_TYPES, "ownershipType")
          }
        >
          <Text
            style={
              item.ownershipType ? styles.pickerText : styles.placeholderText
            }
          >
            {item.ownershipType || "Select ownership type"}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Location of Asset */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Location of Asset <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter location"
          placeholderTextColor="#94A3B8"
          value={item.locationOfAsset}
          onChangeText={(text) => onUpdate("locationOfAsset", text)}
        />
      </View>

      {/* Valuation Report Available? */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Valuation Report Available? <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.radioRow}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => onUpdate("valuationReportAvailable", true)}
          >
            <View
              style={[
                styles.radioCircle,
                item.valuationReportAvailable && styles.radioCircleSelected,
              ]}
            >
              {item.valuationReportAvailable && (
                <View style={styles.radioInnerDot} />
              )}
            </View>
            <Text style={styles.radioText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => onUpdate("valuationReportAvailable", false)}
          >
            <View
              style={[
                styles.radioCircle,
                !item.valuationReportAvailable && styles.radioCircleSelected,
              ]}
            >
              {!item.valuationReportAvailable && (
                <View style={styles.radioInnerDot} />
              )}
            </View>
            <Text style={styles.radioText}>No</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Any Existing Charge? */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Any Existing Charge? <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.radioRow}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => onUpdate("anyExistingCharge", true)}
          >
            <View
              style={[
                styles.radioCircle,
                item.anyExistingCharge && styles.radioCircleSelected,
              ]}
            >
              {item.anyExistingCharge && <View style={styles.radioInnerDot} />}
            </View>
            <Text style={styles.radioText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => onUpdate("anyExistingCharge", false)}
          >
            <View
              style={[
                styles.radioCircle,
                !item.anyExistingCharge && styles.radioCircleSelected,
              ]}
            >
              {!item.anyExistingCharge && <View style={styles.radioInnerDot} />}
            </View>
            <Text style={styles.radioText}>No</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* If Yes, Details */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>If Yes, Details</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter details"
          placeholderTextColor="#94A3B8"
          value={item.existingChargeDetails}
          onChangeText={(text) => onUpdate("existingChargeDetails", text)}
        />
      </View>
    </View>
  );
};

export default SecurityCollateralItemCard;
