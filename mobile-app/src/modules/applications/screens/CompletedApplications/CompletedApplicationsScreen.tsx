import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { useTheme } from '../../../../hooks/use-theme';
import { useApplicationStore } from '../../../../store/applicationStore';
import {
  styles,
  getCardThemedStyle,
  getTitleThemedStyle,
  getDescThemedStyle,
} from './CompletedApplicationsScreen.styles';

export const CompletedApplicationsScreen: React.FC = () => {
  const colors = useTheme();
  const applications = useApplicationStore((state) =>
    state.applications.filter((application) => application.status === 'Completed'),
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Completed Applications" showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        {applications.length === 0 ? (
          <Text style={[styles.desc, getDescThemedStyle(colors.textSecondary)]}>
            No completed applications yet.
          </Text>
        ) : applications.map((application) => (
          <View key={application.id} style={[styles.card, getCardThemedStyle(colors.backgroundElement)]}>
            <Text style={[styles.title, getTitleThemedStyle(colors.text)]}>
              {application.serviceName} ({application.id})
            </Text>
            <Text style={[styles.desc, getDescThemedStyle(colors.success)]}>
              Completed on {application.createdAt || 'Date unavailable'}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default CompletedApplicationsScreen;
