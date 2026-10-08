import React from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../../hooks/use-theme';
import { ServiceHeader } from '../../../../shared/components/ServiceHeader';
import { InsuranceTypeCard } from '../../components/InsuranceTypeCard/InsuranceTypeCard';
import { styles, getThemedStyles } from './InsuranceHomeScreen.styles';

export const InsuranceHomeScreen: React.FC = () => {
  const colors = useTheme();
  const router = useRouter();
  const themed = getThemedStyles(colors);

  return (
    <ScrollView style={[styles.container, themed.container]} showsVerticalScrollIndicator={false}>
      <ServiceHeader
        title="Insurance Coverage"
        subtitle="Protect what matters most with top-rated Health, Term Life & Vehicle insurance."
        tag="Protection & Wealth"
        iconName="shield-checkmark"
      />
      <View style={styles.section}>
        <InsuranceTypeCard
          category="HEALTH"
          title="Health Insurance"
          subtitle="Cashless hospitalization, ₹10L - ₹1Cr cover, 80D tax savings"
          icon="fitness"
          onPress={() => router.push('/(main)/applications')}
        />
        <InsuranceTypeCard
          category="TERM"
          title="Term Life Insurance"
          subtitle="High life cover at affordable rates with critical illness cover"
          icon="heart"
          onPress={() => router.push('/(main)/applications')}
        />
        <InsuranceTypeCard
          category="MOTOR"
          title="Car & Two Wheeler"
          subtitle="Instant policy issuance, zero depreciation & roadside support"
          icon="car"
          onPress={() => router.push('/(main)/applications')}
        />
      </View>
    </ScrollView>
  );
};

export default InsuranceHomeScreen;
