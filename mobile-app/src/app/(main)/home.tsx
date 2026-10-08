import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useTheme } from "@/hooks/use-theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/authStore";
import { useApplicationStore } from "@/store/applicationStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useServiceAccessGuard } from "@/shared/hooks/useServiceAccessGuard";
import { CompleteProfileModal } from "@/shared/components/CompleteProfileModal";
import { SERVICE_CATALOGUE } from "@/data/catalogue";
import { SCREEN_BOTTOM_PADDING } from "@/shared/components/ScreenLayout";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Spacing } from "@/shared/theme";
import { styles } from "@/styles/app/(main)/home.styles";
import type { CatalogueItem, ServiceCategoryId } from "@/types/domain";
import type { DashboardServiceTile, ServiceTile } from "@/modules/dashboard/types/dashboard.types";

// ── Extracted sub-components ──────────────────────────────────────────────────
import { HomeHeader } from "@/components/screens/home/HomeHeader";
import { ApplyBannerCarousel, type ApplyBanner } from "@/components/screens/home/ApplyBannerCarousel";
import { ServicesGrid } from "@/components/screens/home/ServicesGrid";
import { StatsGrid, type StatTile } from "@/components/screens/home/StatsGrid";
import { DraftBanner } from "@/components/screens/home/DraftBanner";
import { RecentApplicationCard } from "@/components/screens/home/RecentApplicationCard";
import { ExploreServicesSheet } from "@/components/screens/home/ExploreServicesSheet";

// ── Types ─────────────────────────────────────────────────────────────────────


export type { DashboardServiceTile };

// ── Constants ─────────────────────────────────────────────────────────────────

const SERVICE_ICONS = {
  incorporation: require("../../../assets/images/services/incorporation.png"),
  gst: require("../../../assets/images/services/gst.png"),
  itr: require("../../../assets/images/services/itr.png"),
  projects: require("../../../assets/images/services/projects.png"),
  loans: require("../../../assets/images/services/loans.png"),
  insurance: require("../../../assets/images/services/insurance.png"),
  business: require("../../../assets/images/services/business.png"),
  more_services: require("../../../assets/images/services/more_services.png"),
};

export const DASHBOARD_SERVICES: DashboardServiceTile[] = [
  { id: "incorporation", label: "Incorporation", image: SERVICE_ICONS.incorporation, route: "/service/company-registration" },
  { id: "gst",          label: "GST",           image: SERVICE_ICONS.gst,           route: "/service/gst" },
  { id: "itr",          label: "ITR",           image: SERVICE_ICONS.itr,           route: "/service/itr" },
  { id: "projects",     label: "Projects",      image: SERVICE_ICONS.projects,      route: { pathname: "/services", params: { selectedCategory: "BUSINESS" } } },
  { id: "loans",        label: "Loans",         image: SERVICE_ICONS.loans,         route: "/service/loans" },
  { id: "insurance",    label: "Insurance",     image: SERVICE_ICONS.insurance,     route: { pathname: "/services", params: { selectedCategory: "INSURANCE" } } },
  { id: "business",     label: "Business",      image: SERVICE_ICONS.business,      route: { pathname: "/services", params: { selectedCategory: "BUSINESS" } } },
  { id: "more",         label: "More Services", image: SERVICE_ICONS.more_services, isMore: true },
];

const BANNER_NAVY      = "#083B75";
const BANNER_NAVY_DEEP = "#052750";

const APPLY_BANNERS: ApplyBanner[] = (
  [
    { key: "b-gst",     id: "GST",       title: "GST",          desc: "Registration, filing & compliance", cta: "Apply Now", icon: "receipt" },
    { key: "b-itr",     id: "ITR",       title: "ITR & TDS",    desc: "File returns, claim your refund",   cta: "File Now",  icon: "calculator" },
    { key: "b-loans",   id: "LOANS",     title: "LOANS",        desc: "Explore our loan solutions",        cta: "Explore",   icon: "wallet" },
    { key: "b-ins",     id: "INSURANCE", title: "INSURANCE",    desc: "Health & life cover plans",         cta: "Get Quote", icon: "shield-checkmark" },
    { key: "b-company", id: "BUSINESS",  title: "COMPANY SETUP",desc: "Incorporation & registrations",     cta: "Start Now", icon: "business" },
    { key: "b-acct",    id: "BUSINESS",  title: "ACCOUNTING",   desc: "Bookkeeping & monthly reports",     cta: "Know More", icon: "stats-chart" },
  ] as const
).map((banner, i) => ({ ...banner, bg: i % 2 === 0 ? BANNER_NAVY : BANNER_NAVY_DEEP }));

// ── Helpers ───────────────────────────────────────────────────────────────────

const statusTone = (status: string) => {
  if (status === "Completed")   return { fg: "#047857", bg: "#E6F5F0" };
  if (status === "Rejected")    return { fg: "#B91C1C", bg: "#FDEBEB" };
  if (status === "Verification") return { fg: "#6D28D9", bg: "#F1ECFE" };
  return { fg: "#1D4ED8", bg: "#EAF1FE" };
};

// ── Screen ────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const colors  = useTheme();
  const scheme  = useColorScheme();
  const isDark  = scheme === "dark";
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { accessService } = useServiceAccessGuard();

  const [moreOpen,  setMoreOpen]  = useState(false);
  const [moreQuery, setMoreQuery] = useState("");

  const customer        = useAuthStore((s) => s.customer);
  const applications    = useApplicationStore((s) => s.applications);
  const gstDraft        = useApplicationStore((s) => s.gstDraft);
  const gstFilingDraft  = useApplicationStore((s) => s.gstFilingDraft);
  const itrDraft        = useApplicationStore((s) => s.itrDraft);
  const unreadCount     = useNotificationStore((s) => s.unreadCount);

  useFocusEffect(
    useCallback(() => {
      useApplicationStore.getState().loadApplications();
    }, [])
  );

  // ── Derived values ──────────────────────────────────────────────────────────

  const hasRealName = Boolean(
    customer?.name &&
    customer.name.trim() !== "" &&
    customer.name.toLowerCase() !== "valued client" &&
    customer.name.toLowerCase() !== "valued" &&
    customer.name.toLowerCase() !== "priya" &&
    customer.profileCompleted
  );

  const greetingTitle = hasRealName
    ? `Hello, ${customer!.name.trim().split(" ")[0]} 👋`
    : "Welcome to TaxEdge 👋";

  const activeCount     = (applications || []).filter((a) => a?.status !== "Completed").length;
  const pendingDocsCount = (applications || []).reduce(
    (sum, a) => sum + ((a?.documents || []).filter((d) => d?.status === "Pending").length), 0
  );
  const completedCount  = (applications || []).filter((a) => a?.status === "Completed").length;
  const paymentDue      = (applications || [])
    .filter((a) => a?.paymentStatus === "Pending")
    .reduce((sum, a) => sum + (a?.paymentAmount || 0), 0);

  const recentApps = applications.slice(0, 3);

  const STATS: StatTile[] = [
    { id: "active", label: "Active\nApplications",  value: `${activeCount}`,                           tint: "#059669", tintBg: "#E6F5F0", icon: "folder",          route: "/(main)/applications" },
    { id: "docs",   label: "Pending\nDocuments",    value: `${pendingDocsCount}`,                      tint: "#EA580C", tintBg: "#FEF0E6", icon: "document-attach",  route: "/(main)/applications" },
    { id: "due",    label: "Payment Due",           value: `₹${paymentDue.toLocaleString("en-IN")}`, tint: "#DC2626", tintBg: "#FDEBEB", icon: "card",             route: "/(main)/payments" },
    { id: "done",   label: "Completed\nServices",   value: `${completedCount}`,                        tint: "#2563EB", tintBg: "#EAF1FE", icon: "checkbox",         route: "/(main)/applications" },
  ];

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleExploreCategory = (categoryId: ServiceCategoryId) => {
    router.push({ pathname: "/services", params: { selectedCategory: categoryId } });
  };

  const openCatalogueItem = (item: CatalogueItem, categoryId: ServiceCategoryId) => {
    setMoreOpen(false);
    if (item.serviceId) {
      accessService(`/service/${item.serviceId}`);
    } else {
      router.push({ pathname: "/services", params: { selectedCategory: categoryId } });
    }
  };

  const openTile = (tile: DashboardServiceTile | ServiceTile) => {
    if (tile.isMore) { setMoreQuery(""); setMoreOpen(true); return; }
    setMoreOpen(false);
    if (tile.route) {
      if (
        tile.route === "/service/gst" ||
        tile.route === "/service/itr" ||
        tile.route === "/service/loans" ||
        tile.route === "/service/health-insurance" ||
        tile.route === "/services"
      ) {
        router.push(tile.route);
      } else {
        accessService(tile.route);
      }
    }
  };

  // Catalogue filtered by the sheet's search box.
  const catalogueQuery    = moreQuery.trim().toLowerCase();
  const filteredCatalogue = SERVICE_CATALOGUE.map((group) => ({
    ...group,
    items: catalogueQuery
      ? group.items.filter((item) => item.label.toLowerCase().includes(catalogueQuery))
      : group.items,
  })).filter((group) => group.items.length > 0);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      {/* Blue hero header */}
      <HomeHeader
        greetingTitle={greetingTitle}
        unreadCount={unreadCount}
        colors={colors}
        topInset={insets.top + Spacing.sm}
        onMenuPress={() => router.push("/(main)/profile")}
        onNotificationsPress={() => router.push("/notifications")}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: SCREEN_BOTTOM_PADDING }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Apply-for banner carousel */}
        <ApplyBannerCarousel
          banners={APPLY_BANNERS}
          colors={colors}
          onSelect={handleExploreCategory}
        />

        {/* Services section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Services</Text>
        </View>
        <ServicesGrid
          services={DASHBOARD_SERVICES}
          isDark={isDark}
          colors={colors}
          onPress={openTile}
        />

        {/* Financial overview section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Financial Overview</Text>
        </View>
        <StatsGrid stats={STATS} isDark={isDark} colors={colors} />

        {/* In-progress draft banners */}
        {gstDraft && (
          <DraftBanner
            updatedAt={gstDraft.updatedAt}
            stepIndex={gstDraft.stepIndex || 0}
            totalSteps="4"
            accentColor={colors.orange}
            lightBg="#FEF0E6"
            lightBorder="#FFD8BF"
            tagLabel="INCOMPLETE APPLICATION"
            title="GST Registration"
            subtitle="Pick up right where you left off"
            resumeLabel="Resume Application"
            isDark={isDark}
            colors={colors}
            onPress={() => accessService("/service/gst-registration")}
          />
        )}
        {gstFilingDraft && (
          <DraftBanner
            updatedAt={gstFilingDraft.updatedAt}
            stepIndex={gstFilingDraft.stepIndex || 0}
            totalSteps="4"
            accentColor={colors.primary}
            lightBg="#EAF1FE"
            lightBorder="#BFDBFE"
            tagLabel="INCOMPLETE FILING"
            title={`GST Return Filing (${gstFilingDraft.periodData?.filingMonth || "Current Period"})`}
            subtitle="Continue your return filing"
            resumeLabel="Resume Filing"
            isDark={isDark}
            colors={colors}
            onPress={() => accessService("/service/gst-filing")}
          />
        )}
        {itrDraft && (
          <DraftBanner
            updatedAt={itrDraft.updatedAt}
            stepIndex={itrDraft.stepIndex || 0}
            totalSteps="5"
            accentColor={colors.orange}
            lightBg="#FEF0E6"
            lightBorder="#FFD8BF"
            tagLabel="INCOMPLETE APPLICATION"
            title={`ITR Filing - ${itrDraft.categoryTitle || "Income Tax Return"}`}
            subtitle="Pick up right where you left off"
            resumeLabel="Resume Application"
            isDark={isDark}
            colors={colors}
            onPress={() => accessService("/service/itr-filing")}
          />
        )}

        {/* Recent applications */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Applications</Text>
          <TouchableOpacity onPress={() => router.push("/(main)/applications")} hitSlop={8} style={styles.linkRow}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {recentApps.length === 0 ? (
          <View style={[styles.card, styles.cardPadded, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No applications yet. Start a service to see it here.
            </Text>
          </View>
        ) : (
          recentApps.map((app) => (
            <RecentApplicationCard
              key={app.id}
              app={app}
              isDark={isDark}
              colors={colors}
              statusTone={statusTone}
            />
          ))
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

      {/* Explore services bottom sheet */}
      <ExploreServicesSheet
        visible={moreOpen}
        onClose={() => setMoreOpen(false)}
        query={moreQuery}
        onQueryChange={setMoreQuery}
        filteredCatalogue={filteredCatalogue}
        onSelectItem={openCatalogueItem}
        colors={colors}
        isDark={isDark}
        insets={insets}
      />

      <CompleteProfileModal />
    </View>
  );
}
