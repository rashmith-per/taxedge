import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "../../../../../../shared/theme";
import { styles } from "./ProjectFinanceStepIndicator.styles";

export interface ProjectFinanceStepIndicatorProps {
  steps: string[];
  currentStepIndex: number;
  onStepPress?: (index: number) => void;
}

export const ProjectFinanceStepIndicator: React.FC<ProjectFinanceStepIndicatorProps> = ({
  steps,
  currentStepIndex,
  onStepPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {steps.map((title, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;

          return (
            <TouchableOpacity
              key={title}
              activeOpacity={0.7}
              disabled={!onStepPress || index > currentStepIndex}
              onPress={() => onStepPress && onStepPress(index)}
              style={styles.stepItem}
            >
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    isCompleted && styles.stepLineCompleted,
                  ]}
                />
              )}

              <View
                style={[
                  styles.stepCircle,
                  isActive && styles.stepCircleActive,
                  isCompleted && styles.stepCircleCompleted,
                ]}
              >
                {isCompleted ? (
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={BrandColors.WHITE}
                  />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      isActive && styles.stepNumberActive,
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>

              <Text
                numberOfLines={1}
                style={[styles.stepTitle, isActive && styles.stepTitleActive]}
              >
                {title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default ProjectFinanceStepIndicator;
