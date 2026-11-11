import React from "react";
import { View, Text, TouchableOpacity, Keyboard } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "./GstBusinessStep.styles";

interface SectionCardProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = React.memo(({ iconName, title, subtitle, children }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconBox}>
        <Ionicons name={iconName} size={18} color={BrandColors.PRIMARY_ORANGE} />
      </View>
      <View style={styles.sectionTitleWrap}>
        <Text style={styles.sectionMainTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
    </View>
    {children}
  </View>
));
SectionCard.displayName = "SectionCard";

interface AccordionSectionProps {
  title: string;
  subtitle?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  isExpanded: boolean;
  onToggle: () => void;
  errorCount?: number;
  children: React.ReactNode;
}

export const AccordionSection: React.FC<AccordionSectionProps> = React.memo(
  ({ title, subtitle, iconName, isExpanded, onToggle, errorCount = 0, children }) => (
    <View style={[styles.accordionCard, isExpanded && styles.accordionCardExpanded]}>
      <TouchableOpacity
        style={styles.accordionCardHeader}
        activeOpacity={0.7}
        onPress={() => {
          Keyboard.dismiss();
          onToggle();
        }}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${isExpanded ? "expanded" : "collapsed"}${errorCount > 0 ? `, ${errorCount} error${errorCount > 1 ? "s" : ""}` : ""}`}
        accessibilityState={{ expanded: isExpanded }}
      >
        <View style={styles.sectionHeaderWrap}>
          <View style={styles.sectionIconBox}>
            <Ionicons name={iconName} size={18} color={BrandColors.PRIMARY_ORANGE} />
          </View>
          <View style={styles.sectionTitleWrap}>
            <View style={styles.labelRow}>
              <Text style={styles.sectionMainTitle}>{title}</Text>
              {!isExpanded && errorCount > 0 && (
                <View style={styles.accordionErrorBadge}>
                  <Text style={styles.accordionErrorText}>
                    {errorCount} {errorCount === 1 ? "error" : "errors"}
                  </Text>
                </View>
              )}
            </View>
            {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        <View style={styles.accordionChevronBox}>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#64748B"
          />
        </View>
      </TouchableOpacity>
      {isExpanded && <View style={styles.accordionCardContent}>{children}</View>}
    </View>
  )
);
AccordionSection.displayName = "AccordionSection";
