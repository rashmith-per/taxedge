import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ProjectionSetupForm } from "../../types/step4Types";
import {
  PROJECTION_PERIOD_OPTIONS,
  HISTORICAL_YEARS_OPTIONS,
  PROJECTED_YEARS_OPTIONS,
  STABILISATION_YEAR_OPTIONS,
} from "../../data/step4Data";
import { ProjectFinanceDatePicker } from "../ProjectFinanceDatePicker/ProjectFinanceDatePicker";
import { styles } from "./ProjectionSetupCard.styles";

export interface ProjectionSetupCardProps {
  data: ProjectionSetupForm;
  onChange: (field: keyof ProjectionSetupForm, value: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const ProjectionSetupCard: React.FC<ProjectionSetupCardProps> = ({
  data,
  onChange,
  isExpanded: externalExpanded,
  onToggleExpand: externalToggle,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const isExpanded = externalExpanded !== undefined ? externalExpanded : internalExpanded;
  const onToggleExpand = externalToggle || (() => setInternalExpanded((p) => !p));
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    field: keyof ProjectionSetupForm | null;
  }>({
    visible: false,
    title: "",
    options: [],
    field: null,
  });

  const handleSelectOption = (value: string) => {
    if (modalConfig.field) {
      onChange(modalConfig.field, value);
    }
    setModalConfig({ visible: false, title: "", options: [], field: null });
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
            <Ionicons name="settings-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>4. Projection Setup</Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#64748B"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.cardBody}>
          <Text style={styles.subtitle}>
            Set the period and key assumptions for financial projections.
          </Text>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>
                Projection Period (Years) <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.pickerContainer}
                onPress={() =>
                  setModalConfig({
                    visible: true,
                    title: "Select Projection Period",
                    options: PROJECTION_PERIOD_OPTIONS,
                    field: "projectionPeriodYears",
                  })
                }
                activeOpacity={0.7}
              >
                <Text style={data.projectionPeriodYears ? styles.pickerText : styles.placeholderText}>
                  {data.projectionPeriodYears || "Select years"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>
                Historical Years <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.pickerContainer}
                onPress={() =>
                  setModalConfig({
                    visible: true,
                    title: "Select Historical Years",
                    options: HISTORICAL_YEARS_OPTIONS,
                    field: "historicalYears",
                  })
                }
                activeOpacity={0.7}
              >
                <Text style={data.historicalYears ? styles.pickerText : styles.placeholderText}>
                  {data.historicalYears || "Select years"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Projected Years <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                setModalConfig({
                  visible: true,
                  title: "Select Projected Years",
                  options: PROJECTED_YEARS_OPTIONS,
                  field: "projectedYears",
                })
              }
              activeOpacity={0.7}
            >
              <Text style={data.projectedYears ? styles.pickerText : styles.placeholderText}>
                {data.projectedYears || "Select years"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.fieldGroup}>
            <ProjectFinanceDatePicker
              label="Commercial Operation Date *"
              value={data.commercialOperationDate}
              onChange={(val) => onChange("commercialOperationDate", val)}
              placeholder="DD MMM YYYY"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Stabilisation Year</Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() =>
                setModalConfig({
                  visible: true,
                  title: "Select Stabilisation Year",
                  options: STABILISATION_YEAR_OPTIONS,
                  field: "stabilisationYear",
                })
              }
              activeOpacity={0.7}
            >
              <Text style={data.stabilisationYear ? styles.pickerText : styles.placeholderText}>
                {data.stabilisationYear || "Select year"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal
        visible={modalConfig.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalConfig({ visible: false, title: "", options: [], field: null })}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalConfig({ visible: false, title: "", options: [], field: null })}
        >
          <Pressable style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <FlatList
              data={modalConfig.options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectOption(item)}
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

export default ProjectionSetupCard;
