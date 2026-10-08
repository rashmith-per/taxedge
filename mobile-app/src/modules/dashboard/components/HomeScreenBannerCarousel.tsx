import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "../styles/home.styles";
import { APPLY_BANNERS } from "../constants/home-screen.constants";
import type { ServiceCategoryId } from "../../../shared/types/domain";

interface HomeScreenBannerCarouselProps {
  bannerRef: React.RefObject<ScrollView | null>;
  onBannerScroll: (e: any) => void;
  handleExploreCategory: (categoryId: ServiceCategoryId) => void;
  bannerPage: number;
  colors: any;
}

export function HomeScreenBannerCarousel({
  bannerRef,
  onBannerScroll,
  handleExploreCategory,
  bannerPage,
  colors,
}: HomeScreenBannerCarouselProps) {
  return (
    <View>
      <ScrollView
        ref={bannerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onBannerScroll}
        scrollEventThrottle={16}
      >
        {APPLY_BANNERS.map((banner) => (
          <View key={banner.key} style={styles.bannerPage}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleExploreCategory(banner.id)}
              style={[styles.loansBanner, { backgroundColor: banner.bg }]}
            >
              <View style={styles.bannerLeft}>
                <Text style={styles.bannerTitle} numberOfLines={1}>
                  {banner.title}
                </Text>
                <Text style={styles.bannerDesc} numberOfLines={2}>
                  {banner.desc}
                </Text>
                <View
                  style={[
                    styles.exploreButton,
                    { backgroundColor: colors.orange },
                  ]}
                >
                  <Text style={styles.exploreText}>{banner.cta}</Text>
                  <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.dotGrid} pointerEvents="none">
                {Array.from({ length: 20 }).map((_, i) => (
                  <View key={i} style={styles.decorDot} />
                ))}
              </View>

              <View style={styles.bannerRight}>
                <View style={styles.bannerIconCircle}>
                  <Ionicons
                    name={banner.icon}
                    size={44}
                    color={colors.orange}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {APPLY_BANNERS.map((b, i) => (
          <View
            key={b.key}
            style={[
              styles.pageDot,
              {
                backgroundColor:
                  i === bannerPage ? colors.primary : colors.border,
                width: i === bannerPage ? 18 : 7,
                height: 7,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}
