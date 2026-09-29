import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./ProjectFinanceHeader.styles";

interface ProjectFinanceHeaderProps {
  onBack: () => void;
  title?: string;
  currentStep: number;
  totalSteps?: number;
  stepTitle: string;
}

export const ProjectFinanceHeader: React.FC<ProjectFinanceHeaderProps> = ({
  onBack,
  title = "Project Finance",
  currentStep,
  totalSteps = 7,
  stepTitle,
}) => {
  const progressPercent = Math.min(
    Math.max((currentStep / totalSteps) * 100, 0),
    100
  );

  return (
    <View style={styles.headerWrapper}>
      {/* Top Row with Circular Back Button & Centered Title/Subtitle */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.circleBackButton}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={18} color="#0B1B36" />
        </TouchableOpacity>

        <View style={styles.centerContent}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.stepText}>
            Step {currentStep} of {totalSteps} - {stepTitle}
          </Text>
        </View>

        {/* Right spacer to balance the left circle button */}
        <View style={styles.rightSpacer} />
      </View>

      {/* Progress Track & Orange Fill */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>
    </View>
  );
};

export default ProjectFinanceHeader;
