import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { CustomerProfileSummary } from "../../../../types/loans.types";
import { styles } from "./ProjectFinanceCustomerCard.styles";

export interface ProjectFinanceCustomerCardProps {
  profile?: Partial<CustomerProfileSummary>;
}

export const ProjectFinanceCustomerCard: React.FC<ProjectFinanceCustomerCardProps> = ({
  profile,
}) => {
  const maskPan = (pan?: string) => {
    if (!pan || pan.length < 5) return pan || "—";
    return `${pan.slice(0, 2)}XXXX${pan.slice(-2)}`;
  };

  const maskAadhaar = (aadhaar?: string) => {
    if (!aadhaar || aadhaar.length < 8) return aadhaar || "—";
    return `XXXX-XXXX-${aadhaar.slice(-4)}`;
  };

  const name = profile?.name || "Client Name";
  const mobile = profile?.mobile || "Not available";
  const email = profile?.email || "Not available";
  const pan = maskPan(profile?.pan);
  const aadhaar = maskAadhaar(profile?.aadhaar);
  const dob = profile?.dob || "Not provided";
  const address = profile?.address || "Address linked to customer account";

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Ionicons name="person-circle-outline" size={22} color="#0284C7" />
          <Text style={styles.cardTitle}>Lead Sponsor / Promoter Profile</Text>
        </View>
        <View style={styles.verifiedBadge}>
          <Ionicons name="shield-checkmark" size={12} color="#16A34A" />
          <Text style={styles.verifiedText}>Verified Profile</Text>
        </View>
      </View>

      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerText}>
          Sponsor identity and KYC details are verified from your primary profile database.
          Manual re-entry is skipped.
        </Text>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Lead Sponsor Name</Text>
          <Text style={styles.detailValue}>{name}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Mobile</Text>
          <Text style={styles.detailValue}>{mobile}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>{email}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>PAN</Text>
          <Text style={styles.detailValue}>{pan}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Aadhaar</Text>
          <Text style={styles.detailValue}>{aadhaar}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date of Birth</Text>
          <Text style={styles.detailValue}>{dob}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Corporate HQ Address</Text>
          <Text style={styles.detailValue} numberOfLines={2}>
            {address}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ProjectFinanceCustomerCard;
