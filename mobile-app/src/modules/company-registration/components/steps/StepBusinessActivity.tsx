import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import { CompanySectionCard } from '../CompanySectionCard/CompanySectionCard';
import { styles } from './StepBusinessActivity.styles';

export const StepBusinessActivity: React.FC = () => {
  const company = useCompanyRegistrationStore((state) => state.draft.company);
  const updateDetails = useCompanyRegistrationStore((state) => state.updateCompanyDetails);
  const fieldErrors = useCompanyRegistrationStore((state) => state.fieldErrors);

  return (
    <CompanySectionCard
      title="Business Activity / NIC"
      description="Define the main objective and National Industrial Classification code of your company."
    >
      {/* Primary Business Activity */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Primary Business Activity *</Text>
        <TextInput
          style={[styles.input, !!fieldErrors.primaryActivity && styles.inputError]}
          value={company.primaryActivity || ''}
          onChangeText={(val) => updateDetails({ primaryActivity: val })}
          placeholder="Enter Primary Business Activity"
          placeholderTextColor="#94A3B8"
        />
        {!!fieldErrors.primaryActivity ? (
          <Text style={styles.errorText}>{fieldErrors.primaryActivity}</Text>
        ) : (
          <Text style={styles.hint}>Used for Main Objects in MoA Memorandum of Association.</Text>
        )}
      </View>

      {/* NIC Code */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>NIC 5-Digit Code *</Text>
        <TextInput
          style={[styles.input, !!fieldErrors.nicCode && styles.inputError]}
          value={company.nicCode || ''}
          onChangeText={(val) => updateDetails({ nicCode: val })}
          placeholder="Enter 5-digit NIC Code"
          keyboardType="numeric"
          maxLength={5}
          placeholderTextColor="#94A3B8"
        />
        {!!fieldErrors.nicCode ? (
          <Text style={styles.errorText}>{fieldErrors.nicCode}</Text>
        ) : (
          <Text style={styles.hint}>National Industrial Classification 5-Digit Code.</Text>
        )}
      </View>

      {/* Secondary Business Activity */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Secondary Business Activity (Optional)</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={company.secondaryActivity || ''}
          onChangeText={(val) => updateDetails({ secondaryActivity: val })}
          placeholder="Enter Secondary Business Activity"
          multiline
          placeholderTextColor="#94A3B8"
        />
      </View>
    </CompanySectionCard>
  );
};
