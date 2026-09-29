import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PromoterSponsorItem } from "../../types/projectFinance.types";
import { PromoterModal } from "./PromoterModal";
import { styles } from "./PromotersCard.styles";

interface PromotersCardProps {
  promoters: PromoterSponsorItem[];
  onAddPromoter: (promoter: PromoterSponsorItem) => void;
  onUpdatePromoter: (promoter: PromoterSponsorItem) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const PromotersCard: React.FC<PromotersCardProps> = ({
  promoters,
  onAddPromoter,
  onUpdatePromoter,
  isExpanded,
  onToggleExpand,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPromoter, setEditingPromoter] = useState<PromoterSponsorItem | null>(null);

  const handleOpenAdd = () => {
    setEditingPromoter(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (item: PromoterSponsorItem) => {
    setEditingPromoter(item);
    setModalVisible(true);
  };

  const handleSaveModal = (promoter: PromoterSponsorItem) => {
    if (editingPromoter) {
      onUpdatePromoter(promoter);
    } else {
      onAddPromoter(promoter);
    }
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
            <Ionicons name="people-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>Promoters / Sponsors</Text>
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
            Add the promoters / sponsors involved in this project.
          </Text>

          {/* Add Button */}
          <TouchableOpacity style={styles.addButton} onPress={handleOpenAdd}>
            <Ionicons name="add" size={18} color="#F97316" />
            <Text style={styles.addButtonText}>Add Promoter / Sponsor</Text>
          </TouchableOpacity>

          {/* Promoters List */}
          {promoters.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.promoterItem}
              onPress={() => handleOpenEdit(item)}
              activeOpacity={0.7}
            >
              <View style={styles.promoterLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.initials}</Text>
                </View>
                <View>
                  <Text style={styles.promoterName}>{item.name}</Text>
                  <Text style={styles.promoterType}>{item.type}</Text>
                </View>
              </View>

              <View style={styles.promoterRight}>
                <Text style={styles.shareText}>{item.sharePercentage}%</Text>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Modal */}
      <PromoterModal
        key={editingPromoter?.id ?? "new-promoter"}
        visible={modalVisible}
        initialData={editingPromoter}
        onSave={handleSaveModal}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default PromotersCard;
