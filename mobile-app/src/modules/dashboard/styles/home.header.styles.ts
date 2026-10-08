import { Dimensions, Platform } from "react-native";
import {
  BrandColors,
  BorderRadius,
  Spacing,
  Typography,
} from "@/shared/theme";

const { width } = Dimensions.get("window");
export const H_PADDING = Spacing.base;
export const BANNER_HEIGHT = 168;
export const CARD_WIDTH = width - H_PADDING * 2;
export const GRID_GAP = 8;
export const SERVICE_CARD_WIDTH = Math.floor((CARD_WIDTH - GRID_GAP * 3) / 4);

export const homeHeaderStyles = {
  container: {
    flex: 1,
  },
  quickRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
  },
  quickTile: {
    alignItems: "center" as const,
    flex: 1,
  },
  circleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 6,
  },
  circleLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    textAlign: "center" as const,
  },

  /* Header */
  heroHeader: {
    paddingHorizontal: H_PADDING,
    paddingBottom: Spacing.md,
  },
  topHeaderRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  menuBtn: {
    paddingRight: Spacing.md,
  },
  brandContainer: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    backgroundColor: BrandColors.WHITE,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  logo: {
    width: 28,
    height: 28,
  },
  brandText: {
    color: BrandColors.WHITE,
    fontSize: Typography.fontSize.lg + 1,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 1.2,
  },
  brandSubText: {
    color: "#B9CBE4",
    fontSize: Typography.fontSize.xs - 2,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 2,
    marginTop: 1,
  },
  headerIcons: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 14,
  },
  iconBtn: {
    padding: 2,
  },
  badge: {
    position: "absolute" as const,
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 2,
    borderColor: "#052750",
  },
  badgeText: {
    color: BrandColors.WHITE,
    fontSize: 10,
    fontWeight: Typography.fontWeight.extraBold,
  },

  greetingRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: Spacing.md,
  },
  greetingContainer: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  welcomeText: {
    color: BrandColors.WHITE,
    fontSize: Typography.fontSize.xxl + 1,
    fontWeight: Typography.fontWeight.extraBold,
  },
  welcomeSubText: {
    color: "#CBD9EA",
    fontSize: Typography.fontSize.base,
    marginTop: 5,
    fontWeight: Typography.fontWeight.medium,
  },

  /* Scroll body */
  scrollContent: {
    padding: H_PADDING,
    gap: Spacing.base,
  },

  /* Banner */
  loansBanner: {
    height: BANNER_HEIGHT,
    borderRadius: BorderRadius.base,
    padding: Spacing.lg,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    overflow: "hidden" as const,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
  bannerLeft: {
    flex: 1.4,
  },
  bannerTitle: {
    color: BrandColors.WHITE,
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 1,
  },
  bannerDesc: {
    color: "#C9D8EC",
    fontSize: Typography.fontSize.sm + 1.5,
    marginTop: 5,
    fontWeight: Typography.fontWeight.semiBold,
  },
  exploreButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 18,
    height: 36,
    borderRadius: 18,
    alignSelf: "flex-start" as const,
    marginTop: Spacing.base,
  },
  exploreText: {
    color: BrandColors.WHITE,
    fontWeight: Typography.fontWeight.extraBold,
    fontSize: Typography.fontSize.sm + 1,
  },
  dotGrid: {
    position: "absolute" as const,
    right: 118,
    top: 26,
    width: 34,
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 6,
    opacity: 0.55,
  },
  decorDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
  },
  bannerRight: {
    flex: 0.9,
    alignItems: "flex-end" as const,
  },
  bannerIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(249,115,22,0.16)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  bannerPage: {
    width: CARD_WIDTH,
  },
};
