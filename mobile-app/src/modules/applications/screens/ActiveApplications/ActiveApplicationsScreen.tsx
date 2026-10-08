import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/hooks/use-theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useResponsive } from "@/hooks/use-responsive";
import { useApplicationStore } from "@/store/applicationStore";
import { useNotificationStore } from "@/store/notificationStore";
import { SCREEN_BOTTOM_PADDING } from "@/shared/components/ScreenLayout";
import type { Application, ServiceCategoryId } from "@/types/domain";
import { styles } from "./ActiveApplicationsScreen.styles";
import { ApplicationCardItem } from "@/components/screens/applications/ApplicationCardItem";
import { OverviewCard, type StatusFilterType, type OverviewItem } from "@/components/screens/applications/OverviewCard";
import { toHref } from "@/shared/utils/navigation";
import { logger } from "@/core/logging/logger";

const CATEGORY_FILTER_OPTIONS: { id: "ALL" | ServiceCategoryId; label: string; icon: string }[] = [
  { id: "ALL", label: "All Applications", icon: "grid-outline" },
  { id: "GST", label: "GST Services", icon: "document-text-outline" },
  { id: "ITR", label: "ITR & TDS", icon: "receipt-outline" },
  { id: "LOANS", label: "Loans", icon: "cash-outline" },
  { id: "BUSINESS", label: "Business", icon: "briefcase-outline" },
];

// ── Category & Status matchers ────────────────────────────────────────────────

const CATEGORY_MATCHERS: Record<string, (app: Application) => boolean> = {
  GST: (app) =>
    (app.category || "").toUpperCase() === "GST" ||
    (app.serviceId || "").toLowerCase().startsWith("gst"),
  ITR: (app) => {
    const cat = (app.category || "").toUpperCase();
    const sid = (app.serviceId || "").toLowerCase();
    return (
      cat === "ITR" ||
      ["itr-filing", "tds-refund", "previous-year-itr", "revised-itr", "tax-notice-assistance"].includes(sid)
    );
  },
  LOANS: (app) =>
    (app.category || "").toUpperCase() === "LOANS" ||
    (app.serviceId || "").toLowerCase().startsWith("loan"),
  BUSINESS: (app) => {
    const cat = (app.category || "").toUpperCase();
    const sid = (app.serviceId || "").toLowerCase();
    return cat === "BUSINESS" || sid.startsWith("business") || sid.startsWith("company");
  },
  INSURANCE: (app) =>
    (app.category || "").toUpperCase() === "INSURANCE" ||
    (app.serviceId || "").toLowerCase().startsWith("insurance"),
};

const STATUS_FILTER_MATCHERS: Record<StatusFilterType, (status: string) => boolean> = {
  ALL:                () => true,
  IN_PROGRESS:        (s) => s.includes("progress") || (!s.includes("complete") && !s.includes("approved") && !s.includes("verification") && !s.includes("reject")),
  COMPLETED:          (s) => s.includes("complete") || s.includes("approved") || s.includes("disbursed"),
  UNDER_VERIFICATION: (s) => s.includes("verification") || s.includes("review"),
};

function getResumeRoute(app: Application): string {
  return (
    (app.formData?.resumeRoute as string) ||
    (app.serviceId === "tds-refund"
      ? "/service/tds-form"
      : `/service/${app.serviceId || "itr"}`)
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export function ActiveApplicationsScreen() {
  const colors  = useTheme();
  const isDark  = useColorScheme() === "dark";
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  useResponsive();

  const applications    = useApplicationStore((s) => s.applications);
  const isLoading       = useApplicationStore((s) => s.isLoading);
  const error           = useApplicationStore((s) => s.error);
  const loadApplications = useApplicationStore((s) => s.loadApplications);
  useNotificationStore((s) => s.unreadCount);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | ServiceCategoryId>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("ALL");
  const [showCategoryFilterModal, setShowCategoryFilterModal] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      await loadApplications();
    } catch (err) {
      logger.warn("[ActiveApplications] Failed to fetch applications:", { error: err });
    }
  }, [loadApplications]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useFocusEffect(
    useCallback(() => {
      fetchApplications();
    }, [fetchApplications])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadApplications();
    } catch (err) {
      logger.warn("[ActiveApplications] Failed to refresh applications:", { error: err });
    } finally {
      setRefreshing(false);
    }
  }, [loadApplications]);

  // ── Derived counts ──────────────────────────────────────────────────────────

  const totalCount            = applications.length;
  const inProgressCount       = useMemo(() => applications.filter((a) => STATUS_FILTER_MATCHERS.IN_PROGRESS((a.status || "").toLowerCase())).length, [applications]);
  const completedCount        = useMemo(() => applications.filter((a) => STATUS_FILTER_MATCHERS.COMPLETED((a.status || "").toLowerCase())).length, [applications]);
  const underVerificationCount = useMemo(() => applications.filter((a) => STATUS_FILTER_MATCHERS.UNDER_VERIFICATION((a.status || "").toLowerCase())).length, [applications]);

  const filteredApplications = useMemo(
    () =>
      applications
        .filter((app) => {
          const matchesCategory =
            selectedCategory === "ALL" ||
            Boolean(CATEGORY_MATCHERS[selectedCategory]?.(app));
          const matchesStatus = STATUS_FILTER_MATCHERS[statusFilter]((app.status || "").toLowerCase());
          return matchesCategory && matchesStatus;
        })
        .sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        }),
    [applications, selectedCategory, statusFilter]
  );

  const overviewItems: OverviewItem[] = [
    { key: "ALL",                count: totalCount,             label: "Total\nApplications",  color: isDark ? colors.text : "#083B75", isAll: true },
    { key: "IN_PROGRESS",        count: inProgressCount,        label: "In Progress",          color: "#EA580C" },
    { key: "COMPLETED",          count: completedCount,         label: "Completed",            color: isDark ? colors.text : "#083B75" },
    { key: "UNDER_VERIFICATION", count: underVerificationCount, label: "Under\nVerification",  color: "#EA580C" },
  ];

  const handleApplicationPress = useCallback((item: Application) => {
    const isDraft = item.status === "Draft" || Boolean(item.formData?.isDraft);
    if (isDraft) {
      router.push(toHref(getResumeRoute(item)));
    } else {
      useApplicationStore.getState().setSelectedApplicationId(item.id);
      router.push(`/application/${item.id}`);
    }
  }, [router]);

  const cardBg     = isDark ? colors.backgroundElement : "#FFFFFF";
  const cardBorder = isDark ? colors.border : "#F1F5F9";

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#0A2346" />

      {/* Navy header */}
      <View style={[styles.navyHeader, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>My Applications</Text>
            <Text style={styles.headerSubtitle}>Track all your service applications</Text>
          </View>
        </View>

        {/* Unified Overview card floating at top header */}
        <OverviewCard
          items={overviewItems}
          statusFilter={statusFilter}
          selectedCategory={selectedCategory}
          isDark={isDark}
          colors={colors}
          onSelect={setStatusFilter}
          onOpenCategoryFilter={() => setShowCategoryFilterModal(true)}
          cardBg={cardBg}
          cardBorder={cardBorder}
        />
      </View>

      {/* Scrollable body */}
      <FlatList
        data={filteredApplications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: SCREEN_BOTTOM_PADDING }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FF5722"
            colors={["#FF5722"]}
          />
        }
        ListHeaderComponent={
          <View style={styles.recentHeaderRow}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.text : "#0F172A" }]}>
              Recent Applications
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoading && applications.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF5722" />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading applications...
              </Text>
            </View>
          ) : error && applications.length === 0 ? (
            <View style={[styles.errorContainer, { backgroundColor: cardBg, borderColor: isDark ? colors.border : "#FEE2E2" }]}>
              <Ionicons name="alert-circle-outline" size={44} color="#EA580C" />
              <Text style={[styles.errorTitle, { color: isDark ? colors.text : "#0F172A" }]}>
                Failed to load applications
              </Text>
              <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={fetchApplications} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="folder-open-outline"
                size={48}
                color={colors.textSecondary}
                style={styles.emptyIcon}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {applications.length === 0 ? "No applications yet" : "No applications match this filter"}
              </Text>
              {applications.length === 0 && (
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Your real-time submitted applications will appear here
                </Text>
              )}
            </View>
          )
        }
        renderItem={({ item }) => (
          <ApplicationCardItem
            item={item}
            isDark={isDark}
            textColor={isDark ? colors.text : "#0F172A"}
            borderColor={cardBorder}
            bgColor={cardBg}
            onPress={handleApplicationPress}
          />
        )}
      />

      {/* Service Category Filter Modal */}
      <Modal
        visible={showCategoryFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.categoryModalBackdrop}
          activeOpacity={1}
          onPress={() => setShowCategoryFilterModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.categoryModalCard}>
            <Text style={styles.categoryModalTitle}>Filter Applications</Text>
            {CATEGORY_FILTER_OPTIONS.map((opt) => {
              const isActive = selectedCategory === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.categoryModalOption,
                    isActive && styles.categoryModalOptionActive,
                  ]}
                  onPress={() => {
                    setSelectedCategory(opt.id);
                    setShowCategoryFilterModal(false);
                  }}
                >
                  <View style={styles.categoryModalOptionLeft}>
                    <Ionicons
                      name={opt.icon as any}
                      size={20}
                      color={isActive ? "#EA580C" : "#64748B"}
                    />
                    <Text
                      style={[
                        styles.categoryModalOptionLabel,
                        isActive && styles.categoryModalOptionLabelActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </View>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={20} color="#EA580C" />
                  )}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.categoryModalCloseBtn}
              onPress={() => setShowCategoryFilterModal(false)}
            >
              <Text style={styles.categoryModalCloseText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default ActiveApplicationsScreen;
