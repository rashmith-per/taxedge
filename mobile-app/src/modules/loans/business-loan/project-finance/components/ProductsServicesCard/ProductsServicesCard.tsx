import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ProductItemV2 } from "../../types/step4Types";
import { PRODUCT_CATEGORIES, PRODUCT_UNITS, DOMESTIC_EXPORT_OPTIONS } from "../../data/step4Data";
import { styles } from "./ProductsServicesCard.styles";

interface ProductsServicesCardProps {
  products: ProductItemV2[];
  onAddProduct: () => void;
  onUpdateProduct: (id: string, field: keyof ProductItemV2, value: string) => void;
  onDeleteProduct: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const ProductsServicesCard: React.FC<ProductsServicesCardProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  isExpanded,
  onToggleExpand,
}) => {
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    activeId: string | null;
    field: "category" | "unit" | "domesticExport" | null;
  }>({ visible: false, title: "", options: [], activeId: null, field: null });

  const handleSelectOption = (value: string) => {
    if (modalConfig.activeId && modalConfig.field) {
      onUpdateProduct(modalConfig.activeId, modalConfig.field, value);
    }
    setModalConfig({ visible: false, title: "", options: [], activeId: null, field: null });
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardHeader} onPress={onToggleExpand} activeOpacity={0.7}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name="cube-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>1. Products / Services</Text>
        </View>
        <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.cardBody}>
          <Text style={styles.subtitle}>Enter details of products or services to be manufactured / provided.</Text>
          {products.map((item, index) => (
            <View key={item.id} style={styles.itemBox}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>Product / Service {index + 1}</Text>
                {products.length > 1 && (
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => onDeleteProduct(item.id)}>
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Product / Service Name <Text style={styles.requiredStar}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter product name"
                  placeholderTextColor="#94A3B8"
                  value={item.name}
                  onChangeText={(t) => onUpdateProduct(item.id, "name", t)}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Category <Text style={styles.requiredStar}>*</Text></Text>
                <TouchableOpacity
                  style={styles.pickerContainer}
                  onPress={() => setModalConfig({ visible: true, title: "Select Category", options: PRODUCT_CATEGORIES, activeId: item.id, field: "category" })}
                  activeOpacity={0.7}
                >
                  <Text style={item.category ? styles.pickerText : styles.placeholderText}>{item.category || "Select category"}</Text>
                  <Ionicons name="chevron-down" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Unit <Text style={styles.requiredStar}>*</Text></Text>
                <TouchableOpacity
                  style={styles.pickerContainer}
                  onPress={() => setModalConfig({ visible: true, title: "Select Unit", options: PRODUCT_UNITS, activeId: item.id, field: "unit" })}
                  activeOpacity={0.7}
                >
                  <Text style={item.unit ? styles.pickerText : styles.placeholderText}>{item.unit || "Select unit"}</Text>
                  <Ionicons name="chevron-down" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Installed Capacity <Text style={styles.requiredStar}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter capacity"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={item.installedCapacity}
                    onChangeText={(t) => onUpdateProduct(item.id, "installedCapacity", t)}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Expected Production (Annual) <Text style={styles.requiredStar}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter production"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={item.expectedProductionAnnual}
                    onChangeText={(t) => onUpdateProduct(item.id, "expectedProductionAnnual", t)}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Capacity Utilisation (%) <Text style={styles.requiredStar}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter percentage"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={item.capacityUtilisation}
                    onChangeText={(t) => onUpdateProduct(item.id, "capacityUtilisation", t)}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Selling Price (₹) <Text style={styles.requiredStar}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter price"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={item.sellingPrice}
                    onChangeText={(t) => onUpdateProduct(item.id, "sellingPrice", t)}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Domestic / Export <Text style={styles.requiredStar}>*</Text></Text>
                  <TouchableOpacity
                    style={styles.pickerContainer}
                    onPress={() => setModalConfig({ visible: true, title: "Select Option", options: DOMESTIC_EXPORT_OPTIONS, activeId: item.id, field: "domesticExport" })}
                    activeOpacity={0.7}
                  >
                    <Text style={item.domesticExport ? styles.pickerText : styles.placeholderText}>{item.domesticExport || "Select option"}</Text>
                    <Ionicons name="chevron-down" size={16} color="#64748B" />
                  </TouchableOpacity>
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Product Mix (%) <Text style={styles.requiredStar}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter percentage"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={item.productMix}
                    onChangeText={(t) => onUpdateProduct(item.id, "productMix", t)}
                  />
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={onAddProduct} activeOpacity={0.7}>
            <Ionicons name="add" size={18} color="#EA580C" />
            <Text style={styles.addButtonText}>+ Add Product / Service</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={modalConfig.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalConfig({ visible: false, title: "", options: [], activeId: null, field: null })}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalConfig({ visible: false, title: "", options: [], activeId: null, field: null })}
        >
          <Pressable style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <FlatList
              data={modalConfig.options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectOption(item)}>
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

export default ProductsServicesCard;
