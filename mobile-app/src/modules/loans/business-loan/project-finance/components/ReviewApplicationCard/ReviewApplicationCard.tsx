import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { REVIEW_STEP_ITEMS } from "../../data/step7Data";
import { styles } from "./ReviewApplicationCard.styles";

interface ReviewApplicationCardProps {
  onEditStep: (stepIndex: number) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const ReviewApplicationCard: React.FC<ReviewApplicationCardProps> = ({
  onEditStep,
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
            <Ionicons name="document-attach-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>2. Review Application</Text>
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
            Review your entered details before submitting. You can go back and edit
            if needed.
          </Text>

          {REVIEW_STEP_ITEMS.map((item) => (
            <View key={item.stepIndex} style={styles.reviewRow}>
              <View style={styles.rowLeft}>
                <Ionicons name={item.icon as any} size={18} color="#F97316" />
                <Text style={styles.stepTitle}>{item.title}</Text>
              </View>

              <View style={styles.rowRight}>
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                  <Text style={styles.completedText}>Completed</Text>
                </View>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => onEditStep(item.stepIndex)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.editText}>Edit</Text>
                  <Ionicons name="chevron-forward" size={14} color="#EA580C" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default ReviewApplicationCard;
