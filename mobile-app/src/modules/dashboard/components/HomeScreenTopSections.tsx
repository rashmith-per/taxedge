import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import type { EdgeInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "../styles/home.styles";
import type { ServiceTile } from "../types/dashboard.types";
import { HOME_TILES } from "../constants/home-screen.constants";

interface HeroHeaderProps {
  insets: EdgeInsets;
  colors: any;
  unreadCount: number;
  greetingText: string;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
}

export function HeroHeader({
  insets,
  colors,
  unreadCount,
  greetingText,
  onOpenProfile,
  onOpenNotifications,
}: HeroHeaderProps) {
  return (
    <View
      style={[
        styles.heroHeader,
        {
          backgroundColor: colors.primaryDark,
          paddingTop: insets.top + 8,
        },
      ]}
    >
      <View style={styles.topHeaderRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onOpenProfile}
          style={styles.menuBtn}
          hitSlop={8}
        >
          <Ionicons name="menu" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.brandContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpenProfile}
            style={styles.logoBox}
            hitSlop={8}
          >
            <Image
              source={require("../../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.brandText}>TAXEDGE</Text>
            <Text style={styles.brandSubText}>FIN SOLUTIONS</Text>
          </View>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity
            onPress={onOpenNotifications}
            style={styles.iconBtn}
            hitSlop={6}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color="#FFFFFF"
            />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.orange }]}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.greetingRow}>
        <View style={styles.greetingContainer}>
          <Text style={styles.welcomeText}>{greetingText}</Text>
          <Text style={styles.welcomeSubText}>
            What can we help you with today?
          </Text>
        </View>
      </View>
    </View>
  );
}

interface QuickServicesProps {
  colors: any;
  isDark: boolean;
  openTile: (tile: ServiceTile) => void;
  onOpenAllServices: () => void;
}

export function QuickServicesSection({
  colors,
  isDark,
  openTile,
  onOpenAllServices,
}: QuickServicesProps) {
  const tileBg = (item: { tintBg: string }) =>
    isDark ? colors.backgroundSelected : item.tintBg;
  const tileFg = (item: { tint: string }) => (isDark ? colors.text : item.tint);

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Services
        </Text>
        <TouchableOpacity
          onPress={onOpenAllServices}
          hitSlop={8}
          style={styles.linkRow}
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>
            All Services
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.backgroundElement,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.quickRow}>
          {HOME_TILES.map((tile) => (
            <TouchableOpacity
              key={tile.id}
              activeOpacity={0.75}
              onPress={() => openTile(tile)}
              style={styles.quickTile}
            >
              <View
                style={[
                  styles.circleIcon,
                  { backgroundColor: tileBg(tile) },
                ]}
              >
                <Ionicons name={tile.icon} size={24} color={tileFg(tile)} />
              </View>
              <Text
                style={[styles.circleLabel, { color: colors.text }]}
                numberOfLines={2}
              >
                {tile.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );
}
