import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "../screens/GstAmendmentScreen/GstAmendmentScreen.styles";
import { CORE_AMENDMENT_SECTIONS } from "../config/gstCoreAmendmentConfig";
import { NON_CORE_AMENDMENT_SECTIONS } from "../config/gstNonCoreAmendmentConfig";

interface GstAmendmentLandingProps {
  gstin: string;
  onGstinChange: (text: string) => void;
  errorGstin?: string;
  onSelectSection: (sectionId: string) => void;
  onBack: () => void;
  scrollViewRef: React.RefObject<ScrollView | null>;
  insets: { top: number; bottom: number };
}

export const GstAmendmentLanding: React.FC<GstAmendmentLandingProps> = ({
  gstin,
  onGstinChange,
  errorGstin,
  onSelectSection,
  onBack,
  scrollViewRef,
  insets,
}) => {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.roundBackButton}
        >
          <Ionicons name="chevron-back" size={22} color={BrandColors.PRIMARY_BLUE} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerMainTitle}>GST Amendment</Text>
          <Text style={styles.headerSubtitle}>Select what you want to change</Text>
        </View>
        <View style={styles.placeholderBox} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 30 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info Banner */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconBox}>
            <Ionicons name="information-circle" size={20} color={BrandColors.PRIMARY_BLUE} />
          </View>
          <Text style={styles.infoText}>
            Amendments reuse your GST Registration fields, validation and upload flow - nothing new to learn.
          </Text>
        </View>

        {/* GSTIN Field with character counter */}
        <View style={styles.gstinBlock}>
          <Text style={styles.gstinLabel}>
            GSTIN / Business ID <Text style={styles.star}>*</Text>
          </Text>
          <TextInput
            style={[styles.gstinInput, Boolean(errorGstin) && styles.gstinInputError]}
            placeholder="e.g. 29AAAAA0000A1Z5 or GST ID"
            placeholderTextColor="#94A3B8"
            value={gstin}
            onChangeText={onGstinChange}
            autoCapitalize="characters"
            maxLength={18}
          />
          <View style={styles.gstinCounterRow}>
            {errorGstin ? (
              <Text style={styles.errorText}>{errorGstin}</Text>
            ) : (
              <View />
            )}
            <Text style={styles.charCountText}>{gstin.length} chars</Text>
          </View>
        </View>

        {/* Core Amendments Group */}
        <Text style={styles.sectionHeading}>Core amendments</Text>
        <View style={styles.cardGroup}>
          {CORE_AMENDMENT_SECTIONS.map((sec) => (
            <TouchableOpacity
              key={sec.id}
              activeOpacity={0.8}
              style={styles.amendmentCard}
              onPress={() => onSelectSection(sec.id)}
            >
              <View style={[styles.cardIconBox, { backgroundColor: sec.iconBg }]}>
                <Ionicons name={sec.icon} size={22} color={sec.iconColor} />
              </View>
              <View style={styles.cardContentCol}>
                <Text style={styles.cardTitle}>{sec.title}</Text>
                <Text style={styles.cardSubtitle}>{sec.typeLabel}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" style={styles.cardChevron} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Non-Core Amendments Group */}
        <Text style={styles.sectionHeading}>Non-core amendments</Text>
        <View style={styles.cardGroup}>
          {NON_CORE_AMENDMENT_SECTIONS.map((sec) => (
            <TouchableOpacity
              key={sec.id}
              activeOpacity={0.8}
              style={styles.amendmentCard}
              onPress={() => onSelectSection(sec.id)}
            >
              <View style={[styles.cardIconBox, { backgroundColor: sec.iconBg }]}>
                <Ionicons name={sec.icon} size={22} color={sec.iconColor} />
              </View>
              <View style={styles.cardContentCol}>
                <Text style={styles.cardTitle}>{sec.title}</Text>
                <Text style={styles.cardSubtitle}>{sec.typeLabel}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" style={styles.cardChevron} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
