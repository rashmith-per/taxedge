import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./DeclarationCard.styles";

interface DeclarationCardProps {
  agreeAccuracy: boolean;
  onToggleAgreeAccuracy: () => void;
  agreeVerification: boolean;
  onToggleAgreeVerification: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const DeclarationCard: React.FC<DeclarationCardProps> = ({
  agreeAccuracy,
  onToggleAgreeAccuracy,
  agreeVerification,
  onToggleAgreeVerification,
  isExpanded,
  onToggleExpand,
}) => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onToggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name="create-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>3. Declaration</Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#64748B"
        />
      </TouchableOpacity>

      {/* Body */}
      {isExpanded && (
        <View style={styles.cardBody}>
          <Text style={styles.subtitle}>
            Please confirm the following before submitting your application.
          </Text>

          {/* Checkbox 1 */}
          <TouchableOpacity
            style={styles.checkboxItem}
            onPress={onToggleAgreeAccuracy}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkboxBox,
                agreeAccuracy && styles.checkboxBoxSelected,
              ]}
            >
              {agreeAccuracy && (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              I hereby declare that the information provided is true and correct
              to the best of my knowledge.
            </Text>
          </TouchableOpacity>

          {/* Checkbox 2 */}
          <TouchableOpacity
            style={styles.checkboxItem}
            onPress={onToggleAgreeVerification}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkboxBox,
                agreeVerification && styles.checkboxBoxSelected,
              ]}
            >
              {agreeVerification && (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              I authorize the lender to verify the information and documents
              submitted.
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default DeclarationCard;
