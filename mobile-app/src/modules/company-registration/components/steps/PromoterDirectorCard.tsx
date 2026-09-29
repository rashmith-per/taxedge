import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { DirectorInfo } from '../../types/director.types';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import { formatDobInput } from '../../validation/directorSchema';
import { styles } from './StepPromoters.styles';

export interface PromoterDirectorCardProps {
  director: DirectorInfo;
  index: number;
  isExpanded: boolean;
  canRemove: boolean;
  shareholdingPct: string;
  onToggleExpand: () => void;
  onSave: (updated: Partial<DirectorInfo>) => void;
  onDeleteRequest: () => void;
}

export const PromoterDirectorCard: React.FC<PromoterDirectorCardProps> = ({
  director,
  index,
  isExpanded,
  canRemove,
  shareholdingPct,
  onToggleExpand,
  onSave,
  onDeleteRequest,
}) => {
  const fieldErrors = useCompanyRegistrationStore((state) => state.fieldErrors);
  const [formData, setFormData] = useState<DirectorInfo>(director);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  useEffect(() => { setFormData(director); }, [director]);

  const updateField = (fields: Partial<DirectorInfo>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const getErr = (fieldKey: string) => fieldErrors[`dir_${director.id}_${fieldKey}`];

  const isSameAddress = formData.sameAsPermanentAddress !== false;
  const isResident = formData.isResidentInIndia !== false;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TouchableOpacity style={styles.cardHeaderLeft} onPress={onToggleExpand} activeOpacity={0.8}>
          <View style={styles.avatarBox}><Text style={styles.avatarText}>#{index + 1}</Text></View>
          <View style={styles.cardTitleGroup}>
            <Text style={styles.cardTitle}>👤 Director #{index + 1}</Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>{director.name || 'Enter Promoter / Director Details'}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.cardHeaderRight}>
          <TouchableOpacity style={styles.editBtnHeader} onPress={onToggleExpand} activeOpacity={0.7}>
            <Ionicons name={isExpanded ? 'chevron-up' : 'pencil'} size={16} color="#083B75" />
            <Text style={styles.editBtnHeaderText}>{isExpanded ? 'Collapse' : 'Edit'}</Text>
          </TouchableOpacity>
          {canRemove && (
            <TouchableOpacity style={styles.deleteBtnHeader} onPress={onDeleteRequest} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!isExpanded && (
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>PAN: <Text style={styles.summaryBold}>{director.pan || 'N/A'}</Text></Text>
            <Text style={styles.summaryText}>Mobile: <Text style={styles.summaryBold}>{director.phone || 'N/A'}</Text></Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Shares: <Text style={styles.summaryBold}>{director.numberOfShares ? director.numberOfShares.toLocaleString() : '0'}</Text></Text>
            <Text style={styles.summaryText}>Shareholding: <Text style={styles.summaryBold}>{shareholdingPct}</Text></Text>
          </View>
        </View>
      )}

      {isExpanded && (
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>A. Basic Details</Text>
          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Full Name (as in PAN) *</Text>
              <TextInput style={[styles.input, !!getErr('name') && styles.inputError]} value={formData.name} onChangeText={(val) => updateField({ name: val })} placeholder="Full Legal Name" placeholderTextColor="#94A3B8" />
              {!!getErr('name') && <Text style={styles.errorText}>{getErr('name')}</Text>}
            </View>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>PAN Number *</Text>
              <TextInput style={[styles.input, !!getErr('pan') && styles.inputError]} value={formData.pan} onChangeText={(val) => updateField({ pan: val })} placeholder="10-digit PAN" autoCapitalize="characters" placeholderTextColor="#94A3B8" />
              {!!getErr('pan') && <Text style={styles.errorText}>{getErr('pan')}</Text>}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>DIN (if already allotted)</Text>
              <TextInput style={[styles.input, !!getErr('din') && styles.inputError]} value={formData.din || ''} onChangeText={(val) => updateField({ din: val, hasDin: !!val })} placeholder="8-digit DIN" keyboardType="numeric" placeholderTextColor="#94A3B8" />
              {!!getErr('din') && <Text style={styles.errorText}>{getErr('din')}</Text>}
            </View>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Date of Birth *</Text>
              <TextInput style={[styles.input, !!getErr('dob') && styles.inputError]} value={formData.dob || ''} onChangeText={(val) => updateField({ dob: formatDobInput(val) })} placeholder="DD-MM-YYYY" keyboardType="numeric" maxLength={10} placeholderTextColor="#94A3B8" />
              {!!getErr('dob') && <Text style={styles.errorText}>{getErr('dob')}</Text>}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Father's Name *</Text>
              <TextInput style={[styles.input, !!getErr('fatherName') && styles.inputError]} value={formData.fatherName || ''} onChangeText={(val) => updateField({ fatherName: val })} placeholder="Father's Full Name" placeholderTextColor="#94A3B8" />
              {!!getErr('fatherName') && <Text style={styles.errorText}>{getErr('fatherName')}</Text>}
            </View>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Gender *</Text>
              <TouchableOpacity style={[styles.dropdownButton, !!getErr('gender') && styles.inputError]} onPress={() => setShowGenderDropdown((prev) => !prev)} activeOpacity={0.8}>
                <Text style={[styles.dropdownButtonText, !formData.gender && styles.placeholderText]}>{formData.gender ? `${formData.gender} ▼` : 'Select Gender ▼'}</Text>
              </TouchableOpacity>
              {showGenderDropdown && (
                <View style={styles.dropdownMenu}>
                  {['Female', 'Male', 'Others'].map((opt) => (
                    <TouchableOpacity key={opt} style={[styles.dropdownItem, formData.gender === opt && styles.dropdownItemActive]} onPress={() => { updateField({ gender: opt }); setShowGenderDropdown(false); }}>
                      <Text style={[styles.dropdownItemText, formData.gender === opt && styles.dropdownItemTextActive]}>{opt}</Text>
                      {formData.gender === opt && <Ionicons name="checkmark" size={16} color="#083B75" />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {!!getErr('gender') && <Text style={styles.errorText}>{getErr('gender')}</Text>}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Nationality *</Text>
              <TextInput style={[styles.input, !!getErr('nationality') && styles.inputError]} value={formData.nationality || ''} onChangeText={(val) => updateField({ nationality: val })} placeholder="Enter nationality" placeholderTextColor="#94A3B8" />
              {!!getErr('nationality') && <Text style={styles.errorText}>{getErr('nationality')}</Text>}
            </View>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Designation *</Text>
              <TextInput style={[styles.input, !!getErr('designation') && styles.inputError]} value={formData.designation || ''} onChangeText={(val) => updateField({ designation: val })} placeholder="Enter designation" placeholderTextColor="#94A3B8" />
              {!!getErr('designation') && <Text style={styles.errorText}>{getErr('designation')}</Text>}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Category *</Text>
            <TextInput style={[styles.input, !!getErr('category') && styles.inputError]} value={formData.category || ''} onChangeText={(val) => updateField({ category: val })} placeholder="Enter category" placeholderTextColor="#94A3B8" />
            {!!getErr('category') && <Text style={styles.errorText}>{getErr('category')}</Text>}
          </View>

          <View style={styles.sectionDivider} />

          <Text style={styles.sectionTitle}>B. Contact</Text>
          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput style={[styles.input, !!getErr('email') && styles.inputError]} value={formData.email || ''} onChangeText={(val) => updateField({ email: val })} placeholder="Enter Email Address" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#94A3B8" />
              {!!getErr('email') && <Text style={styles.errorText}>{getErr('email')}</Text>}
            </View>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Mobile Number *</Text>
              <TextInput style={[styles.input, !!getErr('phone') && styles.inputError]} value={formData.phone || ''} onChangeText={(val) => updateField({ phone: val.replace(/\D/g, '').slice(0, 10) })} placeholder="Enter 10-digit Mobile Number" keyboardType="phone-pad" maxLength={10} placeholderTextColor="#94A3B8" />
              {!!getErr('phone') && <Text style={styles.errorText}>{getErr('phone')}</Text>}
            </View>
          </View>

          <View style={styles.sectionDivider} />

          <Text style={styles.sectionTitle}>C. Residency & Address</Text>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Whether resident in India *</Text>
            <View style={styles.chipRow}>
              {[true, false].map((val) => (
                <TouchableOpacity key={val ? 'yes' : 'no'} style={[styles.chip, isResident === val && styles.chipSelected]} onPress={() => updateField({ isResidentInIndia: val })}>
                  <Text style={[styles.chipText, isResident === val && styles.chipTextSelected]}>{val ? 'Yes' : 'No'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Address Line 1 *</Text>
            <TextInput style={[styles.input, !!getErr('addressLine1') && styles.inputError]} value={formData.addressLine1 || formData.residentialAddress || ''} onChangeText={(val) => updateField({ addressLine1: val, residentialAddress: val })} placeholder="Enter Address Line 1" placeholderTextColor="#94A3B8" />
            {!!getErr('addressLine1') && <Text style={styles.errorText}>{getErr('addressLine1')}</Text>}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Address Line 2 (Optional)</Text>
            <TextInput style={styles.input} value={formData.addressLine2 || ''} onChangeText={(val) => updateField({ addressLine2: val })} placeholder="Enter Address Line 2 (Optional)" placeholderTextColor="#94A3B8" />
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>City *</Text>
              <TextInput style={[styles.input, !!getErr('city') && styles.inputError]} value={formData.city || ''} onChangeText={(val) => updateField({ city: val })} placeholder="Enter City" placeholderTextColor="#94A3B8" />
              {!!getErr('city') && <Text style={styles.errorText}>{getErr('city')}</Text>}
            </View>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>District *</Text>
              <TextInput style={[styles.input, !!getErr('district') && styles.inputError]} value={formData.district || ''} onChangeText={(val) => updateField({ district: val })} placeholder="Enter District" placeholderTextColor="#94A3B8" />
              {!!getErr('district') && <Text style={styles.errorText}>{getErr('district')}</Text>}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>State *</Text>
              <TextInput style={[styles.input, !!getErr('state') && styles.inputError]} value={formData.state || ''} onChangeText={(val) => updateField({ state: val })} placeholder="Enter State" placeholderTextColor="#94A3B8" />
              {!!getErr('state') && <Text style={styles.errorText}>{getErr('state')}</Text>}
            </View>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>PIN Code *</Text>
              <TextInput style={[styles.input, !!getErr('pinCode') && styles.inputError]} value={formData.pinCode || ''} onChangeText={(val) => updateField({ pinCode: val })} placeholder="Enter 6-digit PIN Code" keyboardType="numeric" placeholderTextColor="#94A3B8" />
              {!!getErr('pinCode') && <Text style={styles.errorText}>{getErr('pinCode')}</Text>}
            </View>
          </View>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => updateField({ sameAsPermanentAddress: !isSameAddress })} activeOpacity={0.8}>
            <Ionicons name={isSameAddress ? 'checkbox' : 'square-outline'} size={20} color={isSameAddress ? '#083B75' : '#64748B'} />
            <Text style={styles.checkboxText}>Present Residential Address same as Permanent Address</Text>
          </TouchableOpacity>

          {!isSameAddress && (
            <View style={{ marginTop: 8 }}>
              <Text style={[styles.label, { color: '#083B75', fontWeight: '700' }]}>Present Residential Address</Text>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Present Address Line 1 *</Text>
                <TextInput style={[styles.input, !!getErr('presentAddressLine1') && styles.inputError]} value={formData.presentAddressLine1 || ''} onChangeText={(val) => updateField({ presentAddressLine1: val })} placeholder="Enter Address Line 1" placeholderTextColor="#94A3B8" />
                {!!getErr('presentAddressLine1') && <Text style={styles.errorText}>{getErr('presentAddressLine1')}</Text>}
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Present Address Line 2 (Optional)</Text>
                <TextInput style={styles.input} value={formData.presentAddressLine2 || ''} onChangeText={(val) => updateField({ presentAddressLine2: val })} placeholder="Enter Address Line 2 (Optional)" placeholderTextColor="#94A3B8" />
              </View>
              <View style={styles.row}>
                <View style={[styles.fieldGroup, styles.halfField]}>
                  <Text style={styles.label}>City *</Text>
                  <TextInput style={[styles.input, !!getErr('presentCity') && styles.inputError]} value={formData.presentCity || ''} onChangeText={(val) => updateField({ presentCity: val })} placeholder="Enter City" placeholderTextColor="#94A3B8" />
                  {!!getErr('presentCity') && <Text style={styles.errorText}>{getErr('presentCity')}</Text>}
                </View>
                <View style={[styles.fieldGroup, styles.halfField]}>
                  <Text style={styles.label}>District *</Text>
                  <TextInput style={[styles.input, !!getErr('presentDistrict') && styles.inputError]} value={formData.presentDistrict || ''} onChangeText={(val) => updateField({ presentDistrict: val })} placeholder="Enter District" placeholderTextColor="#94A3B8" />
                  {!!getErr('presentDistrict') && <Text style={styles.errorText}>{getErr('presentDistrict')}</Text>}
                </View>
              </View>
              <View style={styles.row}>
                <View style={[styles.fieldGroup, styles.halfField]}>
                  <Text style={styles.label}>State *</Text>
                  <TextInput style={[styles.input, !!getErr('presentState') && styles.inputError]} value={formData.presentState || ''} onChangeText={(val) => updateField({ presentState: val })} placeholder="Enter State" placeholderTextColor="#94A3B8" />
                  {!!getErr('presentState') && <Text style={styles.errorText}>{getErr('presentState')}</Text>}
                </View>
                <View style={[styles.fieldGroup, styles.halfField]}>
                  <Text style={styles.label}>PIN Code *</Text>
                  <TextInput style={[styles.input, !!getErr('presentPincode') && styles.inputError]} value={formData.presentPincode || ''} onChangeText={(val) => updateField({ presentPincode: val })} placeholder="Enter 6-digit PIN Code" keyboardType="numeric" placeholderTextColor="#94A3B8" />
                  {!!getErr('presentPincode') && <Text style={styles.errorText}>{getErr('presentPincode')}</Text>}
                </View>
              </View>
            </View>
          )}

          <View style={styles.sectionDivider} />

          <Text style={styles.sectionTitle}>D. Share Subscription</Text>
          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Number of Equity Shares Subscribed *</Text>
              <TextInput style={[styles.input, !!getErr('numberOfShares') && styles.inputError]} value={formData.numberOfShares ? String(formData.numberOfShares) : ''} onChangeText={(val) => { const shares = parseInt(val, 10) || 0; updateField({ numberOfShares: shares, amountSubscribed: shares * 10 }); }} placeholder="Enter Subscribed Shares" keyboardType="numeric" placeholderTextColor="#94A3B8" />
              {!!getErr('numberOfShares') && <Text style={styles.errorText}>{getErr('numberOfShares')}</Text>}
            </View>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Amount of Equity Shares Subscribed *</Text>
              <TextInput style={styles.input} value={formData.amountSubscribed ? String(formData.amountSubscribed) : ''} onChangeText={(val) => updateField({ amountSubscribed: parseInt(val, 10) || 0 })} placeholder="Enter Subscribed Amount" keyboardType="numeric" placeholderTextColor="#94A3B8" />
            </View>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Shareholding Percentage (READ ONLY)</Text>
            <View style={styles.readOnlyBox}>
              <Ionicons name="pie-chart-outline" size={18} color="#083B75" />
              <Text style={styles.readOnlyText}>{shareholdingPct}</Text>
            </View>
          </View>
          <View style={styles.cardActionsRow}>
            <TouchableOpacity style={styles.cancelFormBtn} onPress={onToggleExpand} activeOpacity={0.7}>
              <Text style={styles.cancelFormText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveFormBtn} onPress={() => onSave(formData)} activeOpacity={0.7}>
              <Ionicons name="checkmark-sharp" size={16} color="#FFFFFF" />
              <Text style={styles.saveFormText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
