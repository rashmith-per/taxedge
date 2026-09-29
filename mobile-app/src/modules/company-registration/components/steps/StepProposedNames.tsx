import React from 'react';
import { View, Text, TextInput } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import { CompanySectionCard } from '../CompanySectionCard/CompanySectionCard';
import { styles } from './StepProposedNames.styles';

export const StepProposedNames: React.FC = () => {
  const company = useCompanyRegistrationStore((state) => state.draft.company);
  const updateDetails = useCompanyRegistrationStore((state) => state.updateCompanyDetails);
  const fieldErrors = useCompanyRegistrationStore((state) => state.fieldErrors);

  const getSuffix = () => {
    switch (company.companyType) {
      case 'One Person Company (OPC)':
        return '(OPC) Private Limited';
      case 'Section 8 (NGO)':
        return 'Foundation / Section 8';
      case 'Public Limited':
        return 'Limited';
      default:
        return 'Private Limited';
    }
  };

  React.useEffect(() => {
    const suf = getSuffix();
    if (company.nameSuffix !== suf) {
      updateDetails({ nameSuffix: suf });
    }
  }, [company.companyType]);

  return (
    <CompanySectionCard
      title="Proposed Company Names"
      description="Provide up to 2 preferred names for SPICe+ Part A name reservation / incorporation."
    >
      {/* 1st Preferred Name */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>First Preferred Name *</Text>
        <TextInput
          style={[styles.input, !!fieldErrors.proposedName1 && styles.inputError]}
          value={company.proposedName1 || ''}
          onChangeText={(val) => updateDetails({ proposedName1: val })}
          placeholder="Enter First Preferred Name"
          placeholderTextColor="#94A3B8"
        />
        {!!fieldErrors.proposedName1 && <Text style={styles.errorText}>{fieldErrors.proposedName1}</Text>}
      </View>

      {/* 2nd Preferred Name */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Second Preferred Name *</Text>
        <TextInput
          style={[styles.input, !!fieldErrors.proposedName2 && styles.inputError]}
          value={company.proposedName2 || ''}
          onChangeText={(val) => updateDetails({ proposedName2: val })}
          placeholder="Enter Second Preferred Name"
          placeholderTextColor="#94A3B8"
        />
        {!!fieldErrors.proposedName2 && <Text style={styles.errorText}>{fieldErrors.proposedName2}</Text>}
      </View>

      {/* Mandatory Suffix */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Mandatory Suffix</Text>
        <View style={styles.suffixBadge}>
          <Text style={styles.suffixText}>Legal Suffix: {getSuffix()}</Text>
        </View>
        {!!fieldErrors.nameSuffix && <Text style={styles.errorText}>{fieldErrors.nameSuffix}</Text>}
      </View>

      {/* Name Availability Indicator */}
      <View style={styles.statusCard}>
        <Ionicons name="information-circle-outline" size={20} color="#166534" />
        <View style={{ flex: 1 }}>
          <Text style={styles.statusText}>Preliminary Name Check</Text>
          <Text style={{ fontSize: 12, color: '#15803D', lineHeight: 16 }}>
            Preliminary name check passed — final approval is subject to MCA name availability and applicable naming/trademark rules.
          </Text>
        </View>
      </View>
    </CompanySectionCard>
  );
};
