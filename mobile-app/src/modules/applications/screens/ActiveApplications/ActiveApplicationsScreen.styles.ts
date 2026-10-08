/**
 * Screen: Applications Center
 * Module-owned styles.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1 },
  navyHeader: { backgroundColor: "#0A2346", paddingHorizontal: 16, paddingBottom: 0, zIndex: 10 },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, paddingHorizontal: 4 },
  headerTitleWrap: { flex: 1, paddingRight: 12 },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#FFFFFF", letterSpacing: -0.4 },
  headerSubtitle: { fontSize: 13.5, fontWeight: "400", color: "rgba(255, 255, 255, 0.75)", marginTop: 4 },
  bellButton: { width: 38, height: 38, justifyContent: "center", alignItems: "center", position: "relative" },
  bellDotBadge: { position: "absolute", top: 5, right: 5, width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF5722", borderWidth: 1.5, borderColor: "#0A2346" },
  categoryCardWrapper: { backgroundColor: "#FFFFFF", borderRadius: 18, paddingVertical: 10, paddingHorizontal: 8, marginBottom: -36, zIndex: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 6 },
  categoryTabsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" },
  categoryTabItem: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 2 },
  categoryIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  activeCategoryIconWrap: { backgroundColor: "#FFF2EA" },
  categoryTabLabel: { fontSize: 11, textAlign: "center", letterSpacing: -0.2 },
  activeTabIndicator: { height: 2.5, width: 22, backgroundColor: "#FF5722", borderRadius: 2, marginTop: 4 },
  inactiveTabIndicator: { height: 2.5, width: 22, backgroundColor: "transparent", marginTop: 4 },
  scrollContent: { paddingTop: 52, paddingHorizontal: 16 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "700", letterSpacing: -0.2 },
  overviewCard: { flexDirection: "row", borderRadius: 16, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 4, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  overviewCol: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 4, borderRadius: 10 },
  activeOverviewCol: { backgroundColor: "#FFF7ED" },
  activeOverviewIndicator: { height: 2, width: 18, backgroundColor: "#FF5722", borderRadius: 1, marginTop: 3 },
  inactiveOverviewIndicator: { height: 2, width: 18, backgroundColor: "transparent", marginTop: 3 },
  overviewVal: { fontSize: 18, fontWeight: "800", marginTop: 2, marginBottom: 2, letterSpacing: -0.3 },
  overviewSub: { fontSize: 11, textAlign: "center", marginTop: 2, lineHeight: 14, fontWeight: "500" },
  overviewDivider: { width: 1, height: 30, alignSelf: "center" },
  recentHeaderRow: { marginBottom: 12 },
  appCard: { flexDirection: "row", borderRadius: 18, borderWidth: 1, padding: 14, marginBottom: 12, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  avatarBox: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", marginRight: 12 },
  cardContent: { flex: 1 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  appIdText: { fontSize: 13, fontWeight: "700" },
  cardBadgeWithArrow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4.5, borderRadius: 14 },
  statusBadgeText: { fontSize: 11.5, fontWeight: "600" },
  cardChevron: { marginLeft: 2 },
  serviceNameText: { fontSize: 15.5, fontWeight: "700", marginTop: 2, marginBottom: 4, letterSpacing: -0.2 },
  cardBottomRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", rowGap: 4 },
  dateWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  dateText: { fontSize: 12.5, color: "#64748B", fontWeight: "500" },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 3, marginLeft: 8, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  metaChipText: { fontSize: 10.5, color: "#64748B", fontWeight: "600" },
  cardActionTextWrap: { marginLeft: "auto", paddingLeft: 8 },
  cardActionText: { fontSize: 11.5, color: "#EA580C", fontWeight: "800" },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 48, paddingHorizontal: 20 },
  emptyText: { fontSize: 15, fontWeight: "600", textAlign: "center" },
  emptySubtitle: { fontSize: 13, fontWeight: "400", textAlign: "center", marginTop: 4 },
  loadingContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 60, paddingHorizontal: 20 },
  loadingText: { fontSize: 14, fontWeight: "500", marginTop: 12, textAlign: "center" },
  errorContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 40, paddingHorizontal: 24, marginHorizontal: 16, marginTop: 16, borderRadius: 16, borderWidth: 1, backgroundColor: "#FFF" },
  errorTitle: { fontSize: 16, fontWeight: "700", marginTop: 10, textAlign: "center" },
  errorText: { fontSize: 13, fontWeight: "400", textAlign: "center", marginTop: 6, lineHeight: 18 },
  retryButton: { marginTop: 16, backgroundColor: "#0A2346", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  retryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  gstinBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
  },
  gstinBadgeDark: {
    backgroundColor: "#1E293B",
  },
  gstinBadgeText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#083B75",
  },
  gstinBadgeTextDark: {
    color: "#93C5FD",
  },
  coreBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 4,
    borderWidth: 0.5,
  },
  coreBadgeCore: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
  },
  coreBadgeCoreDark: {
    backgroundColor: "rgba(234, 88, 12, 0.18)",
    borderColor: "rgba(234, 88, 12, 0.4)",
  },
  coreBadgeNonCore: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  coreBadgeNonCoreDark: {
    backgroundColor: "rgba(2, 132, 199, 0.18)",
    borderColor: "rgba(2, 132, 199, 0.4)",
  },
  coreBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  coreBadgeTextCore: {
    color: "#EA580C",
  },
  coreBadgeTextCoreDark: {
    color: "#FB923C",
  },
  coreBadgeTextNonCore: {
    color: "#0284C7",
  },
  coreBadgeTextNonCoreDark: {
    color: "#38BDF8",
  },
  emptyIcon: {
    marginBottom: 12,
  },
  docIconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  docIconTag: {
    position: "absolute",
    bottom: 4.5,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  dateWrapRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
  },
  resumeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 12,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FFEDD5",
  },
  resumeBadgeText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#EA580C",
  },
  filterBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    marginTop: 2,
  },
  filterBadgeText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#EA580C",
  },
  categoryModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  categoryModalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  categoryModalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 14,
  },
  categoryModalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  categoryModalOptionActive: {
    backgroundColor: "#FFF7ED",
  },
  categoryModalOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryModalOptionLabel: {
    fontSize: 14.5,
    fontWeight: "600",
    color: "#334155",
  },
  categoryModalOptionLabelActive: {
    color: "#EA580C",
    fontWeight: "700",
  },
  categoryModalCloseBtn: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 10,
  },
  categoryModalCloseText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
});

/**
 * Dynamic colour for the numeric value inside an OverviewCard column.
 */
export const getOverviewValColor = (
  isSelected: boolean,
  isDark: boolean,
  item: { color: string; isAll?: boolean },
) => ({
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
});

/**
 * Dynamic style for the sub-label text inside an OverviewCard column.
 */
export const getOverviewSubStyle = (
  isSelected: boolean,
  isDark: boolean,
  colors: any,
) => ({
  color: isDark
    ? isSelected
      ? "#FFFFFF"
      : colors.textSecondary
    : isSelected
      ? "#0A2346"
      : "#64748B",
  fontWeight: (isSelected ? "700" : "500") as "700" | "500",
});

/**
 * Dynamic style for the label text inside a CategoryTabsRow tab.
 */
export const getCategoryTabLabelStyle = (isActive: boolean) => ({
  color:      isActive ? "#FF5722" : "#0A2346",
  fontWeight: (isActive ? "700" : "600") as "700" | "600",
});
