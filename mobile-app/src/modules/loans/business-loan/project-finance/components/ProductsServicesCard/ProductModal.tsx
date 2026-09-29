import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { ProductServiceItem } from "../../types/projectFinance.types";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_UNITS,
  DOMESTIC_EXPORT_OPTIONS,
} from "../../data/projectFinanceData";
import { styles } from "./ProductModal.styles";

interface ProductModalProps {
  visible: boolean;
  initialData?: ProductServiceItem | null;
  onSave: (product: ProductServiceItem) => void;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  visible,
  initialData,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(initialData?.name ?? "");
  const category = initialData?.category ?? PRODUCT_CATEGORIES[0];
  const unit = initialData?.unit ?? PRODUCT_UNITS[0];
  const [installedCapacity, setInstalledCapacity] = useState(
    initialData?.installedCapacity ?? ""
  );
  const expectedProduction = initialData?.expectedProduction ?? "";
  const capacityUtilisation = initialData?.capacityUtilisation ?? "";
  const [sellingPrice, setSellingPrice] = useState(initialData?.sellingPrice ?? "");
  const domesticExport = initialData?.domesticExport ?? DOMESTIC_EXPORT_OPTIONS[0];
  const [productMix, setProductMix] = useState(initialData?.productMix ?? "");

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: initialData ? initialData.id : Date.now().toString(),
      name: name.trim(),
      category,
      unit,
      installedCapacity: installedCapacity || "50 MW",
      expectedProduction: expectedProduction || "45 MW",
      capacityUtilisation: capacityUtilisation || "90%",
      sellingPrice: sellingPrice || "25000",
      domesticExport,
      productMix: productMix || "100%",
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.modalTitle}>
            {initialData ? "Edit Product / Service" : "Add Product / Service"}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Product / Service Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Solar Panels"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Installed Capacity *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 50 MW"
                placeholderTextColor="#94A3B8"
                value={installedCapacity}
                onChangeText={setInstalledCapacity}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Selling Price (₹) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 25000"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={sellingPrice}
                onChangeText={setSellingPrice}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Product Mix (%) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 70%"
                placeholderTextColor="#94A3B8"
                value={productMix}
                onChangeText={setProductMix}
              />
            </View>
          </ScrollView>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ProductModal;
