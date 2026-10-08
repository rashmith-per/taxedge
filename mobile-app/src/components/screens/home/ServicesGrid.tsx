/**
 * ServicesGrid
 * The 4×2 grid of service tiles shown in the "Services" section of the
 * Home screen (Incorporation, GST, ITR, Projects, Loans, Insurance,
 * Business, More Services).
 */

import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import {
  styles,
  getServiceCardThemedStyle,
  getServiceLabelThemedStyle,
} from "@/styles/app/(main)/home.styles";
import type { DashboardServiceTile } from "@/modules/dashboard/types/dashboard.types";

interface ServicesGridProps {
  services: DashboardServiceTile[];
  isDark: boolean;
  colors: ReturnType<typeof useTheme>;
  onPress: (tile: DashboardServiceTile) => void;
}

export function ServicesGrid({
  services,
  isDark,
  colors,
  onPress,
}: ServicesGridProps) {
  return (
    <View style={styles.servicesGrid}>
      {services.map((service) => (
        <TouchableOpacity
          key={service.id}
          activeOpacity={0.75}
          onPress={() => onPress(service)}
          style={[
            styles.serviceCard,
            getServiceCardThemedStyle(isDark, colors),
          ]}
        >
          <Image
            source={service.image}
            style={styles.serviceIconImage}
            resizeMode="contain"
          />
          <Text
            style={[
              styles.serviceCardLabel,
              getServiceLabelThemedStyle(isDark, colors),
            ]}
            numberOfLines={2}
          >
            {service.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
