import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../../hooks/use-theme';
import { ServiceHeader } from '../../../../shared/components/ServiceHeader';
import { companyRegistrationService } from '../../services/companyRegistrationService';
import { CompanyTypeCard } from '../../components/CompanyTypeCard/CompanyTypeCard';
import type { CompanyTypeOption } from '../../services/companyRegistrationService';
import { styles, getThemedStyles } from './CompanyRegistrationHomeScreen.styles';

export const CompanyRegistrationHomeScreen: React.FC = () => {
  const colors = useTheme();
  const router = useRouter();
  const companyTypes = companyRegistrationService.getCompanyTypes();
  const themed = getThemedStyles(colors);

  return (
    <ScrollView style={[styles.container, themed.container]} showsVerticalScrollIndicator={false}>
      <ServiceHeader
        title="Company Registration"
        subtitle="Incorporate your business in India with full MCA, GST & PAN compliance."
        tag="Corporate Services"
        iconName="business"
      />
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, themed.sectionTitle]}>Choose Entity Type</Text>
        {companyTypes.map((item) => (
          <CompanyTypeCard
            key={item.type}
            item={item}
            selected={false}
            onSelect={() => router.push('/(main)/applications')}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default CompanyRegistrationHomeScreen;
