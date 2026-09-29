import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RevisedItrHeader } from "../../components/common";
import { RevisionReasonCard } from "../../components/reason";
import { REVISION_REASONS } from "../../mock/revisedItrData";
import { RevisionReasonId } from "../../types/revisedItr.types";
import {
  styles,
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
  getBottomBarInsetsStyle,
} from "./RevisionReasonScreen.styles";

export const RevisionReasonScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    acknowledgementNumber?: string;
    assessmentYear?: string;
  }>();

  // "missed_income" is selected by default matching the reference screenshot
  const [selectedReason, setSelectedReason] =
    useState<RevisionReasonId>("missed_income");
  const [otherReasonText, setOtherReasonText] = useState("");
  const [otherError, setOtherError] = useState<string | null>(null);

  const selectedReasonObj = REVISION_REASONS.find((r) => r.id === selectedReason);

  const handleContinue = () => {
    if (selectedReason === "other" && !otherReasonText.trim()) {
      setOtherError("Please specify the reason for revision.");
      return;
    }

    setOtherError(null);

    // Navigate to Screen 3: Update Changed Details
    router.push({
      pathname: "/service/revised-itr-update" as any,
      params: {
        acknowledgementNumber: params.acknowledgementNumber,
        assessmentYear: params.assessmentYear || "AY 2025–26",
        revisionReason: selectedReason,
        otherReasonText: selectedReason === "other" ? otherReasonText : undefined,
      },
    });
  };

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top)]}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <RevisedItrHeader subtitle="Reason for Revision" />

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          getScrollContentInsetsStyle(insets.bottom),
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Why are you revising your ITR?</Text>
        </View>

        {/* Reason Cards List */}
        {REVISION_REASONS.map((reason) => (
          <RevisionReasonCard
            key={reason.id}
            item={reason}
            isSelected={selectedReason === reason.id}
            onSelect={(id) => {
              setSelectedReason(id);
              if (otherError) setOtherError(null);
            }}
          />
        ))}

        {/* Free Text Input if "Other Reason" Selected */}
        {selectedReason === "other" && (
          <View style={styles.otherInputGroup}>
            <Text style={styles.otherInputLabel}>
              Specify your reason for revision <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.otherTextInput,
                otherError ? styles.inputError : null,
              ]}
              placeholder="Enter description"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={otherReasonText}
              onChangeText={(val) => {
                setOtherReasonText(val);
                if (otherError) setOtherError(null);
              }}
            />
            {otherError ? (
              <Text style={styles.errorText}>{otherError}</Text>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Action Button */}
      <View
        style={[
          styles.bottomBar,
          getBottomBarInsetsStyle(insets.bottom),
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleContinue}
          style={styles.continueButton}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RevisionReasonScreen;
