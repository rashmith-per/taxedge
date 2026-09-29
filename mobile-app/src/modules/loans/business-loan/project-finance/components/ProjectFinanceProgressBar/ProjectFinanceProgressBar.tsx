import React from "react";
import { View, Text } from "react-native";
import { styles } from "./ProjectFinanceProgressBar.styles";

interface ProjectFinanceProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  stepTitles: string[];
}

export const ProjectFinanceProgressBar: React.FC<ProjectFinanceProgressBarProps> = ({
  currentStep,
  totalSteps = 7,
  stepTitles,
}) => {
  const title = stepTitles[currentStep - 1] || "";
  const progressPercent = Math.min(Math.max((currentStep / totalSteps) * 100, 0), 100);

  return (
    <View style={styles.container}>
      <Text style={styles.stepText}>
        Step {currentStep} of {totalSteps} - {title}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progressPercent}%` }]} />
      </View>
    </View>
  );
};

export default ProjectFinanceProgressBar;
