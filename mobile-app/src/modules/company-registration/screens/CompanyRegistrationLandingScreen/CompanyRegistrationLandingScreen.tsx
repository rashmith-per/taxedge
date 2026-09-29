import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import { styles } from './CompanyRegistrationLandingScreen.styles';

type Tab = 'Overview' | 'Documents' | 'Benefits';

export const CompanyRegistrationLandingScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const resetRegistration = useCompanyRegistrationStore((state) => state.resetRegistration);
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  const handleApply = () => {
    resetRegistration();
    router.push('/service/company-registration-wizard');
  };

  const documentsList = [
    'PAN Card of all Directors / Promoters',
    'Aadhaar Card / Passport of all Directors',
    'Registered Office Ownership / Lease Proof',
    'Utility Bill (Electricity / Water not older than 2 months)',
    'Property Owner No Objection Certificate (NOC)',
  ];

  const benefitsList = [
    '100% Digital MCA Incorporation & Government Portal Filing',
    'Includes RUN / SPICe+ Part A & Part B Submission',
    'Dedicated CA Expert & Compliance Verification Officer',
    'Free PAN, TAN, EPFO, ESIC & Corporate Bank Account Setup',
    'Transparent Itemized MCA Statutory Fee Breakdown',
  ];

  return (
    <View style={styles.container}>
      <AppHeader title="Company Registration" showBack />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Service Hero Header Card */}
        <View style={styles.detailHero}>
          <View style={styles.heroRow}>
            <View style={styles.iconBg}>
              <Ionicons name="business-outline" size={26} color="#EA580C" />
            </View>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>Company Registration</Text>
              <Text style={styles.heroCategory}>Business & Incorporation Category</Text>
            </View>
          </View>
          <Text style={styles.heroDesc}>
            Incorporate your Private Limited, One Person Company (OPC), Section 8 (NGO), or Public Limited Company end-to-end with TaxEdge CA assistance.
          </Text>
        </View>

        {/* Tab Buttons (Overview, Documents, Benefits) */}
        <View style={styles.tabBar}>
          {(['Overview', 'Documents', 'Benefits'] as const).map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabItem, isSelected && { borderBottomColor: '#083B75' }]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: isSelected ? '#083B75' : '#64748B',
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab Content Cards */}
        {activeTab === 'Overview' && (
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Service Overview</Text>
            <Text style={styles.overviewContentText}>
              TaxEdge Fin Solutions provides end-to-end corporate incorporation assistance for MCA, ROC, and statutory authorities. Our compliance team verifies director credentials, checks name availability, drafts e-MoA / e-AoA, and files SPICe+ Part A & Part B directly on the Ministry of Corporate Affairs portal.
            </Text>
          </View>
        )}

        {activeTab === 'Documents' && (
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Required Documents</Text>
            <Text style={styles.cardSectionSub}>
              You will need to upload digital copies of these documents during application:
            </Text>
            <View style={styles.checklist}>
              {documentsList.map((doc, idx) => (
                <View key={idx} style={styles.checkRow}>
                  <Ionicons name="checkbox" size={18} color="#083B75" />
                  <Text style={styles.checklistText}>{doc}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'Benefits' && (
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Benefits & Advantages</Text>
            <Text style={styles.cardSectionSub}>Why choose TaxEdge Fin Solutions:</Text>
            <View style={styles.checklist}>
              {benefitsList.map((benefit, idx) => (
                <View key={idx} style={styles.checkRow}>
                  <Ionicons name="sparkles" size={16} color="#EA580C" />
                  <Text style={styles.checklistText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom "Apply" Button */}
      <View
        style={[
          styles.bottomButtonContainer,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.8}>
          <Text style={styles.applyBtnText}>Apply Now →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
