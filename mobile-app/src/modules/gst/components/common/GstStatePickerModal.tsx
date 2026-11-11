import React, { memo, useState, useMemo, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { INDIAN_STATES_AND_UTS } from "@/components/screens/create-profile/types";
import { styles } from "./GstStatePickerModal.styles";

import { KeyboardAvoidingOverlay } from "@/shared/components/KeyboardAwareFormLayout";
export interface GstStatePickerModalProps {
  visible: boolean;
  selectedState?: string;
  onSelect: (state: string) => void;
  onClose: () => void;
  title?: string;
}

export const GstStatePickerModal: React.FC<GstStatePickerModalProps> = memo(({
  visible,
  selectedState = "",
  onSelect,
  onClose,
  title = "Select State / UT",
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleClose = useCallback(() => {
    setSearchQuery("");
    onClose();
  }, [onClose]);

  const handleSelect = useCallback((item: string) => {
    setSearchQuery("");
    onSelect(item);
  }, [onSelect]);

  const filteredStates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return INDIAN_STATES_AND_UTS;
    return INDIAN_STATES_AND_UTS.filter((s) =>
      s.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingOverlay>
      <View style={styles.modalOverlay}>
        <View style={styles.stateModalContent}>
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Close state picker"
            >
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={BrandColors.TEXT_MUTED} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search State / UT"
              placeholderTextColor={BrandColors.TEXT_MUTED}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Clear search text"
              >
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* State List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={styles.stateList}
          >
            {filteredStates.map((s) => {
              const isSelected = selectedState.toLowerCase() === s.toLowerCase();
              return (
                <TouchableOpacity
                  key={s}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(s)}
                  style={[styles.stateItem, isSelected && styles.stateItemSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.stateItemText,
                      isSelected && styles.stateItemTextSelected,
                    ]}
                  >
                    {s}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={BrandColors.PRIMARY_ORANGE}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
          </KeyboardAvoidingOverlay>
    </Modal>
  );
});

GstStatePickerModal.displayName = "GstStatePickerModal";
export default GstStatePickerModal;
