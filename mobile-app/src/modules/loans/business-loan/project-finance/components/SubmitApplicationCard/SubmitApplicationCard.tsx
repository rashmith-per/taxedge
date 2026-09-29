import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./SubmitApplicationCard.styles";

export const SubmitApplicationCard: React.FC = () => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name="paper-plane-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>4. Submit Application</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        <Text style={styles.subtitle}>
          Click submit to proceed with your project finance application.
        </Text>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color="#2563EB" />
          <Text style={styles.infoText}>
            Our project finance credit team will review your application and
            reach out within 24–48 hours for appraisal and site evaluation.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default SubmitApplicationCard;
