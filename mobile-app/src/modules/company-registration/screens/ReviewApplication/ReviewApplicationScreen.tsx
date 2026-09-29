import React from 'react';
import { View, ScrollView } from 'react-native';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { StepReviewApplication } from '../../components/steps/StepReviewApplication';
import { useTheme } from '../../../../hooks/use-theme';
import { styles, getThemedStyles } from './ReviewApplicationScreen.styles';

export const ReviewApplicationScreen: React.FC = () => {
  const colors = useTheme();
  const themed = getThemedStyles(colors);

  return (
    <View style={[styles.container, themed.container]}>
      <AppHeader title="Review Application" showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        <StepReviewApplication />
      </ScrollView>
    </View>
  );
};

export default ReviewApplicationScreen;
