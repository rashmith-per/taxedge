import React from 'react';
import { View } from 'react-native';
import { FormInput } from '../../../../shared/components/Input/FormInput';
import type { InsuranceMember } from '../../types/member.types';
import { styles } from './MemberForm.styles';

interface MemberFormProps {
  member: Partial<InsuranceMember>;
  onChange: (field: keyof InsuranceMember, val: InsuranceMember[keyof InsuranceMember]) => void;
}

export const MemberForm: React.FC<MemberFormProps> = ({ member, onChange }) => {
  return (
    <View style={styles.container}>
      <FormInput
        label="Full Name as on Aadhaar / PAN"
        value={member.fullName || ''}
        onChangeText={(v) => onChange('fullName', v)}
        placeholder="Enter member's legal name"
      />
      <FormInput
        label="Date of Birth (DD/MM/YYYY)"
        value={member.dob || ''}
        onChangeText={(v) => onChange('dob', v)}
        placeholder="e.g. 15/08/1990"
      />
    </View>
  );
};

export default MemberForm;
