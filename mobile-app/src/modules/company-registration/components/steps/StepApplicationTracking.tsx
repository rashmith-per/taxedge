import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import { styles } from './StepApplicationTracking.styles';

export const StepApplicationTracking: React.FC = () => {
  const router = useRouter();
  const draft = useCompanyRegistrationStore((state) => state.draft);
  const setStep = useCompanyRegistrationStore((state) => state.setStep);
  const stages = draft.trackingStages || [];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Application Tracking</Text>
      <Text style={styles.subheading}>
        Live progress tracker for your MCA company incorporation application.
      </Text>

      {/* Application Summary Card */}
      <View style={styles.metaCard}>
        <Text style={styles.metaId}>Application ID: {draft.id}</Text>
        <Text style={styles.metaText}>
          Company: {draft.company?.proposedName1}
        </Text>
        <Text style={styles.metaSub}>
          Type: {draft.company?.companyType || 'Private Limited'} • Date: {draft.createdAt || new Date().toISOString().split('T')[0]}
        </Text>
      </View>

      {/* Vertical Tracking Timeline */}
      <View style={styles.timeline}>
        {stages.map((stg, idx) => {
          const isDone = stg.status === 'completed';
          const isCurrent = stg.status === 'current';
          const isLast = idx === stages.length - 1;

          return (
            <View key={stg.id || `stg-${idx}`} style={styles.stageRow}>
              {/* Timeline Icon & Line Column */}
              <View style={styles.iconColumn}>
                <Ionicons
                  name={isDone ? 'checkmark-circle' : isCurrent ? 'time' : 'ellipse-outline'}
                  size={22}
                  color={isDone ? '#166534' : isCurrent ? '#EA580C' : '#94A3B8'}
                />
                {!isLast && (
                  <View style={[styles.line, isDone && styles.lineCompleted]} />
                )}
              </View>

              {/* Stage Content Card */}
              <View style={styles.stageContent}>
                <Text style={styles.stageTitle}>{stg.title}</Text>
                {stg.description ? (
                  <Text style={styles.stageDesc}>{stg.description}</Text>
                ) : null}

                <View style={styles.statusFooterRow}>
                  {isDone ? (
                    <>
                      <Text style={styles.stageTime}>{stg.updatedAt || 'Completed'}</Text>
                      <Text style={styles.statusCompletedText}>✓ Completed</Text>
                    </>
                  ) : isCurrent ? (
                    <>
                      <Text style={styles.statusCurrentText}>In Progress</Text>
                      <Text style={styles.statusCurrentText}>• Active Step</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.statusPendingText}>Pending</Text>
                      <Text style={styles.statusPendingText}>Upcoming</Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(main)/home')} activeOpacity={0.8}>
          <Ionicons name="home-outline" size={20} color="#FFFFFF" />
          <Text style={styles.homeBtnText}>Go to Home Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.trackBtn} onPress={() => router.replace('/(main)/applications')} activeOpacity={0.8}>
          <Ionicons name="folder-open-outline" size={20} color="#475569" />
          <Text style={styles.trackBtnText}>Track in My Applications</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
