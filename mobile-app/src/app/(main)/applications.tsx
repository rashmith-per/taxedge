import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import Svg, { Path, Rect } from "react-native-svg";
import { useTheme } from "../../hooks/use-theme";
import { useColorScheme } from "../../hooks/use-color-scheme";
import { useResponsive } from "../../hooks/use-responsive";
import { useApplicationStore } from "../../store/applicationStore";
import { useNotificationStore } from "../../store/notificationStore";
import { SCREEN_BOTTOM_PADDING } from "../../components/ScreenLayout";
import type { Application, ServiceCategoryId } from "../../types/domain";
import { styles } from "../../styles/app/(main)/applications.styles";

type StatusFilterType = "ALL" | "IN_PROGRESS" | "COMPLETED" | "UNDER_VERIFICATION";

const CATEGORY_TABS: { id: "ALL" | ServiceCategoryId; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "GST", label: "GST" },
  { id: "ITR", label: "ITR" },
  { id: "LOANS", label: "Loans" },
];

/** Custom Tagged Document Icon (GST / ITR) */
function TaggedDocIcon({ tag, color = "#083B75", size = 26 }: { tag: string; color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size + 2, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size + 2} viewBox="0 0 24 26" fill="none">
        <Path d="M4 3.5C4 2.4 4.9 1.5 6 1.5H14.5L20 7V22.5C20 23.6 19.1 24.5 18 24.5H6C4.9 24.5 4 23.6 4 22.5V3.5Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M14 1.5V7H19.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M8 7H11" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <Rect x="6.5" y="12" width="11" height="8.5" rx="2" stroke={color} strokeWidth="1.4" />
      </Svg>
      <Text style={{ position: "absolute", bottom: 4.5, fontSize: size > 24 ? 6.5 : 5.5, fontWeight: "900", color, letterSpacing: -0.2 }}>{tag}</Text>
    </View>
  );
}

function LoanRupeeIcon({ color = "#EA580C", size = 26 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C8.5 2 6.5 4.5 6.5 7C6.5 8.2 7 9.2 7.7 10H5C3.9 10 3 10.9 3 12V14C3 15.1 3.9 16 5 16H8L13 21C13.5 21.5 14.3 21.3 14.6 20.7L15.3 19.3C15.6 18.7 15.3 18 14.7 17.7L12.5 16.6H17C19.2 16.6 21 14.8 21 12.6C21 10.4 19.2 8.6 17 8.6H14.5C14.8 7.8 15 7 15 6C15 3.8 13.7 2 12 2Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8C13.1 8 14 7.1 14 6Z" stroke={color} strokeWidth="1.6" />
    </Svg>
  );
}

function CategoryTabIcon({ id, isActive }: { id: "ALL" | ServiceCategoryId; isActive: boolean }) {
  const color = isActive ? "#FF5722" : "#0A2346";
  switch (id) {
    case "ALL": return <Ionicons name="grid-outline" size={23} color={color} />;
    case "GST": return <TaggedDocIcon tag="GST" color={color} size={22} />;
    case "ITR": return <TaggedDocIcon tag="ITR" color={color} size={22} />;
    case "LOANS": return <LoanRupeeIcon color={color} size={22} />;
    case "BUSINESS": return <Ionicons name="briefcase-outline" size={23} color={color} />;
    case "INSURANCE": return <Ionicons name="shield-checkmark-outline" size={23} color={color} />;
    default: return <Ionicons name="folder-outline" size={23} color={color} />;
  }
}

function ApplicationCardAvatar({ category }: { category: ServiceCategoryId }) {
  const isOrange = category === "BUSINESS" || category === "LOANS";
  const bg = isOrange ? "#FFF1E8" : "#EAF2FF";
  const color = isOrange ? "#EA580C" : "#083B75";

  let icon = <Ionicons name="document-text-outline" size={26} color={color} />;
  if (category === "GST") icon = <TaggedDocIcon tag="GST" color={color} size={26} />;
  else if (category === "ITR") icon = <TaggedDocIcon tag="ITR" color={color} size={26} />;
  else if (category === "BUSINESS") icon = <Ionicons name="briefcase-outline" size={26} color={color} />;
  else if (category === "LOANS") icon = <LoanRupeeIcon color={color} size={26} />;
  else if (category === "INSURANCE") icon = <Ionicons name="shield-checkmark-outline" size={26} color={color} />;

  return <View style={[styles.avatarBox, { backgroundColor: bg }]}>{icon}</View>;
}

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  if (months.some((m) => dateStr.includes(m))) return dateStr;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {}
  return dateStr;
}

function getStatusBadgeStyle(status?: string) {
  const lower = (status || "").toLowerCase();
  if (lower.includes("complete") || lower.includes("disbursed") || lower.includes("active") || lower.includes("approved")) {
    return { bg: "#E0F2FE", text: "#083B75", label: "Completed" };
  }
  if (lower.includes("submit")) {
    return { bg: "#E0F2FE", text: "#083B75", label: "Submitted" };
  }
  if (lower.includes("officer")) {
    return { bg: "#FFF1E8", text: "#EA580C", label: "Officer Review" };
  }
  if (lower.includes("verification")) {
    return { bg: "#F3E8FF", text: "#7E22CE", label: "Under Verification" };
  }
  if (lower.includes("process") || lower.includes("calculation") || lower.includes("quote") || lower.includes("progress")) {
    return { bg: "#E0F2FE", text: "#0284C7", label: "Processing" };
  }
  if (lower.includes("credit")) {
    return { bg: "#FFF1E8", text: "#EA580C", label: "Credit Review" };
  }
  return { bg: "#EAF2FF", text: "#083B75", label: status || "Submitted" };
}

function isItrApplication(app: Application): boolean {
  const cat = (app.category || "").toUpperCase();
  const sid = (app.serviceId || "").toLowerCase();
  return (
    cat === "ITR" ||
    sid === "itr-filing" ||
    sid === "tds-refund" ||
    sid === "previous-year-itr" ||
    sid === "revised-itr" ||
    sid === "tax-notice-assistance"
  );
}

function isGstApplication(app: Application): boolean {
  const cat = (app.category || "").toUpperCase();
  const sid = (app.serviceId || "").toLowerCase();
  return cat === "GST" || sid.startsWith("gst");
}

function isLoansApplication(app: Application): boolean {
  const cat = (app.category || "").toUpperCase();
  const sid = (app.serviceId || "").toLowerCase();
  return cat === "LOANS" || sid.startsWith("loan");
}

function isBusinessApplication(app: Application): boolean {
  const cat = (app.category || "").toUpperCase();
  const sid = (app.serviceId || "").toLowerCase();
  return cat === "BUSINESS" || sid.startsWith("business") || sid.startsWith("company");
}

function isInsuranceApplication(app: Application): boolean {
  const cat = (app.category || "").toUpperCase();
  const sid = (app.serviceId || "").toLowerCase();
  return cat === "INSURANCE" || sid.startsWith("insurance");
}

function getResumeRoute(app: Application): any {
  if (app.formData?.resumeRoute) return app.formData.resumeRoute;
  if (app.serviceId === "tds-refund") return "/service/tds-form";
  return `/service/${app.serviceId || "itr"}`;
}

export default function ApplicationsScreen() {
  const colors = useTheme();
  const isDark = useColorScheme() === "dark";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useResponsive();

  const applications = useApplicationStore((state) => state.applications);
  const isLoading = useApplicationStore((state) => state.isLoading);
  const error = useApplicationStore((state) => state.error);
  const loadApplications = useApplicationStore((state) => state.loadApplications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | ServiceCategoryId>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("ALL");

  const fetchApplications = useCallback(async () => {
    try {
      await loadApplications();
    } catch {
      // Handled via store state
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
    } catch {
      // Handled via store state
    } finally {
      setRefreshing(false);
    }
  }, [loadApplications]);

  // Dynamic calculations from real API response
  const totalCount = applications.length;

  const inProgressCount = useMemo(() => {
    return applications.filter((a) => {
      const s = (a.status || "").toLowerCase();
      return (
        s.includes("progress") ||
        (!s.includes("complete") && !s.includes("approved") && !s.includes("verification") && !s.includes("reject"))
      );
    }).length;
  }, [applications]);

  const completedCount = useMemo(() => {
    return applications.filter((a) => {
      const s = (a.status || "").toLowerCase();
      return s.includes("complete") || s.includes("approved") || s.includes("disbursed");
    }).length;
  }, [applications]);

  const underVerificationCount = useMemo(() => {
    return applications.filter((a) => {
      const s = (a.status || "").toLowerCase();
      return s.includes("verification") || s.includes("review");
    }).length;
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        let matchesCategory = true;
        if (selectedCategory === "GST") matchesCategory = isGstApplication(app);
        else if (selectedCategory === "ITR") matchesCategory = isItrApplication(app);
        else if (selectedCategory === "LOANS") matchesCategory = isLoansApplication(app);
        else if (selectedCategory === "BUSINESS") matchesCategory = isBusinessApplication(app);
        else if (selectedCategory === "INSURANCE") matchesCategory = isInsuranceApplication(app);

        let matchesStatus = true;
        const s = (app.status || "").toLowerCase();
        if (statusFilter === "IN_PROGRESS") {
          matchesStatus =
            s.includes("progress") ||
            (!s.includes("complete") && !s.includes("approved") && !s.includes("verification") && !s.includes("reject"));
        } else if (statusFilter === "COMPLETED") {
          matchesStatus = s.includes("complete") || s.includes("approved") || s.includes("disbursed");
        } else if (statusFilter === "UNDER_VERIFICATION") {
          matchesStatus = s.includes("verification") || s.includes("review");
        }

        return matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
  }, [applications, selectedCategory, statusFilter]);

  const overviewItems: { key: StatusFilterType; count: number; label: string; color: string; isAll?: boolean }[] = [
    { key: "ALL", count: totalCount, label: "Total\nApplications", color: isDark ? colors.text : "#083B75", isAll: true },
    { key: "IN_PROGRESS", count: inProgressCount, label: "In Progress", color: "#EA580C" },
    { key: "COMPLETED", count: completedCount, label: "Completed", color: isDark ? colors.text : "#083B75" },
    { key: "UNDER_VERIFICATION", count: underVerificationCount, label: "Under\nVerification", color: "#EA580C" },
  ];

  const handleApplicationPress = useCallback((item: Application) => {
    if (item.status === "Draft" || item.formData?.isDraft) {
      router.push(getResumeRoute(item));
      return;
    }
    useApplicationStore.getState().setSelectedApplicationId(item.id);
    router.push(`/application/${item.id}`);
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#0A2346" />

      {/* ---------------- ROYAL NAVY HEADER ---------------- */}
      <View style={[styles.navyHeader, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>My Applications</Text>
            <Text style={styles.headerSubtitle}>Track all your service applications</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/notifications")}
            style={styles.bellButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="notifications" size={24} color="#FF5722" />
            {unreadCount > 0 && <View style={styles.bellDotBadge} />}
          </TouchableOpacity>
        </View>

        {/* Category Tabs */}
        <View style={styles.categoryCardWrapper}>
          <View style={styles.categoryTabsRow}>
            {CATEGORY_TABS.map((tab) => {
              const isActive = selectedCategory === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedCategory(tab.id)}
                  style={styles.categoryTabItem}
                >
                  <View style={[styles.categoryIconWrap, isActive && styles.activeCategoryIconWrap]}>
                    <CategoryTabIcon id={tab.id} isActive={isActive} />
                  </View>
                  <Text
                    style={[
                      styles.categoryTabLabel,
                      { color: isActive ? "#FF5722" : "#0A2346", fontWeight: isActive ? "700" : "600" },
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {tab.label}
                  </Text>
                  <View style={isActive ? styles.activeTabIndicator : styles.inactiveTabIndicator} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* ---------------- SCROLLABLE BODY — FlatList for virtualized app cards ---------------- */}
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
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.text : "#0F172A" }]}>
                Application Overview
              </Text>
            </View>

            {/* Overview Metric Boxes */}
            <View
              style={[
                styles.overviewCard,
                {
                  backgroundColor: isDark ? colors.backgroundElement : "#FFFFFF",
                  borderColor: isDark ? colors.border : "#F1F5F9",
                },
              ]}
            >
              {overviewItems.map((item, idx) => {
                const isSelected = item.isAll
                  ? statusFilter === "ALL" && selectedCategory === "ALL"
                  : statusFilter === item.key;
                return (
                  <React.Fragment key={item.key}>
                    {idx > 0 && (
                      <View
                        style={[styles.overviewDivider, { backgroundColor: isDark ? colors.border : "#F1F5F9" }]}
                      />
                    )}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() =>
                        setStatusFilter(statusFilter === item.key && item.key !== "ALL" ? "ALL" : item.key)
                      }
                      style={[
                        styles.overviewCol,
                        isSelected &&
                          (isDark
                            ? { backgroundColor: "#1E293B", borderWidth: 1, borderColor: "#FF5722" }
                            : styles.activeOverviewCol),
                      ]}
                    >
                      <Text
                        style={[
                          styles.overviewVal,
                          {
                            color: isSelected
                              ? isDark
                                ? "#FF7A00"
                                : item.isAll
                                ? "#083B75"
                                : item.color
                              : isDark
                              ? item.isAll
                                ? "#FFFFFF"
                                : item.color
                              : item.color,
                          },
                        ]}
                      >
                        {item.count}
                      </Text>
                      <Text
                        style={[
                          styles.overviewSub,
                          {
                            color: isDark
                              ? isSelected
                                ? "#FFFFFF"
                                : colors.textSecondary
                              : isSelected
                              ? "#0A2346"
                              : "#64748B",
                            fontWeight: isSelected ? "700" : "500",
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                      <View style={isSelected ? styles.activeOverviewIndicator : styles.inactiveOverviewIndicator} />
                    </TouchableOpacity>
                  </React.Fragment>
                );
              })}
            </View>

            {/* Recent Applications Header */}
            <View style={styles.recentHeaderRow}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.text : "#0F172A" }]}>
                Recent Applications
              </Text>
            </View>
          </>
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
            <View
              style={[
                styles.errorContainer,
                {
                  backgroundColor: isDark ? colors.backgroundElement : "#FFFFFF",
                  borderColor: isDark ? colors.border : "#FEE2E2",
                },
              ]}
            >
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
              <Ionicons name="folder-open-outline" size={48} color={colors.textSecondary} style={{ marginBottom: 12 }} />
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
        renderItem={({ item }) => {
          const badge = getStatusBadgeStyle(item.status);
          const isDraft = item.status === "Draft" || Boolean(item.formData?.isDraft);
          const pendingDocsCount = item.documents.filter((doc) => doc.status === "Pending").length;
          const isGstAmendment = item.serviceId === "gst-amendment";
          const isGstCancellation = item.serviceId === "gst-cancellation";
          const idColor = item.category === "BUSINESS" || item.category === "LOANS" ? "#EA580C" : "#083B75";
          const formattedDate = formatDisplayDate(item.createdAt);
          const displayId =
            (isGstAmendment || isGstCancellation) && item.formData?.arn ? item.formData.arn : item.id;
          const displayName = isGstCancellation
            ? "GST Cancellation (REG-16)"
            : isGstAmendment && item.formData?.section
            ? `GST Amendment — ${item.formData.section}`
            : item.serviceName;

          const isNonCore =
            String(item.formData?.isCore).toLowerCase() === "false" ||
            Boolean(item.formData?.amendmentCategory?.toLowerCase().includes("non-core")) ||
            (item.formData?.section
              ? ["Bank Accounts", "Authorised Signatories", "Contact Details"].some((s) =>
                  item.formData?.section?.includes(s)
                )
              : false);
          const isCore = !isNonCore;

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleApplicationPress(item)}
              style={[
                styles.appCard,
                {
                  backgroundColor: isDark ? colors.backgroundElement : "#FFFFFF",
                  borderColor: isDark ? colors.border : "#F1F5F9",
                },
              ]}
            >
              <ApplicationCardAvatar category={item.category} />
              <View style={styles.cardContent}>
                <View style={styles.cardTopRow}>
                  <Text style={[styles.appIdText, { color: idColor }]}>{displayId}</Text>
                  <View style={styles.cardBadgeWithArrow}>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: badge.text }]}>{badge.label}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={17} color="#EA580C" style={styles.cardChevron} />
                  </View>
                </View>
                <Text
                  style={[styles.serviceNameText, { color: isDark ? colors.text : "#0F172A" }]}
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
                <View style={styles.cardBottomRow}>
                  {formattedDate ? (
                    <View style={styles.dateWrap}>
                      <Ionicons name="calendar-outline" size={13.5} color="#64748B" />
                      <Text style={styles.dateText}>{formattedDate}</Text>
                    </View>
                  ) : null}
                  <View style={styles.metaChip}>
                    <Ionicons name="document-attach-outline" size={12} color="#64748B" />
                    <Text style={styles.metaChipText}>
                      {pendingDocsCount} pending
                    </Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Ionicons name="card-outline" size={12} color="#64748B" />
                    <Text style={styles.metaChipText}>
                      {item.category === "LOANS" && item.formData?.requestedAmount
                        ? `₹${Number(item.formData.requestedAmount).toLocaleString("en-IN")}`
                        : item.paymentStatus}
                    </Text>
                  </View>
                  <View style={styles.cardActionTextWrap}>
                    <Text style={styles.cardActionText}>
                      {isDraft ? "Resume" : "View Details"}
                    </Text>
                  </View>
                  {isGstAmendment && item.formData?.gstin ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginLeft: 10,
                        backgroundColor: isDark ? "#1E293B" : "#EFF6FF",
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                        borderWidth: 0.5,
                        borderColor: "#BFDBFE",
                      }}
                    >
                      <Text style={{ fontSize: 10.5, fontWeight: "600", color: isDark ? "#93C5FD" : "#083B75" }}>
                        {item.formData.gstin}
                      </Text>
                    </View>
                  ) : null}
                  {isGstAmendment ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginLeft: 6,
                        backgroundColor: isCore
                          ? isDark
                            ? "rgba(234, 88, 12, 0.18)"
                            : "#FFF7ED"
                          : isDark
                          ? "rgba(2, 132, 199, 0.18)"
                          : "#EFF6FF",
                        paddingHorizontal: 6,
                        paddingVertical: 2.5,
                        borderRadius: 4,
                        borderWidth: 0.5,
                        borderColor: isCore
                          ? isDark
                            ? "rgba(234, 88, 12, 0.4)"
                            : "#FED7AA"
                          : isDark
                          ? "rgba(2, 132, 199, 0.4)"
                          : "#BFDBFE",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "800",
                          letterSpacing: 0.3,
                          color: isCore
                            ? isDark
                              ? "#FB923C"
                              : "#EA580C"
                            : isDark
                            ? "#38BDF8"
                              : "#0284C7",
                        }}
                      >
                        {isCore ? "CORE" : "NON-CORE"}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
