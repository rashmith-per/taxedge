import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import type { LinkedRegistrations } from '../../types/registration.types';
import { styles } from './StepLinkedRegistrations.styles';

const LINKED_ITEMS: { key: keyof LinkedRegistrations; title: string; desc: string }[] = [
  { key: 'pan', title: 'Company PAN Card Issuance', desc: 'Automatic PAN allotment via SPICe+ Part B' },
  { key: 'tan', title: 'Company TAN Allotment', desc: 'Tax Deduction Account Number for TDS compliance' },
  { key: 'gst', title: 'GSTIN Registration (AGILE-PRO-S)', desc: 'Goods & Services Tax registration' },
  { key: 'epfo', title: 'EPFO Registration', desc: 'Employees Provident Fund Organisation registration' },
  { key: 'esic', title: 'ESIC Registration', desc: 'Employees State Insurance Corporation registration' },
  { key: 'professionalTax', title: 'Professional Tax Registration (P-Tax)', desc: 'State Professional Tax registration' },
  { key: 'bankAccount', title: 'Zero Balance Corporate Bank Account Opening', desc: 'Pre-approved corporate account opening with partner banks' },
];

export const StepLinkedRegistrations: React.FC = () => {
  const company = useCompanyRegistrationStore((state) => state.draft.company);
  const linkedRegistrations = useCompanyRegistrationStore((state) => state.draft.linkedRegistrations);
  const toggleLinkedRegistration = useCompanyRegistrationStore((state) => state.toggleLinkedRegistration);
  const updateCompanyDetails = useCompanyRegistrationStore((state) => state.updateCompanyDetails);
  const fieldErrors = useCompanyRegistrationStore((state) => state.fieldErrors);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Linked Mandatory & Optional Registrations</Text>
      <Text style={styles.subheading}>Select government Registrations bundled directly with SPICe+ AGILE-PRO-S filing.</Text>

      {LINKED_ITEMS.map((item) => {
        const isChecked = linkedRegistrations[item.key];
        return (
          <React.Fragment key={item.key}>
            <TouchableOpacity
              style={[styles.card, isChecked && styles.cardSelected]}
              onPress={() => toggleLinkedRegistration(item.key)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.desc}>{item.desc}</Text>
              </View>
              <Ionicons
                name={isChecked ? 'checkbox' : 'square-outline'}
                size={22}
                color={isChecked ? '#083B75' : '#94A3B8'}
              />
            </TouchableOpacity>
            {item.key === 'bankAccount' && isChecked && (
              <View style={styles.accountNumberBox}>
                <Text style={styles.label}>Account Number *</Text>
                <TextInput
                  style={[styles.input, !!fieldErrors.accountNumber && styles.inputError]}
                  value={company.accountNumber || ''}
                  onChangeText={(val) => {
                    const cleaned = val.replace(/\D/g, '');
                    updateCompanyDetails({ accountNumber: cleaned });
                  }}
                  placeholder="Enter Bank Account Number"
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                />
                {!!fieldErrors.accountNumber && (
                  <Text style={styles.errorText}>{fieldErrors.accountNumber}</Text>
                )}
              </View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};
