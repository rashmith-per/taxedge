import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import type { CompanyType } from '../../types/company.types';
import { styles } from './StepCompanyType.styles';

const OPTIONS: { type: CompanyType; title: string; desc: string; members: string }[] = [
  {
    type: 'Private Limited',
    title: 'Private Limited Company (Pvt Ltd)',
    desc: 'Suitable for startups and growing businesses. Limited liability & easy funding.',
    members: 'Min 2 Directors',
  },
  {
    type: 'One Person Company (OPC)',
    title: 'One Person Company (OPC)',
    desc: 'Ideal for solo entrepreneurs who want corporate identity with 100% ownership control.',
    members: '1 Founder + 1 Nominee',
  },
  {
    type: 'Section 8 (NGO)',
    title: 'Section 8 Company (Non-Profit)',
    desc: 'Formed for promoting commerce, art, science, sports, education, research, or charity.',
    members: 'Min 2 Members',
  },
  {
    type: 'Public Limited',
    title: 'Public Limited Company',
    desc: 'Suitable for large scale enterprises planning to list shares or issue public capital.',
    members: 'Min 3 Directors',
  },
];

const getCompanyTypeIcon = (type: string, title?: string): keyof typeof Ionicons.glyphMap => {
  const text = (type + " " + (title || "")).toLowerCase();
  if (text.includes("opc") || text.includes("one person")) {
    return "person-outline";
  }
  if (text.includes("section 8") || text.includes("ngo") || text.includes("non-profit") || text.includes("growth")) {
    return "trending-up-outline";
  }
  if (text.includes("public limited") || text.includes("llp") || text.includes("briefcase") || text.includes("partnership")) {
    return "briefcase-outline";
  }
  return "business-outline";
};

export const StepCompanyType: React.FC = () => {
  const selectedType = useCompanyRegistrationStore((state) => state.draft.company.companyType);
  const setCompanyType = useCompanyRegistrationStore((state) => state.setCompanyType);
  const errorText = useCompanyRegistrationStore((state) => state.fieldErrors.companyType);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Select Company Type</Text>
      <Text style={styles.subheading}>Choose the corporate legal entity structure for your incorporation.</Text>

      {OPTIONS.map((item) => {
        const isSelected = selectedType === item.type;
        return (
          <TouchableOpacity
            key={item.type}
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => setCompanyType(item.type)}
            activeOpacity={0.8}
          >
            <View style={styles.row}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={getCompanyTypeIcon(item.type, item.title)}
                  size={22}
                  color="#06152D"
                />
              </View>
              <View style={styles.titleCol}>
                <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>{item.title}</Text>
              </View>
              <Ionicons
                name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={isSelected ? '#F97316' : '#94A3B8'}
                style={isSelected ? { backgroundColor: '#FFFFFF', borderRadius: 11, overflow: 'hidden' } : undefined}
              />
            </View>
            <Text style={styles.description}>{item.desc}</Text>
            <View style={styles.tagRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.members}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {!!errorText && <Text style={styles.errorText}>{errorText}</Text>}
    </View>
  );
};
