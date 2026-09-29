import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { styles } from "./ProjectFinanceDatePicker.styles";

interface ProjectFinanceDatePickerProps {
  label?: string;
  value: string;
  onChange: (dateStr: string) => void;
  placeholder?: string;
  required?: boolean;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = MONTHS[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
}

function parseDate(str?: string): Date {
  if (!str) return new Date();
  const clean = str.trim();
  const parts = clean.split(" ");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monthIndex = MONTHS.indexOf(parts[1]);
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && monthIndex !== -1 && !isNaN(year)) {
      return new Date(year, monthIndex, day);
    }
  }
  const parsed = new Date(clean);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export const ProjectFinanceDatePicker: React.FC<
  ProjectFinanceDatePickerProps
> = ({
  label,
  value,
  onChange,
  placeholder = "DD MMM YYYY",
  required = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(() => parseDate(value));

  const handleOpen = () => {
    setTempDate(parseDate(value));
    setShowPicker(true);
  };

  const handleNativeChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (event.type === "set" && selectedDate) {
      if (Platform.OS === "ios") {
        setTempDate(selectedDate);
      } else {
        onChange(formatDate(selectedDate));
      }
    }
  };

  const handleIosDone = () => {
    onChange(formatDate(tempDate));
    setShowPicker(false);
  };

  return (
    <View style={styles.fieldGroup}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.requiredStar}>*</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={styles.dateContainer}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <Text style={value ? styles.dateText : styles.placeholderText}>
          {value || placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={18} color="#64748B" />
      </TouchableOpacity>

      {/* Android DateTimePicker */}
      {Platform.OS === "android" && showPicker && (
        <DateTimePicker
          value={parseDate(value)}
          mode="date"
          display="default"
          onChange={handleNativeChange}
        />
      )}

      {/* iOS Modal DateTimePicker */}
      {Platform.OS === "ios" && (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <Pressable
            style={styles.iosModalOverlay}
            onPress={() => setShowPicker(false)}
          >
            <Pressable style={styles.iosPickerContainer}>
              <View style={styles.iosHeader}>
                <Text style={styles.iosTitle}>{label || "Select Date"}</Text>
                <TouchableOpacity onPress={handleIosDone}>
                  <Text style={styles.iosDoneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleNativeChange}
                textColor="#0F172A"
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

export default ProjectFinanceDatePicker;
