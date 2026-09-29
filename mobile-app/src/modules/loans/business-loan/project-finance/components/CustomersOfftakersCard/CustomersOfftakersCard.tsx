import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { CustomerItemV2 } from "../../types/step4Types";
import { CUSTOMER_TYPES, PRODUCT_UNITS, AGREEMENT_STATUS_OPTIONS } from "../../data/step4Data";
import { styles } from "./CustomersOfftakersCard.styles";

interface CustomersOfftakersCardProps {
  customers: CustomerItemV2[];
  onAddCustomer: () => void;
  onUpdateCustomer: (id: string, field: keyof CustomerItemV2, value: any) => void;
  onDeleteCustomer: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const CustomersOfftakersCard: React.FC<CustomersOfftakersCardProps> = ({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  isExpanded,
  onToggleExpand,
}) => {
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    activeId: string | null;
    field: "customerType" | "unit" | "agreementStatus" | null;
  }>({ visible: false, title: "", options: [], activeId: null, field: null });

  const handleSelectOption = (value: string) => {
    if (modalConfig.activeId && modalConfig.field) {
      onUpdateCustomer(modalConfig.activeId, modalConfig.field, value);
    }
    setModalConfig({ visible: false, title: "", options: [], activeId: null, field: null });
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardHeader} onPress={onToggleExpand} activeOpacity={0.7}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name="people-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>3. Customers / Offtakers</Text>
        </View>
        <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.cardBody}>
          <Text style={styles.subtitle}>Add key customers or off-takers for your product / service.</Text>

          {customers.map((item, index) => (
            <View key={item.id} style={styles.itemBox}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>Customer {index + 1}</Text>
                {customers.length > 1 && (
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => onDeleteCustomer(item.id)}>
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Customer / Offtaker Name <Text style={styles.requiredStar}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter customer name"
                  placeholderTextColor="#94A3B8"
                  value={item.customerName}
                  onChangeText={(t) => onUpdateCustomer(item.id, "customerName", t)}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Customer Type <Text style={styles.requiredStar}>*</Text></Text>
                <TouchableOpacity
                  style={styles.pickerContainer}
                  onPress={() => setModalConfig({ visible: true, title: "Select Customer Type", options: CUSTOMER_TYPES, activeId: item.id, field: "customerType" })}
                  activeOpacity={0.7}
                >
                  <Text style={item.customerType ? styles.pickerText : styles.placeholderText}>{item.customerType || "Select customer type"}</Text>
                  <Ionicons name="chevron-down" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Expected Purchase Quantity <Text style={styles.requiredStar}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter quantity"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={item.expectedPurchaseQty}
                    onChangeText={(t) => onUpdateCustomer(item.id, "expectedPurchaseQty", t)}
                  />
                </View>
                <View style={styles.col}>
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
              </View>

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Expected Revenue (₹) <Text style={styles.requiredStar}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter amount"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={item.expectedRevenue}
                    onChangeText={(t) => onUpdateCustomer(item.id, "expectedRevenue", t)}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Contract Available? <Text style={styles.requiredStar}>*</Text></Text>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity style={styles.radioOption} onPress={() => onUpdateCustomer(item.id, "contractAvailable", true)} activeOpacity={0.7}>
                      <View style={[styles.radioCircle, item.contractAvailable && styles.radioCircleSelected]}>
                        {item.contractAvailable && <View style={styles.radioInner} />}
                      </View>
                      <Text style={styles.radioText}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.radioOption} onPress={() => onUpdateCustomer(item.id, "contractAvailable", false)} activeOpacity={0.7}>
                      <View style={[styles.radioCircle, !item.contractAvailable && styles.radioCircleSelected]}>
                        {!item.contractAvailable && <View style={styles.radioInner} />}
                      </View>
                      <Text style={styles.radioText}>No</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Contract Period (Years)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter years"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={item.contractPeriodYears}
                    onChangeText={(t) => onUpdateCustomer(item.id, "contractPeriodYears", t)}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Contracted Price (₹)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter price"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={item.contractedPrice}
                    onChangeText={(t) => onUpdateCustomer(item.id, "contractedPrice", t)}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Minimum Offtake</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter quantity"
                    placeholderTextColor="#94A3B8"
                    value={item.minimumOfftake}
                    onChangeText={(t) => onUpdateCustomer(item.id, "minimumOfftake", t)}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Agreement Status</Text>
                  <TouchableOpacity
                    style={styles.pickerContainer}
                    onPress={() => setModalConfig({ visible: true, title: "Select Status", options: AGREEMENT_STATUS_OPTIONS, activeId: item.id, field: "agreementStatus" })}
                    activeOpacity={0.7}
                  >
                    <Text style={item.agreementStatus ? styles.pickerText : styles.placeholderText}>{item.agreementStatus || "Select status"}</Text>
                    <Ionicons name="chevron-down" size={16} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={onAddCustomer} activeOpacity={0.7}>
            <Ionicons name="add" size={18} color="#EA580C" />
            <Text style={styles.addButtonText}>+ Add Customer / Offtaker</Text>
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

export default CustomersOfftakersCard;
