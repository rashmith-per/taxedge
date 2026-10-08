import React from 'react';
import { View } from 'react-native';
import { FormInput } from '../../../../shared/components/Input/FormInput';
import type { NomineeDetails } from '../../types/member.types';
import { styles } from './NomineeForm.styles';

interface NomineeFormProps {
  nominee: Partial<NomineeDetails>;
  onChange: (field: keyof NomineeDetails, val: NomineeDetails[keyof NomineeDetails]) => void;
}

export const NomineeForm: React.FC<NomineeFormProps> = ({ nominee, onChange }) => {
  return (
    <View style={styles.container}>
      <FormInput
        label="Nominee Full Name"
        value={nominee.fullName || ''}
        onChangeText={(v) => onChange('fullName', v)}
        placeholder="Enter nominee name"
      />
      <FormInput
        label="Relationship"
        value={nominee.relation || ''}
        onChangeText={(v) => onChange('relation', v)}
        placeholder="e.g. Spouse, Mother, Son"
      />
    </View>
  );
};

export default NomineeForm;
