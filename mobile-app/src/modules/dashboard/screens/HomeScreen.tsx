import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  Pressable,
  StatusBar,
  TextInput,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../../hooks/use-theme";
import { useColorScheme } from "../../../hooks/use-color-scheme";
import { useAuthStore } from "../../authentication/store/authStore";
import { useApplicationStore } from "../../../store/applicationStore";
import { useNotificationStore } from "../../../store/notificationStore";
import { SERVICE_CATALOGUE } from "../../../data/catalogue";
import { SCREEN_BOTTOM_PADDING } from "../../../shared/components/ScreenLayout/ScreenLayout";
import { Maybe } from "../../../shared/utils/functional";
import { useServiceAccessGuard } from "../../../shared/hooks";
import { Spacing } from "../../../shared/constants/theme";
import { styles } from "../styles/home.styles";
import type {
  CatalogueItem,
  IconName,
  ServiceCategoryId,
} from "../../../shared/types/domain";
import type { ServiceTile, Deadline, StatTile, ApplyBanner } from "../types/dashboard.types";

const { width } = Dimensions.get("window");
const H_PADDING = Spacing.three;
const CARD_WIDTH = width - H_PADDING * 2;

const SERVICE_TILES: ServiceTile[] = [
  { id: "gst", label: "GST", icon: "document-text", tint: "#2563EB", tintBg: "#EAF1FE", route: "/service/gst" },
  { id: "itr", label: "ITR", icon: "reader", tint: "#0F766E", tintBg: "#E6F5F2", route: "/service/itr" },
  { id: "tds", label: "TDS", icon: "calculator", tint: "#6D28D9", tintBg: "#F1ECFE", route: "/service/tds-refund" },
  { id: "loans", label: "Loans", icon: "business", tint: "#EA580C", tintBg: "#FEF0E6", route: "/service/loans" },
  { id: "insurance", label: "Insurance", icon: "shield-checkmark", tint: "#DC2626", tintBg: "#FDEBEB", route: "/service/health-insurance" },
];

const MORE_TILE: ServiceTile = {
  id: "more",
  label: "More Services",
  icon: "grid",
  tint: "#083B75",
  tintBg: "#E7EDF5",
  isMore: true,
};

const HOME_TILES: ServiceTile[] = [
  SERVICE_TILES[0],
  SERVICE_TILES[1],
  SERVICE_TILES[3],
  { ...MORE_TILE, label: "More\nServices" },
];

const BANNER_NAVY = "#083B75";
const BANNER_NAVY_DEEP = "#052750";

const APPLY_BANNERS: ApplyBanner[] = (
  [
    { key: "b-gst", id: "GST", title: "GST", desc: "Registration, filing & compliance", cta: "Apply Now", icon: "receipt" },
    { key: "b-itr", id: "ITR", title: "ITR & TDS", desc: "File returns, claim your refund", cta: "File Now", icon: "calculator" },
    { key: "b-loans", id: "LOANS", title: "LOANS", desc: "Explore our loan solutions", cta: "Explore", icon: "wallet" },
    { key: "b-ins", id: "INSURANCE", title: "INSURANCE", desc: "Health & life cover plans", cta: "Get Quote", icon: "shield-checkmark" },
    { key: "b-company", id: "BUSINESS", title: "COMPANY SETUP", desc: "Incorporation & registrations", cta: "Start Now", icon: "business" },
    { key: "b-acct", id: "BUSINESS", title: "ACCOUNTING", desc: "Bookkeeping & monthly reports", cta: "Know More", icon: "stats-chart" },
  ] as const
).map((banner, i) => ({
  ...banner,
  bg: i % 2 === 0 ? BANNER_NAVY : BANNER_NAVY_DEEP,
}));

export function HomeScreen() {
  const colors = useTheme();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { accessService } = useServiceAccessGuard();

  const [bannerPage, setBannerPage] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [moreQuery, setMoreQuery] = useState("");
  const bannerRef = useRef<ScrollView>(null);
  const bannerPageRef = useRef(0);

  const customer = useAuthStore((state) => state.customer);
  const applications = useApplicationStore((state) => state.applications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  const rawCustomerName = Maybe.of(customer)
    .map((c) => c.name?.trim())
    .getOrElse("");

  const isDefaultOrEmpty =
    !rawCustomerName ||
    rawCustomerName.toLowerCase() === "valued" ||
    rawCustomerName.toLowerCase() === "valued client" ||
    rawCustomerName.toLowerCase() === "client" ||
    rawCustomerName.toLowerCase() === "priya";

  const hasRealName = !isDefaultOrEmpty;
  const firstName = hasRealName ? rawCustomerName.split(" ")[0] : "";
  const greetingText = hasRealName ? `Hello, ${firstName} 👋` : "Welcome to TaxEdge 👋";

  const activeCount = applications.filter((app) => app.status !== "Completed").length;
  const pendingDocsCount = applications.reduce(
    (sum, app) => sum + app.documents.filter((d) => d.status === "Pending").length,
    0
  );
  const completedCount = applications.filter((app) => app.status === "Completed").length;
  const paymentDue = applications
    .filter((app) => app.paymentStatus === "Pending")
    .reduce((sum, app) => sum + app.paymentAmount, 0);

  const recentApps = applications.slice(0, 3);

  const STATS: StatTile[] = [
    { id: "active", label: "Active\nApplications", value: `${activeCount}`, tint: "#059669", tintBg: "#E6F5F0", icon: "folder", route: "/(main)/applications" },
    { id: "docs", label: "Pending\nDocuments", value: `${pendingDocsCount}`, tint: "#EA580C", tintBg: "#FEF0E6", icon: "document-attach", route: "/(main)/applications" },
    { id: "due", label: "Payment Due", value: `₹${paymentDue.toLocaleString("en-IN")}`, tint: "#DC2626", tintBg: "#FDEBEB", icon: "card", route: "/(main)/payments" },
    { id: "done", label: "Completed\nServices", value: `${completedCount}`, tint: "#2563EB", tintBg: "#EAF1FE", icon: "checkbox", route: "/(main)/applications" },
  ];

  const UPCOMING_DEADLINES: Deadline[] = [];


  const statusTone = (status: string) => {
    if (status === "Completed") return { fg: "#047857", bg: "#E6F5F0" };
    if (status === "Rejected") return { fg: "#B91C1C", bg: "#FDEBEB" };
    if (status === "Verification") return { fg: "#6D28D9", bg: "#F1ECFE" };
    return { fg: "#1D4ED8", bg: "#EAF1FE" };
  };

  const tileBg = (item: { tintBg: string }) =>
    isDark ? colors.backgroundSelected : item.tintBg;
  const tileFg = (item: { tint: string }) => (isDark ? colors.text : item.tint);

  const handleExploreCategory = (categoryId: ServiceCategoryId) => {
    router.push({ pathname: "/services", params: { selectedCategory: categoryId } });
  };

  const openCatalogueItem = (
    item: CatalogueItem,
    categoryId: ServiceCategoryId
  ) => {
    setMoreOpen(false);
    if (item.serviceId) {
      accessService(`/service/${item.serviceId}`);
    } else {
      router.push({ pathname: "/services", params: { selectedCategory: categoryId } });
    }
  };

  const openTile = (tile: ServiceTile) => {
    if (tile.isMore) {
      setMoreQuery("");
      setMoreOpen(true);
      return;
    }
    setMoreOpen(false);
    if (tile.route) {
      if (
        tile.route === "/service/gst" ||
        tile.route === "/service/itr" ||
        tile.route === "/service/loans" ||
        tile.route === "/services"
      ) {
        router.push(tile.route);
      } else {
        accessService(tile.route);
      }
    }
  };

  const catalogueQuery = moreQuery.trim().toLowerCase();
  const filteredCatalogue = SERVICE_CATALOGUE.map((group) => ({
    ...group,
    items: catalogueQuery
      ? group.items.filter((item) =>
          item.label.toLowerCase().includes(catalogueQuery)
        )
      : group.items,
  })).filter((group) => group.items.length > 0);

  const onBannerScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    bannerPageRef.current = page;
    setBannerPage(page);
  };


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      <View
        style={[
          styles.heroHeader,
          {
            backgroundColor: colors.primaryDark,
            paddingTop: insets.top + Spacing.two,
          },
        ]}
      >
        <View style={styles.topHeaderRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/(main)/profile")}
            style={styles.menuBtn}
            hitSlop={8}
          >
            <Ionicons name="menu" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.brandContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/(main)/profile")}
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
              onPress={() => router.push("/notifications")}
              style={styles.iconBtn}
              hitSlop={6}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#FFFFFF"
              />
              {unreadCount > 0 && (
                <View
                  style={[styles.badge, { backgroundColor: colors.orange }]}
                >
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

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: SCREEN_BOTTOM_PADDING },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner carousel */}
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
                      <Ionicons
                        name="arrow-forward"
                        size={15}
                        color="#FFFFFF"
                      />
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

        {/* Quick Services */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Services
          </Text>
          <TouchableOpacity
            onPress={() => setMoreOpen(true)}
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

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Financial Overview
          </Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {STATS.map((stat) => (
            <TouchableOpacity
              key={stat.id}
              activeOpacity={0.85}
              onPress={() => router.push(stat.route)}
              style={[
                styles.statsCard,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.statsTop}>
                <Text
                  style={[styles.statsLabel, { color: colors.textSecondary }]}
                >
                  {stat.label}
                </Text>
                <View
                  style={[
                    styles.statsIcon,
                    {
                      backgroundColor: isDark
                        ? colors.backgroundSelected
                        : stat.tintBg,
                    },
                  ]}
                >
                  <Ionicons
                    name={stat.icon}
                    size={17}
                    color={isDark ? colors.text : stat.tint}
                  />
                </View>
              </View>
              <Text style={[styles.statsNumber, { color: stat.tint }]}>
                {stat.value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upcoming deadlines */}
        {UPCOMING_DEADLINES.length > 0 && (
          <View
            style={[
              styles.card,
              styles.cardPadded,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Upcoming Deadlines
            </Text>

            {UPCOMING_DEADLINES.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.75}
                onPress={() => router.push(item.route)}
                style={[
                  styles.deadlineRow,
                  index < UPCOMING_DEADLINES.length - 1 && [
                    styles.deadlineRowBorder,
                    { borderBottomColor: colors.border },
                  ],
                ]}
              >
                <View
                  style={[
                    styles.deadlineTag,
                    {
                      backgroundColor: isDark
                        ? colors.backgroundSelected
                        : item.tintBg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.deadlineTagText,
                      { color: isDark ? colors.text : item.tint },
                    ]}
                  >
                    {item.tag}
                  </Text>
                </View>

                <View style={styles.deadlineText}>
                  <Text
                    style={[styles.deadlineTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.deadlineDate,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {item.date}
                  </Text>
                </View>

                {item.urgent && (
                  <View
                    style={[
                      styles.duePill,
                      {
                        backgroundColor: isDark
                          ? colors.backgroundSelected
                          : "#FDEBEB",
                      },
                    ]}
                  >
                    <Text style={[styles.duePillText, { color: colors.error }]}>
                      Due Soon
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recent applications */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Applications
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(main)/applications")}
            hitSlop={8}
            style={styles.linkRow}
          >
            <Text style={[styles.viewAllText, { color: colors.primary }]}>
              View All
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {recentApps.length === 0 ? (
          <View
            style={[
              styles.card,
              styles.cardPadded,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[styles.emptyText, { color: colors.textSecondary }]}
            >
              No applications yet. Start a service to see it here.
            </Text>
          </View>
        ) : (
          recentApps.map((app) => {
            const tone = statusTone(app.status);
            return (
              <TouchableOpacity
                key={app.id}
                activeOpacity={0.85}
                onPress={() => {
                  useApplicationStore
                    .getState()
                    .setSelectedApplicationId(app.id);
                  router.push(`/application/${app.id}`);
                }}
                style={[
                  styles.appCard,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.appCardTop}>
                  <Text style={[styles.appId, { color: colors.success }]}>
                    {app.id}
                  </Text>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: isDark
                          ? colors.backgroundSelected
                          : tone.bg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: isDark ? colors.text : tone.fg },
                      ]}
                    >
                      {app.status}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[styles.appName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {app.serviceName}
                </Text>

                <View style={styles.appCardBottom}>
                  <Text
                    style={[styles.appDate, { color: colors.textSecondary }]}
                  >
                    {app.createdAt}
                  </Text>
                  <View style={styles.linkRow}>
                    <Text
                      style={[styles.viewAllText, { color: colors.primary }]}
                    >
                      View Details
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={colors.primary}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Need help */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/chat/support")}
          style={styles.helpCard}
        >
          <View style={styles.helpIcon}>
            <Ionicons name="chatbubble-ellipses" size={22} color="#FFFFFF" />
          </View>

          <View style={styles.helpText}>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpDesc}>Our experts are available 24/7</Text>
          </View>

          <View style={styles.helpBtn}>
            <Text style={styles.helpBtnText}>Chat</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Explore services sheet */}
      <Modal
        visible={moreOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setMoreOpen(false)}
      >
        <Pressable
          style={styles.sheetBackdrop}
          onPress={() => setMoreOpen(false)}
        >
          <Pressable
            style={[
              styles.sheet,
              {
                backgroundColor: colors.background,
                paddingBottom: insets.bottom + 12,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                Explore Services
              </Text>
              <TouchableOpacity
                onPress={() => setMoreOpen(false)}
                hitSlop={10}
              >
                <Text style={[styles.sheetDone, { color: colors.orange }]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.sheetSearch,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="search"
                size={17}
                color={colors.textSecondary}
              />
              <TextInput
                value={moreQuery}
                onChangeText={setMoreQuery}
                placeholder="Search services..."
                placeholderTextColor={colors.textSecondary}
                style={[styles.sheetSearchInput, { color: colors.text }]}
                autoCorrect={false}
                returnKeyType="search"
              />
              {moreQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setMoreQuery("")}
                  hitSlop={8}
                >
                  <Ionicons
                    name="close-circle"
                    size={17}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.sheetScrollContent}
            >
              {filteredCatalogue.map((group, groupIndex) => (
                <View key={`${group.id}-${groupIndex}`}>
                  <View style={styles.catHeader}>
                    <View
                      style={[
                        styles.catIcon,
                        {
                          backgroundColor: isDark
                            ? colors.backgroundSelected
                            : "#E8EFF7",
                        },
                      ]}
                    >
                      <Ionicons
                        name={group.icon}
                        size={16}
                        color={colors.primary}
                      />
                    </View>
                    <Text style={[styles.catTitle, { color: colors.text }]}>
                      {group.title}
                    </Text>
                  </View>

                  {group.items.map((item) => (
                    <TouchableOpacity
                      key={item.label}
                      activeOpacity={0.75}
                      onPress={() => openCatalogueItem(item, group.id)}
                      style={[
                        styles.serviceRow,
                        {
                          backgroundColor: colors.backgroundElement,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.serviceRowText,
                          { color: colors.text },
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={17}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ))}

              {filteredCatalogue.length === 0 && (
                <View style={styles.sheetEmpty}>
                  <Ionicons
                    name="search-outline"
                    size={34}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[styles.sheetEmptyText, { color: colors.text }]}
                  >
                    No services match "{moreQuery.trim()}"
                  </Text>
                </View>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export default HomeScreen;
