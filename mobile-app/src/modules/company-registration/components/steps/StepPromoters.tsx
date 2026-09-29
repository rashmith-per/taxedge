import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import type { DirectorInfo } from '../../types/director.types';
import { PromoterDirectorCard } from './PromoterDirectorCard';
import { DeleteDirectorModal } from './DeleteDirectorModal';
import { styles } from './StepPromoters.styles';

export const StepPromoters: React.FC = () => {
  const company = useCompanyRegistrationStore((state) => state.draft.company);
  const directors = useCompanyRegistrationStore((state) => state.draft.directors);
  const addDirector = useCompanyRegistrationStore((state) => state.addDirector);
  const updateDirector = useCompanyRegistrationStore((state) => state.updateDirector);
  const removeDirector = useCompanyRegistrationStore((state) => state.removeDirector);
  const fieldErrors = useCompanyRegistrationStore((state) => state.fieldErrors);

  const [expandedDirectorId, setExpandedDirectorId] = useState<string | null>(
    directors.length > 0 ? directors[0].id : null
  );

  const [deletingDirector, setDeletingDirector] = useState<DirectorInfo | null>(null);

  const isOpc = company.companyType === 'One Person Company (OPC)';
  const minRequiredDirectors = isOpc ? 1 : 2;

  // Auto-recalculate total subscribed shares & individual percentage
  const totalSubscribedShares = directors.reduce(
    (sum, d) => sum + (Number(d.numberOfShares) || 0),
    0
  );

  const getShareholdingPct = (shares: number | undefined): string => {
    if (isOpc) return '100%';
    if (!shares || !totalSubscribedShares || totalSubscribedShares <= 0) return '0%';
    const pct = (Number(shares) / totalSubscribedShares) * 100;
    if (isNaN(pct)) return '0%';
    return pct % 1 === 0 ? `${pct.toFixed(0)}%` : `${pct.toFixed(1)}%`;
  };

  const handleAddPromoter = () => {
    const newId = `dir-${Date.now()}`;
    addDirector({
      id: newId,
      name: '',
      pan: '',
      dob: '',
      fatherName: '',
      gender: '',
      nationality: '',
      occupation: '',
      educationalQualification: '',
      designation: '',
      category: '',
      email: '',
      phone: '',
      isResidentInIndia: true,
      sameAsPermanentAddress: true,
      numberOfShares: 0,
      amountSubscribed: 0,
    });
    setExpandedDirectorId(newId);
  };

  const handleSaveDirector = (id: string, updatedFields: Partial<DirectorInfo>) => {
    updateDirector(id, updatedFields);
    setExpandedDirectorId(null);
  };

  const handleConfirmDelete = () => {
    if (deletingDirector) {
      removeDirector(deletingDirector.id);
      setDeletingDirector(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Promoter / Director Details</Text>
      <Text style={styles.subheading}>
        Enter essential details of all promoters/directors for CA processing.
      </Text>

      {!!fieldErrors.directorsCount && (
        <Text style={[styles.errorText, { marginBottom: 12 }]}>{fieldErrors.directorsCount}</Text>
      )}

      {directors.map((director, idx) => (
        <PromoterDirectorCard
          key={director.id}
          director={director}
          index={idx}
          isExpanded={expandedDirectorId === director.id}
          canRemove={directors.length > minRequiredDirectors}
          shareholdingPct={getShareholdingPct(director.numberOfShares)}
          onToggleExpand={() =>
            setExpandedDirectorId(expandedDirectorId === director.id ? null : director.id)
          }
          onSave={(updatedFields) => handleSaveDirector(director.id, updatedFields)}
          onDeleteRequest={() => setDeletingDirector(director)}
        />
      ))}

      {!isOpc && (
        <TouchableOpacity style={styles.addBtn} onPress={handleAddPromoter} activeOpacity={0.7}>
          <Ionicons name="add-circle-outline" size={20} color="#083B75" />
          <Text style={styles.addBtnText}>+ Add Promoter / Director</Text>
        </TouchableOpacity>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteDirectorModal
        visible={!!deletingDirector}
        directorName={deletingDirector?.name || ''}
        onCancel={() => setDeletingDirector(null)}
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
};
