import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ManpowerForm } from "../../types/step2Types";
import { styles } from "./ManpowerCard.styles";

interface ManpowerCardProps {
  data: ManpowerForm;
  onChange: (field: keyof ManpowerForm, value: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const ManpowerCard: React.FC<ManpowerCardProps> = ({
  data,
  onChange,
  isExpanded,
  onToggleExpand,
}) => {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onToggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name="people-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>12. Manpower</Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#64748B"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.cardBody}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Total Employees <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter number"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.totalEmployees}
              onChangeText={(t) => onChange("totalEmployees", t)}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Skilled</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter number"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={data.skilled}
                onChangeText={(t) => onChange("skilled", t)}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Semi-skilled</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter number"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={data.semiSkilled}
                onChangeText={(t) => onChange("semiSkilled", t)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Unskilled</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter number"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={data.unskilled}
                onChangeText={(t) => onChange("unskilled", t)}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Technical Staff</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter number"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={data.technicalStaff}
                onChangeText={(t) => onChange("technicalStaff", t)}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Administrative Staff</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter number"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={data.administrativeStaff}
              onChangeText={(t) => onChange("administrativeStaff", t)}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default ManpowerCard;
