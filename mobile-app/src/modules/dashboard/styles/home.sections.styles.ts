import { Platform, StyleSheet } from "react-native";
import type { ThemeTokens } from "@/shared/constants/theme";
import {
  BrandColors,
  BorderRadius,
  Spacing,
  Typography,
} from "@/shared/theme";
import {
  CARD_WIDTH,
  SERVICE_CARD_WIDTH,
} from "./home.header.styles";

export const homeSectionStyles = {
  /* Generic card */
  card: {
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    paddingVertical: Spacing.base,
  },
  cardPadded: {
    paddingHorizontal: Spacing.base,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.extraBold,
  },
  viewAllText: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: Typography.fontWeight.bold,
  },

  /* 8-Card Services Grid */
  servicesGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    justifyContent: "space-between" as const,
    rowGap: 10,
    marginBottom: Spacing.sm,
  },
  serviceCard: {
    width: SERVICE_CARD_WIDTH,
    borderRadius: 14,
    borderWidth: 1,
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 2,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    minHeight: 106,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  serviceIconImage: {
    width: Math.min(54, Math.floor(SERVICE_CARD_WIDTH * 0.72)),
    height: Math.min(54, Math.floor(SERVICE_CARD_WIDTH * 0.72)),
    marginBottom: 6,
  },
  serviceCardLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    textAlign: "center" as const,
    lineHeight: 13,
  },

  /* All services sheet */
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(5,39,80,0.45)",
    justifyContent: "flex-end" as const,
  },
  sheet: {
    height: "92%" as const,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingTop: 18,
  },
  sheetHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: Spacing.base - 2,
  },
  sheetTitle: {
    fontSize: Typography.fontSize.xxl - 1,
    fontWeight: Typography.fontWeight.extraBold,
  },
  sheetDone: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  sheetSearch: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.base - 2,
  },
  sheetSearchInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    padding: 0,
  },
  sheetScrollContent: {
    paddingTop: 6,
    paddingBottom: Spacing.md,
  },

  /* Catalogue groups */
  catHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    marginTop: 18,
    marginBottom: 10,
  },
  catIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  catTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  serviceRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  serviceRowText: {
    fontSize: Typography.fontSize.md - 0.5,
    fontWeight: Typography.fontWeight.medium,
  },
  sheetEmpty: {
    alignItems: "center" as const,
    gap: 10,
    paddingVertical: 56,
  },
  sheetEmptyText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
  },
  dotsRow: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    gap: 6,
    marginTop: 14,
  },
  pageDot: {
    borderRadius: 4,
  },

  /* List rows */
  emptyText: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: Typography.fontWeight.medium,
    textAlign: "center" as const,
    paddingVertical: Spacing.md,
  },

  /* Stats grid */
  statsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
  },
  statsCard: {
    width: (CARD_WIDTH - 12) / 2,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    padding: 14,
  },
  statsTop: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    justifyContent: "space-between" as const,
    gap: 8,
  },
  statsLabel: {
    flex: 1,
    fontSize: Typography.fontSize.sm + 0.5,
    fontWeight: Typography.fontWeight.semiBold,
    lineHeight: 16,
  },
  statsIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  statsNumber: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.extraBold,
    marginTop: Spacing.md,
  },

  /* Upcoming deadlines */
  deadlineRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    paddingVertical: 13,
  },
  deadlineRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  deadlineTag: {
    minWidth: 44,
    paddingHorizontal: Spacing.sm,
    height: 26,
    borderRadius: BorderRadius.sm,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  deadlineTagText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.extraBold,
  },
  deadlineText: {
    flex: 1,
  },
  deadlineTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  deadlineDate: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginTop: 3,
  },
  duePill: {
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 12,
    justifyContent: "center" as const,
  },
  duePillText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.extraBold,
  },

  /* Recent application cards */
  appCard: {
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    padding: Spacing.base,
  },
  appCardTop: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    gap: 10,
  },
  appId: {
    fontSize: Typography.fontSize.sm + 0.5,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.3,
  },
  statusPill: {
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 12,
    justifyContent: "center" as const,
  },
  statusPillText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  appName: {
    fontSize: Typography.fontSize.lg + 1,
    fontWeight: Typography.fontWeight.extraBold,
    marginTop: 10,
  },
  appCardBottom: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginTop: 14,
  },
  appDate: {
    fontSize: Typography.fontSize.sm + 0.5,
    fontWeight: Typography.fontWeight.medium,
  },
  linkRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 2,
  },

  /* Section headers */
  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.extraBold,
  },

  /* Need help */
  helpCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 14,
    backgroundColor: "#0B5B41",
    borderRadius: 18,
    padding: Spacing.base,
    marginTop: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  helpIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.16)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  helpText: {
    flex: 1,
  },
  helpTitle: {
    color: BrandColors.WHITE,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.extraBold,
  },
  helpDesc: {
    color: "#C7E5D8",
    fontSize: Typography.fontSize.sm + 0.5,
    fontWeight: Typography.fontWeight.medium,
    marginTop: 3,
  },
  helpBtn: {
    paddingHorizontal: 18,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center" as const,
  },
  helpBtnText: {
    color: BrandColors.WHITE,
    fontSize: Typography.fontSize.sm + 1.5,
    fontWeight: Typography.fontWeight.extraBold,
  },
  draftBannerCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  draftTopRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  draftTag: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  draftTagText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  draftSavedTime: {
    fontSize: 11.5,
  },
  draftTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  draftSubtitle: {
    fontSize: 12.5,
    marginBottom: 12,
  },
  draftFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  draftResumeText: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
};

export type { ThemeTokens };

export const getServiceCardThemedStyle = (isDark: boolean, colors: ThemeTokens) => ({
  backgroundColor: isDark ? String(colors.backgroundElement) : "#FFFFFF",
  borderColor: isDark ? String(colors.border) : "#E2E8F0",
});

export const getServiceLabelThemedStyle = (isDark: boolean, colors: ThemeTokens) => ({
  color: isDark ? String(colors.text) : "#0A2540",
});

export const getDraftCardThemedStyle = (
  isDark: boolean,
  colors: ThemeTokens,
  accentColor: string,
  lightBg: string,
  lightBorder: string,
) => ({
  backgroundColor: isDark ? String(colors.backgroundElement) : lightBg,
  borderColor: accentColor,
  shadowColor: accentColor,
  borderTopColor: isDark ? String(colors.border) : lightBorder,
});

export const getHeroHeaderStyle = (colors: ThemeTokens, topInset: number) => ({
  backgroundColor: String(colors.primaryDark),
  paddingTop: topInset,
});

export const getThemedCardStyle = (colors: ThemeTokens) => ({
  backgroundColor: String(colors.backgroundElement),
  borderColor: String(colors.border),
});
