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
import { SecurityCollateralItem } from "../../types/projectFinance.types";
import { SecurityCollateralItemCard } from "./SecurityCollateralItemCard";
import { styles } from "./SecurityCollateralCard.styles";

interface SecurityCollateralCardProps {
  securities: SecurityCollateralItem[];
  onAddSecurity: () => void;
  onUpdateSecurity: (
    id: string,
    field: keyof SecurityCollateralItem,
    value: any
  ) => void;
  onDeleteSecurity: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const SecurityCollateralCard: React.FC<SecurityCollateralCardProps> = ({
  securities,
  onAddSecurity,
  onUpdateSecurity,
  onDeleteSecurity,
  isExpanded,
  onToggleExpand,
}) => {
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    securityId: string;
    field: keyof SecurityCollateralItem | null;
  }>({
    visible: false,
    title: "",
    options: [],
    securityId: "",
    field: null,
  });

  const openPicker = (
    title: string,
    options: string[],
    securityId: string,
    field: keyof SecurityCollateralItem
  ) => {
    setModalConfig({ visible: true, title, options, securityId, field });
  };

  const handleSelectOption = (value: string) => {
    if (modalConfig.field && modalConfig.securityId) {
      onUpdateSecurity(modalConfig.securityId, modalConfig.field, value);
    }
    setModalConfig({
      visible: false,
      title: "",
      options: [],
      securityId: "",
      field: null,
    });
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onToggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>1. Security / Collateral</Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#64748B"
        />
      </TouchableOpacity>

      {/* Body */}
      {isExpanded && (
        <View style={styles.cardBody}>
          <Text style={styles.subtitle}>
            Provide details of assets to be offered as security for the loan.
          </Text>

          {securities.map((item, index) => (
            <SecurityCollateralItemCard
              key={item.id}
              item={item}
              index={index}
              totalCount={securities.length}
              onUpdate={(field, value) =>
                onUpdateSecurity(item.id, field, value)
              }
              onDelete={() => onDeleteSecurity(item.id)}
              onOpenPicker={(title, options, field) =>
                openPicker(title, options, item.id, field)
              }
            />
          ))}

          {/* + Add Another Security Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddSecurity}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#F97316" />
            <Text style={styles.addButtonText}>Add Another Security</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal Picker */}
      <Modal
        visible={modalConfig.visible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setModalConfig({
            visible: false,
            title: "",
            options: [],
            securityId: "",
            field: null,
          })
        }
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            justifyContent: "flex-end",
          }}
          onPress={() =>
            setModalConfig({
              visible: false,
              title: "",
              options: [],
              securityId: "",
              field: null,
            })
          }
        >
          <Pressable
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: "60%",
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#0F172A",
                marginBottom: 12,
              }}
            >
              {modalConfig.title}
            </Text>
            <FlatList
              data={modalConfig.options}
              keyExtractor={(opt) => opt}
              renderItem={({ item: opt }) => (
                <TouchableOpacity
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F1F5F9",
                  }}
                  onPress={() => handleSelectOption(opt)}
                >
                  <Text style={{ fontSize: 14, color: "#1E293B" }}>{opt}</Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default SecurityCollateralCard;
