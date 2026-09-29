import React from "react";
import { View } from "react-native";
import { styles } from "./WorkingCapitalStepIndicator.styles";

export interface WorkingCapitalStepIndicatorProps {
  steps: string[];
  currentStepIndex: number;
  onStepPress?: (index: number) => void;
}

export const WorkingCapitalStepIndicator: React.FC<WorkingCapitalStepIndicatorProps> = ({
  steps,
  currentStepIndex,
}) => {
  const progressPercent = `${((currentStepIndex + 1) / steps.length) * 100}%`;

  return (
    <View style={styles.progressBarTrack}>
      <View style={[styles.progressBarFill, { width: progressPercent as any }]} />
    </View>
  );
};

export default WorkingCapitalStepIndicator;

