import React from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SecondaryButton } from "@/shared/components/Button/SecondaryButton";
import { styles } from "@/styles/app/(main)/profile.styles";
import type { PersonalFormState } from "./useProfileManager";

interface PersonalDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  colors: any;
  fetchingPersonal: boolean;
  isEditingPersonal: boolean;
  setIsEditingPersonal: (val: boolean) => void;
  savingPersonal: boolean;
  personalDetails: any;
  customer: any;
  personalForm: PersonalFormState;
  personalErrors: Record<string, string>;
  updatePersonalField: (field: keyof PersonalFormState, value: string) => void;
  handleSavePersonal: () => void;
  onCancelEdit: () => void;
}

const EDITABLE_FIELDS: {
  field: keyof PersonalFormState;
  label: string;
  keyboardType: "default" | "email-address";
  autoCapitalize: "none" | "words";
  multiline: boolean;
}[] = [
  {
    field: "name",
    label: "Full Name",
    keyboardType: "default",
    autoCapitalize: "words",
    multiline: false,
  },
  {
    field: "email",
    label: "Email",
    keyboardType: "email-address",
    autoCapitalize: "none",
    multiline: false,
  },
  {
    field: "dob",
    label: "Date of Birth",
    keyboardType: "default",
    autoCapitalize: "words",
    multiline: false,
  },
  {
    field: "address",
    label: "Address",
    keyboardType: "default",
    autoCapitalize: "words",
    multiline: true,
  },
];

export function PersonalDetailsModal({
  visible,
  onClose,
  colors,
  fetchingPersonal,
  isEditingPersonal,
  setIsEditingPersonal,
  savingPersonal,
  personalDetails,
  customer,
  personalForm,
  personalErrors,
  updatePersonalField,
  handleSavePersonal,
  onCancelEdit,
}: PersonalDetailsModalProps) {
  const displayAddress =
    personalDetails?.address ||
    customer?.address ||
    [
      personalDetails?.addressLine1,
      personalDetails?.city,
      personalDetails?.state,
      personalDetails?.pincode,
    ]
      .filter(Boolean)
      .join(", ") ||
    "N/A";

  const readOnlyItems: [string, string][] = [
    ["Full Name", personalDetails?.name || customer?.name || "N/A"],
    ["Mobile", personalDetails?.mobileNumber || customer?.mobile || "N/A"],
    ["Email", personalDetails?.email || customer?.email || "N/A"],
    ["Date of Birth", personalDetails?.dob || customer?.dob || "N/A"],
    [
      "Customer Type",
      personalDetails?.customerType || customer?.customerType || "N/A",
    ],
    ["Address", displayAddress],
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Personal Information
          </Text>

          {fetchingPersonal ? (
            <View style={styles.fetchingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text
                style={[styles.fetchingText, { color: colors.textSecondary }]}
              >
                Fetching personal details...
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
            >
              {isEditingPersonal ? (
                <View style={styles.modalBody}>
                  <Text
                    style={[
                      styles.readOnlyNote,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Mobile number and customer type cannot be changed here.
                  </Text>
                  {EDITABLE_FIELDS.map(
                    ({
                      field,
                      label,
                      keyboardType,
                      autoCapitalize,
                      multiline,
                    }) => (
                      <View key={field} style={styles.editField}>
                        <Text
                          style={[
                            styles.editLabel,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {label}
                        </Text>
                        <TextInput
                          value={personalForm[field]}
                          onChangeText={(text) =>
                            updatePersonalField(field, text)
                          }
                          style={[
                            styles.editInput,
                            {
                              color: colors.text,
                              borderColor: personalErrors[field]
                                ? colors.error
                                : colors.border,
                            },
                          ]}
                          keyboardType={keyboardType}
                          autoCapitalize={autoCapitalize}
                          multiline={multiline}
                        />
                        {personalErrors[field] ? (
                          <Text style={styles.fieldError}>
                            {personalErrors[field]}
                          </Text>
                        ) : null}
                      </View>
                    )
                  )}
                  {personalErrors.form ? (
                    <Text style={styles.formError}>{personalErrors.form}</Text>
                  ) : null}
                  <View style={styles.personalActions}>
                    <TouchableOpacity
                      style={styles.cancelEditButton}
                      onPress={onCancelEdit}
                      disabled={savingPersonal}
                    >
                      <Text
                        style={[
                          styles.cancelEditText,
                          { color: colors.text },
                        ]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.saveEditButton,
                        { backgroundColor: colors.orange },
                      ]}
                      onPress={handleSavePersonal}
                      disabled={savingPersonal}
                    >
                      {savingPersonal ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.saveEditText}>Save</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.modalBody}>
                  {readOnlyItems.map(([label, value]) => (
                    <View key={label} style={styles.infoRow}>
                      <Text
                        style={[
                          styles.infoKey,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {label}
                      </Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>
                        {value}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          )}

          {!isEditingPersonal && (
            <View style={styles.personalActions}>
              <SecondaryButton title="Close" onPress={onClose} />
              <TouchableOpacity
                style={[
                  styles.saveEditButton,
                  { backgroundColor: colors.orange },
                ]}
                onPress={() => setIsEditingPersonal(true)}
              >
                <Ionicons name="pencil" size={16} color="#FFFFFF" />
                <Text style={styles.saveEditText}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
