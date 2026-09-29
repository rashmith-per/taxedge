import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ImplementationMilestoneItem } from "../../types/step2Types";
import { MILESTONE_STATUS_OPTIONS } from "../../data/step2Data";
import { ProjectFinanceDatePicker } from "../ProjectFinanceDatePicker/ProjectFinanceDatePicker";
import { styles } from "./ImplementationMilestonesCard.styles";

interface ImplementationMilestonesCardProps {
  milestones: ImplementationMilestoneItem[];
  onAddMilestone: () => void;
  onUpdateMilestone: (id: string, field: keyof ImplementationMilestoneItem, value: string) => void;
  onDeleteMilestone: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const ImplementationMilestonesCard: React.FC<
  ImplementationMilestonesCardProps
> = ({
  milestones,
  onAddMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
  isExpanded,
  onToggleExpand,
}) => {
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    activeId: string | null;
  }>({
    visible: false,
    activeId: null,
  });

  const handleSelectStatus = (value: string) => {
    if (modalConfig.activeId) {
      onUpdateMilestone(modalConfig.activeId, "status", value);
    }
    setModalConfig({ visible: false, activeId: null });
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onToggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name="flag-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>11. Implementation Milestones</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={(e) => {
              e.stopPropagation();
              onAddMilestone();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+ Add Milestone</Text>
          </TouchableOpacity>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#64748B"
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.cardBody}>
          {milestones.map((item, index) => (
            <View key={item.id} style={styles.itemBox}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>Milestone {index + 1}</Text>
                {milestones.length > 1 && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => onDeleteMilestone(item.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Milestone <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter milestone"
                  placeholderTextColor="#94A3B8"
                  value={item.milestone}
                  onChangeText={(t) => onUpdateMilestone(item.id, "milestone", t)}
                />
              </View>

              <View style={styles.row}>
                <View style={styles.col}>
                  <ProjectFinanceDatePicker
                    label="Planned Date *"
                    value={item.plannedDate}
                    onChange={(val) => onUpdateMilestone(item.id, "plannedDate", val)}
                    placeholder="DD MMM YYYY"
                  />
                </View>
                <View style={styles.col}>
                  <ProjectFinanceDatePicker
                    label="Actual Date"
                    value={item.actualDate}
                    onChange={(val) => onUpdateMilestone(item.id, "actualDate", val)}
                    placeholder="DD MMM YYYY"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Status <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.pickerContainer}
                  onPress={() => setModalConfig({ visible: true, activeId: item.id })}
                  activeOpacity={0.7}
                >
                  <Text style={item.status ? styles.pickerText : styles.placeholderText}>
                    {item.status || "Select status"}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <Modal
        visible={modalConfig.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalConfig({ visible: false, activeId: null })}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalConfig({ visible: false, activeId: null })}
        >
          <Pressable style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Status</Text>
            <FlatList
              data={MILESTONE_STATUS_OPTIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectStatus(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ImplementationMilestonesCard;
