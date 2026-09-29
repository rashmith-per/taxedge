import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { DocumentUploadBottomSheet } from '@/modules/itr/tds/components/upload/DocumentUploadBottomSheet/DocumentUploadBottomSheet';
import { TdsDocumentCard } from '@/modules/itr/tds/components/upload/TdsDocumentCard/TdsDocumentCard';
import { TdsChecklistItem } from '@/modules/itr/tds/types/checklist.types';
import { DocumentPreviewModal } from '@/modules/itr/itr-filing/components/DocumentPreviewModal/DocumentPreviewModal';
import { ItrDocumentItem } from '@/modules/itr/itr-filing/types/itrFiling.types';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import { CompanySectionCard } from '../CompanySectionCard/CompanySectionCard';
import { styles } from './StepRegisteredOffice.styles';

type DocType = 'proof' | 'ownership' | 'noc';

export const StepRegisteredOffice: React.FC = () => {
  const company = useCompanyRegistrationStore((state) => state.draft.company);
  const updateDetails = useCompanyRegistrationStore((state) => state.updateCompanyDetails);
  const fieldErrors = useCompanyRegistrationStore((state) => state.fieldErrors);

  const [activeDocType, setActiveDocType] = useState<DocType | null>(null);
  const [previewItem, setPreviewItem] = useState<ItrDocumentItem | null>(null);

  const isNocRequired = company.premisesOwnership === 'Rented' || company.premisesOwnership === 'Leased';

  const getDocTitle = (type: DocType | null) => {
    switch (type) {
      case 'proof': return 'Office Address Proof / Utility Bill';
      case 'ownership': return 'Ownership / Rent / Lease Document';
      case 'noc': return 'Owner NOC';
      default: return 'Document';
    }
  };

  const handleDocumentSelected = (fileName: string, fileUri?: string) => {
    if (!activeDocType) return;
    if (activeDocType === 'proof') updateDetails({ officeAddressProofName: fileName, officeAddressProofUri: fileUri });
    if (activeDocType === 'ownership') updateDetails({ ownershipDocName: fileName, ownershipDocUri: fileUri });
    if (activeDocType === 'noc') updateDetails({ ownerNocName: fileName, ownerNocUri: fileUri });
    setActiveDocType(null);
  };

  const handlePickFiles = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/jpeg', 'image/png'], copyToCacheDirectory: true });
      if (!res.canceled && res.assets && res.assets.length > 0) handleDocumentSelected(res.assets[0].name, res.assets[0].uri);
    } catch (e: any) { Alert.alert('Upload Error', e?.message || 'Failed to select document.'); }
  };

  const handlePickGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return Alert.alert('Permission Required', 'Please allow gallery access.');
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
      if (!res.canceled && res.assets && res.assets.length > 0) handleDocumentSelected(res.assets[0].fileName || `doc_${Date.now()}.jpg`, res.assets[0].uri);
    } catch (e: any) { Alert.alert('Upload Error', e?.message || 'Failed to select image.'); }
  };

  const handleTakePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return Alert.alert('Permission Required', 'Please allow camera access.');
      const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (!res.canceled && res.assets && res.assets.length > 0) handleDocumentSelected(res.assets[0].fileName || `photo_${Date.now()}.jpg`, res.assets[0].uri);
    } catch (e: any) { Alert.alert('Upload Error', e?.message || 'Failed to take photo.'); }
  };

  const handleRemoveDoc = (type: DocType) => {
    if (type === 'proof') updateDetails({ officeAddressProofName: '', officeAddressProofUri: '' });
    if (type === 'ownership') updateDetails({ ownershipDocName: '', ownershipDocUri: '' });
    if (type === 'noc') updateDetails({ ownerNocName: '', ownerNocUri: '' });
  };

  const renderDocCard = (
    label: string,
    type: DocType,
    fileName: string | undefined,
    fileUri: string | undefined,
    helperText: string | undefined,
    isRequired = true,
    errorMsg?: string
  ) => {
    const item: TdsChecklistItem = {
      id: type,
      title: label.replace('*', '').trim(),
      subtitle: helperText || (isRequired ? 'Mandatory document' : 'Optional document'),
      status: fileName ? 'uploaded' : 'not_uploaded',
      isMandatory: isRequired,
      fileName,
      fileUri: fileUri || (fileName ? `file://${fileName}` : undefined),
      fileSize: fileName ? '2.4 MB' : undefined,
    };

    return (
      <View style={styles.fieldGroup}>
        <TdsDocumentCard
          item={item}
          onUploadPress={() => setActiveDocType(type)}
          onChange={() => setActiveDocType(type)}
          onDelete={() => handleRemoveDoc(type)}
          onView={() => {
            if (fileName) {
              setPreviewItem({
                id: type,
                name: label.replace('*', '').trim(),
                subtitle: helperText || (isRequired ? 'Mandatory document' : 'Optional document'),
                tier: isRequired ? 'REQUIRED' : 'NOT_REQUIRED',
                required: isRequired,
                docGroup: 'common',
                fileUri: fileUri || `file://${fileName}`,
                fileName,
                fileSize: '2.4 MB',
              });
            }
          }}
        />
        {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* CARD A — BUILDING / ADDRESS */}
      <CompanySectionCard title="Building / Address" description="Provide official communication address for MCA, ROC, and statutory authorities.">
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Building / Premises Address Line *</Text>
          <TextInput
            style={[styles.input, !!fieldErrors.registeredAddressLine && styles.inputError]}
            value={company.registeredAddressLine}
            onChangeText={(val) => updateDetails({ registeredAddressLine: val })}
            placeholder="Enter registered address"
            placeholderTextColor="#94A3B8"
          />
          {!!fieldErrors.registeredAddressLine && <Text style={styles.errorText}>{fieldErrors.registeredAddressLine}</Text>}
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldGroup, styles.halfField]}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={[styles.input, !!fieldErrors.registeredCity && styles.inputError]}
              value={company.registeredCity}
              onChangeText={(val) => updateDetails({ registeredCity: val })}
              placeholder="Enter city"
              placeholderTextColor="#94A3B8"
            />
            {!!fieldErrors.registeredCity && <Text style={styles.errorText}>{fieldErrors.registeredCity}</Text>}
          </View>
          <View style={[styles.fieldGroup, styles.halfField]}>
            <Text style={styles.label}>District *</Text>
            <TextInput
              style={[styles.input, !!fieldErrors.registeredDistrict && styles.inputError]}
              value={company.registeredDistrict || ''}
              onChangeText={(val) => updateDetails({ registeredDistrict: val })}
              placeholder="Enter district"
              placeholderTextColor="#94A3B8"
            />
            {!!fieldErrors.registeredDistrict && <Text style={styles.errorText}>{fieldErrors.registeredDistrict}</Text>}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldGroup, styles.halfField]}>
            <Text style={styles.label}>State *</Text>
            <TextInput
              style={[styles.input, !!fieldErrors.registeredState && styles.inputError]}
              value={company.registeredState}
              onChangeText={(val) => updateDetails({ registeredState: val })}
              placeholder="Enter state"
              placeholderTextColor="#94A3B8"
            />
            {!!fieldErrors.registeredState && <Text style={styles.errorText}>{fieldErrors.registeredState}</Text>}
          </View>
          <View style={[styles.fieldGroup, styles.halfField]}>
            <Text style={styles.label}>PIN Code *</Text>
            <TextInput
              style={[styles.input, !!fieldErrors.registeredPincode && styles.inputError]}
              value={company.registeredPincode}
              onChangeText={(val) => updateDetails({ registeredPincode: val })}
              placeholder="Enter PIN code"
              keyboardType="numeric"
              placeholderTextColor="#94A3B8"
            />
            {!!fieldErrors.registeredPincode && <Text style={styles.errorText}>{fieldErrors.registeredPincode}</Text>}
          </View>
        </View>
      </CompanySectionCard>

      {/* CARD B — PREMISES OWNERSHIP */}
      <CompanySectionCard title="Premises Ownership">
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Premises Ownership Status *</Text>
          <View style={styles.chipRow}>
            {(['Rented', 'Owned', 'Leased'] as const).map((status) => {
              const isSelected = company.premisesOwnership === status;
              return (
                <TouchableOpacity key={status} style={[styles.chip, isSelected && styles.chipSelected]} onPress={() => updateDetails({ premisesOwnership: status })}>
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{status}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {!!fieldErrors.premisesOwnership && <Text style={styles.errorText}>{fieldErrors.premisesOwnership}</Text>}
          <View style={styles.infoBoxContainer}>
            <Ionicons name="information-circle-outline" size={18} color="#0369A1" style={styles.infoIcon} />
            <Text style={styles.infoNote}>
              Proof of address (Electricity Bill / Rent Agreement) is mandatory. If premises are rented, leased, or owned by a Director or third party, a No Objection Certificate (NOC) from the owner is strictly required.
            </Text>
          </View>
        </View>
      </CompanySectionCard>

      {/* CARD C — CONTACT DETAILS */}
      <CompanySectionCard title="Contact Details">
        <View style={styles.row}>
          <View style={[styles.fieldGroup, styles.halfField]}>
            <Text style={styles.label}>Company Email *</Text>
            <TextInput
              style={[styles.input, !!fieldErrors.companyEmail && styles.inputError]}
              value={company.companyEmail}
              onChangeText={(val) => updateDetails({ companyEmail: val })}
              placeholder="Enter company email"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#94A3B8"
            />
            {!!fieldErrors.companyEmail && <Text style={styles.errorText}>{fieldErrors.companyEmail}</Text>}
          </View>
          <View style={[styles.fieldGroup, styles.halfField]}>
            <Text style={styles.label}>Mobile *</Text>
            <TextInput
              style={[styles.input, !!fieldErrors.companyMobile && styles.inputError]}
              value={company.companyMobile}
              onChangeText={(val) => updateDetails({ companyMobile: val })}
              placeholder="Enter company mobile"
              keyboardType="phone-pad"
              placeholderTextColor="#94A3B8"
            />
            {!!fieldErrors.companyMobile && <Text style={styles.errorText}>{fieldErrors.companyMobile}</Text>}
          </View>
        </View>
      </CompanySectionCard>

      {/* CARD D — OFFICE DOCUMENTS */}
      <CompanySectionCard title="Office Documents">
        {renderDocCard('Office Address Proof / Utility Bill', 'proof', company.officeAddressProofName, company.officeAddressProofUri, 'Utility bill should be recent (not older than 2 months).', true, fieldErrors.officeAddressProof)}
        {renderDocCard('Ownership / Rent / Lease Document', 'ownership', company.ownershipDocName, company.ownershipDocUri, undefined, true, fieldErrors.ownershipDoc)}
        {renderDocCard('Owner NOC', 'noc', company.ownerNocName, company.ownerNocUri, 'Required only for rented/leased/third-party premises.', isNocRequired, fieldErrors.ownerNoc)}
      </CompanySectionCard>

      <DocumentUploadBottomSheet visible={!!activeDocType} documentTitle={getDocTitle(activeDocType)} onClose={() => setActiveDocType(null)} onCancel={() => setActiveDocType(null)} onPickFiles={handlePickFiles} onPickGallery={handlePickGallery} onTakePhoto={handleTakePhoto} />
      <DocumentPreviewModal visible={!!previewItem} document={previewItem} onClose={() => setPreviewItem(null)} onChangeFile={(doc) => { setPreviewItem(null); setActiveDocType(doc.id as DocType); }} />
    </View>
  );
};
