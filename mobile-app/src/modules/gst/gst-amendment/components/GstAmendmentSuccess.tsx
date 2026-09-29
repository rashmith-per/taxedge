import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "../screens/GstAmendmentScreen/GstAmendmentScreen.styles";
import { SubmissionResult } from "../types/gstAmendmentTypes";

interface GstAmendmentSuccessProps {
  submissionResult: SubmissionResult;
  insets: { top: number; bottom: number };
  onTrack: () => void;
  onOpenApplications: () => void;
}

export const GstAmendmentSuccess: React.FC<GstAmendmentSuccessProps> = ({
  submissionResult,
  insets,
  onTrack,
  onOpenApplications,
}) => {
  return (
    <View style={styles.successContainer}>
      <StatusBar barStyle="light-content" backgroundColor={BrandColors.PRIMARY_BLUE} />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.modalScrollView}
        contentContainerStyle={styles.modalScrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Banner with curved bottom */}
        <View style={[styles.successHero, { paddingTop: insets.top + 32 }]}>
          <View style={styles.successHeroIconBox}>
            <View style={styles.successHeroCheckCircle}>
              <Ionicons name="checkmark" size={32} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.successHeroTitle}>Amendment Submitted</Text>
        </View>

        {/* Details Card */}
        <View style={styles.successCard}>
          <View style={styles.successRow}>
            <Text style={styles.successRowKey}>Application Type</Text>
            <Text style={styles.successRowVal}>GST Amendment</Text>
          </View>
          <View style={styles.successDivider} />

          <View style={styles.successRow}>
            <Text style={styles.successRowKey}>ARN / Reference</Text>
            <Text style={[styles.successRowVal, { color: BrandColors.PRIMARY_BLUE }]}>
              {submissionResult.arn}
            </Text>
          </View>
          <View style={styles.successDivider} />

          <View style={styles.successRow}>
            <Text style={styles.successRowKey}>Submission Date</Text>
            <Text style={styles.successRowVal}>{submissionResult.date}</Text>
          </View>
          <View style={styles.successDivider} />

          <View style={styles.successRow}>
            <Text style={styles.successRowKey}>Requested Section</Text>
            <Text style={styles.successRowVal}>{submissionResult.sectionTitle}</Text>
          </View>
          <View style={styles.successDivider} />

          <View style={styles.successRow}>
            <Text style={styles.successRowKey}>Current Status</Text>
            <Text style={[styles.successRowVal, { color: "#16A34A" }]}>Submitted</Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Area */}
      <View style={[styles.successActionsWrap, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={onTrack}
        >
          <Text style={styles.primaryBtnText}>Track Amendment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.85}
          onPress={onOpenApplications}
        >
          <Text style={styles.secondaryBtnText}>Open My Applications</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
