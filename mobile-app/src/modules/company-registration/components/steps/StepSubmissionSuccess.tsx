import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import { styles } from './StepSubmissionSuccess.styles';

export const StepSubmissionSuccess: React.FC = () => {
  const draft = useCompanyRegistrationStore((state) => state.draft);
  const setStep = useCompanyRegistrationStore((state) => state.setStep);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="checkmark-done-circle" size={48} color="#166534" />
      </View>
      <Text style={styles.heading}>Application Submitted Successfully!</Text>
      <Text style={styles.subheading}>
        Your company incorporation file has been received and assigned to a TaxEdge compliance officer.
      </Text>

      {/* Confirmation Summary Card */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Application ID</Text>
          <Text style={styles.value}>{draft.id}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Proposed Company Name</Text>
          <Text style={styles.value}>{draft.company.proposedName1}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Entity Structure</Text>
          <Text style={styles.value}>{draft.company.companyType}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Current Status</Text>
          <Text style={[styles.value, { color: '#166534' }]}>Under Verification</Text>
        </View>
      </View>

      {/* Buttons */}
      <TouchableOpacity style={styles.btnPrimary} onPress={() => setStep(10)}>
        <Text style={styles.btnPrimaryText}>View Application Status</Text>
      </TouchableOpacity>
    </View>
  );
};
