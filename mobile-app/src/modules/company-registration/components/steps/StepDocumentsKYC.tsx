import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { DocumentUploadBottomSheet } from '@/modules/itr/tds/components/upload/DocumentUploadBottomSheet/DocumentUploadBottomSheet';
import { TdsDocumentCard } from '@/modules/itr/tds/components/upload/TdsDocumentCard/TdsDocumentCard';
import { TdsChecklistItem } from '@/modules/itr/tds/types/checklist.types';
import { DocumentPreviewModal } from '@/modules/itr/itr-filing/components/DocumentPreviewModal/DocumentPreviewModal';
import { ItrDocumentItem } from '@/modules/itr/itr-filing/types/itrFiling.types';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import { styles } from './StepDocumentsKYC.styles';

export interface KycChecklistItem {
  id: string;
  title: string;
  subtitle: string;
  section: 'PROMOTER / DIRECTOR KYC' | 'REGISTERED OFFICE' | 'STATUTORY DOCUMENTS';
  required: boolean;
  iconName: keyof typeof Ionicons.glyphMap;
}

const CHECKLIST_ITEMS: KycChecklistItem[] = [
  // PROMOTER / DIRECTOR KYC
  {
    id: 'doc-pan',
    title: 'PAN Card *',
    subtitle: 'Promoter KYC',
    section: 'PROMOTER / DIRECTOR KYC',
    required: true,
    iconName: 'card-outline',
  },
  {
    id: 'doc-aadhaar',
    title: 'Identity / Address Proof *',
    subtitle: 'Aadhaar / Passport / other applicable proof',
    section: 'PROMOTER / DIRECTOR KYC',
    required: true,
    iconName: 'id-card-outline',
  },
  {
    id: 'doc-photo',
    title: 'Passport Photo',
    subtitle: 'Required if applicable',
    section: 'PROMOTER / DIRECTOR KYC',
    required: false,
    iconName: 'person-circle-outline',
  },

  // REGISTERED OFFICE
  {
    id: 'doc-address',
    title: 'Office Address Proof *',
    subtitle: 'Lease / Rent Agreement / Ownership Proof',
    section: 'REGISTERED OFFICE',
    required: true,
    iconName: 'business-outline',
  },
  {
    id: 'doc-utility',
    title: 'Office Utility Bill *',
    subtitle: 'Electricity / Water / applicable utility bill',
    section: 'REGISTERED OFFICE',
    required: true,
    iconName: 'receipt-outline',
  },
  {
    id: 'doc-noc',
    title: 'Owner NOC',
    subtitle: 'Required only if applicable',
    section: 'REGISTERED OFFICE',
    required: false,
    iconName: 'document-attach-outline',
  },

  // STATUTORY DOCUMENTS
  {
    id: 'doc-moa',
    title: 'MOA / e-MOA',
    subtitle: 'Handled/generated as applicable',
    section: 'STATUTORY DOCUMENTS',
    required: false,
    iconName: 'document-text-outline',
  },
  {
    id: 'doc-aoa',
    title: 'AOA / e-AOA',
    subtitle: 'Handled/generated as applicable',
    section: 'STATUTORY DOCUMENTS',
    required: false,
    iconName: 'book-outline',
  },
];

export const StepDocumentsKYC: React.FC = () => {
  const storedDocs = useCompanyRegistrationStore((state) => state.draft.documents);
  const updateDocumentStatus = useCompanyRegistrationStore((state) => state.updateDocumentStatus);

  const [activeItem, setActiveItem] = useState<KycChecklistItem | null>(null);
  const [previewItem, setPreviewItem] = useState<ItrDocumentItem | null>(null);

  const handleDocumentSelected = (fileName: string, fileUri?: string) => {
    if (!activeItem) return;
    updateDocumentStatus(activeItem.id, 'Uploaded', fileUri, fileName);
    setActiveItem(null);
  };

  const handlePickFiles = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        handleDocumentSelected(asset.name, asset.uri);
      }
    } catch (e: any) {
      Alert.alert('Upload Error', e?.message || 'Failed to select document.');
    }
  };

  const handlePickGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Please allow gallery access to select photo.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        const name = asset.fileName || `photo_${Date.now()}.jpg`;
        handleDocumentSelected(name, asset.uri);
      }
    } catch (e: any) {
      Alert.alert('Upload Error', e?.message || 'Failed to select image from gallery.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Please allow camera access to take document photo.');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        const name = asset.fileName || `camera_${Date.now()}.jpg`;
        handleDocumentSelected(name, asset.uri);
      }
    } catch (e: any) {
      Alert.alert('Upload Error', e?.message || 'Failed to take photo.');
    }
  };

  const handleRemoveDocument = (docId: string) => {
    updateDocumentStatus(docId, 'Pending', undefined, undefined);
  };


  const sections: ('PROMOTER / DIRECTOR KYC' | 'REGISTERED OFFICE' | 'STATUTORY DOCUMENTS')[] = [
    'PROMOTER / DIRECTOR KYC',
    'REGISTERED OFFICE',
    'STATUTORY DOCUMENTS',
  ];

  const fieldErrors = useCompanyRegistrationStore((state) => state.fieldErrors);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Documents & KYC Checklist</Text>
      <Text style={styles.subheading}>
        Upload digital copies of promoter identity, office proofs, and statutory e-MoA/e-AoA drafts.
      </Text>

      {sections.map((sectionName) => {
        const sectionItems = CHECKLIST_ITEMS.filter((item) => item.section === sectionName);
        if (sectionItems.length === 0) return null;

        return (
          <View key={sectionName}>
            <Text style={styles.sectionTitle}>{sectionName}</Text>

            {sectionItems.map((item) => {
              const stored = storedDocs.find((d) => d.id === item.id);
              const isUploaded = stored?.status === 'Uploaded';
              const displayFileName = stored?.fileName || (stored?.fileUri ? stored.fileUri.split('/').pop() : '');

              const tdsItem: TdsChecklistItem = {
                id: item.id,
                title: item.title.replace('*', '').trim(),
                subtitle: item.subtitle,
                status: isUploaded ? 'uploaded' : 'not_uploaded',
                isMandatory: item.required,
                fileName: displayFileName || undefined,
                fileUri: stored?.fileUri || (isUploaded && displayFileName ? `file://${displayFileName}` : undefined),
                fileSize: isUploaded ? '2.4 MB' : undefined,
                isVisible: true,
              };

              const err = fieldErrors[item.id];

              return (
                <View key={item.id} style={{ marginBottom: 12 }}>
                  <TdsDocumentCard
                    item={tdsItem}
                    onUploadPress={() => setActiveItem(item)}
                    onChange={() => setActiveItem(item)}
                    onDelete={() => handleRemoveDocument(item.id)}
                    onView={() => {
                      if (displayFileName || stored?.fileUri) {
                        setPreviewItem({
                          id: item.id,
                          name: item.title.replace('*', '').trim(),
                          subtitle: item.subtitle,
                          tier: item.required ? 'REQUIRED' : 'NOT_REQUIRED',
                          required: item.required,
                          docGroup: 'common',
                          fileUri: stored?.fileUri || `file://${displayFileName}`,
                          fileName: displayFileName,
                          fileSize: '2.4 MB',
                        });
                      }
                    }}
                  />
                  {!!err && <Text style={styles.errorText}>{err}</Text>}
                </View>
              );
            })}
          </View>
        );
      })}

      {/* Reused ITR Document Upload Bottom Sheet */}
      <DocumentUploadBottomSheet
        visible={!!activeItem}
        documentTitle={activeItem?.title.replace('*', '').trim()}
        onClose={() => setActiveItem(null)}
        onCancel={() => setActiveItem(null)}
        onPickFiles={handlePickFiles}
        onPickGallery={handlePickGallery}
        onTakePhoto={handleTakePhoto}
      />

      <DocumentPreviewModal
        visible={!!previewItem}
        document={previewItem}
        onClose={() => setPreviewItem(null)}
        onChangeFile={(doc) => {
          setPreviewItem(null);
          const originalItem = CHECKLIST_ITEMS.find(i => i.id === doc.id);
          if (originalItem) setActiveItem(originalItem);
        }}
      />
    </View>
  );
};
