import React, { useRef, useState } from "react";
import { View, ScrollView, StatusBar, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "../../../hooks/use-theme";
import { useColorScheme } from "../../../hooks/use-color-scheme";
import { useAuthStore } from "../../authentication/store/authStore";
import { useApplicationStore } from "../../../store/applicationStore";
import { useNotificationStore } from "../../../store/notificationStore";
import { SERVICE_CATALOGUE } from "../../../data/catalogue";
import { SCREEN_BOTTOM_PADDING } from "../../../shared/components/ScreenLayout/ScreenLayout";
import { Maybe } from "../../../shared/utils/functional";
import { useServiceAccessGuard } from "../../../shared/hooks";
import { styles, CARD_WIDTH } from "../../../styles/app/(main)/home.styles";
import type { CatalogueItem, ServiceCategoryId } from "../../../shared/types/domain";
import type { ServiceTile, Deadline, StatTile } from "../types/dashboard.types";
import { HomeScreenBannerCarousel } from "../components/HomeScreenBannerCarousel";
import { HomeScreenExploreModal } from "../components/HomeScreenExploreModal";
import { HeroHeader, QuickServicesSection } from "../components/HomeScreenTopSections";
import {
  FinancialOverviewSection,
  RecentApplicationsSection,
  HelpSection,
} from "../components/HomeScreenBottomSections";

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
  const completedCount = applications.filter((app) => app.status !== "Completed").length;
  const paymentDue = applications
    .filter((app) => app.paymentStatus === "Pending")
    .reduce((sum, app) => sum + app.paymentAmount, 0);

  const recentApps = applications.slice(0, 3);

  const STATS: StatTile[] = [
    { id: "active", label: "Active\nApplications", value: `${activeCount}`, tint: "#059669", tintBg: "#E6F5F0", icon: "folder", route: "/(main)/applications" as any },
    { id: "docs", label: "Pending\nDocuments", value: `${pendingDocsCount}`, tint: "#EA580C", tintBg: "#FEF0E6", icon: "document-attach", route: "/(main)/applications" as any },
    { id: "due", label: "Payment Due", value: `₹${paymentDue.toLocaleString("en-IN")}`, tint: "#DC2626", tintBg: "#FDEBEB", icon: "card", route: "/(main)/payments" as any },
    { id: "done", label: "Completed\nServices", value: `${completedCount}`, tint: "#2563EB", tintBg: "#EAF1FE", icon: "checkbox", route: "/(main)/applications" as any },
  ];

  const UPCOMING_DEADLINES: Deadline[] = [];

  const handleExploreCategory = (categoryId: ServiceCategoryId) => {
    router.push({ pathname: "/services" as any, params: { selectedCategory: categoryId } });
  };

  const openCatalogueItem = (item: CatalogueItem, categoryId: ServiceCategoryId) => {
    setMoreOpen(false);
    if (item.serviceId) {
      accessService(`/service/${item.serviceId}`);
    } else {
      router.push({ pathname: "/services" as any, params: { selectedCategory: categoryId } });
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
        router.push(tile.route as any);
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

  const onSelectApplication = (appId: string) => {
    useApplicationStore.getState().setSelectedApplicationId(appId);
    router.push(`/application/${appId}` as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      <HeroHeader
        insets={insets}
        colors={colors}
        unreadCount={unreadCount}
        greetingText={greetingText}
        onOpenProfile={() => router.push("/(main)/profile")}
        onOpenNotifications={() => router.push("/notifications")}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: SCREEN_BOTTOM_PADDING },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <HomeScreenBannerCarousel
          bannerRef={bannerRef}
          onBannerScroll={onBannerScroll}
          handleExploreCategory={handleExploreCategory}
          bannerPage={bannerPage}
          colors={colors}
        />

        <QuickServicesSection
          colors={colors}
          isDark={isDark}
          openTile={openTile}
          onOpenAllServices={() => setMoreOpen(true)}
        />

        <FinancialOverviewSection
          colors={colors}
          isDark={isDark}
          stats={STATS}
          deadlines={UPCOMING_DEADLINES}
          onNavigate={(route) => router.push(route)}
        />

        <RecentApplicationsSection
          colors={colors}
          isDark={isDark}
          recentApps={recentApps}
          onViewAll={() => router.push("/(main)/applications")}
          onSelectApplication={onSelectApplication}
        />

        <HelpSection onChatSupport={() => router.push("/chat/support")} />
      </ScrollView>

      <HomeScreenExploreModal
        visible={moreOpen}
        onClose={() => setMoreOpen(false)}
        moreQuery={moreQuery}
        setMoreQuery={setMoreQuery}
        filteredCatalogue={filteredCatalogue}
        openCatalogueItem={openCatalogueItem}
        isDark={isDark}
        colors={colors}
        insets={insets}
      />
    </View>
  );
}

export default HomeScreen;
