import { StyleSheet, Platform } from "react-native";
import {
  BrandColors,
  BorderRadius,
  BorderWidth,
  Spacing,
  Typography,
} from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.BACKGROUND,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingBottom: 10,
    backgroundColor: BrandColors.WHITE,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    borderWidth: BorderWidth.thin,
    borderColor: BrandColors.BORDER,
    backgroundColor: BrandColors.WHITE,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleGroup: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.base + 1,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: BrandColors.PRIMARY_ORANGE,
    marginTop: 1,
  },
  headerRightSpacer: {
    width: 38,
  },
  progressTrack: {
    height: 3,
    backgroundColor: "#E2E8F0",
    width: "100%",
  },
  progressFill: {
    height: "100%",
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    width: "60%", // Step 3 of 5
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: 40,
  },

  // Review Summary Card

  // Info Grid in Review Cards
  infoGrid: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: Typography.fontSize.xs + 1,
    color: BrandColors.TEXT_SECONDARY,
  },
  infoValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.TEXT_PRIMARY,
    maxWidth: "60%",
    textAlign: "right",
  },

  // Documents chip list in review
  docPillList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  docPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
    borderWidth: BorderWidth.thin,
    borderColor: "#BBF7D0",
    gap: 4,
  },
  docPillText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: "#16A34A",
  },

  // Sticky Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BrandColors.WHITE,
    paddingHorizontal: Spacing.base,
    paddingTop: 10,
    borderTopWidth: BorderWidth.thin,
    borderTopColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  proceedButton: {
    height: 50,
    borderRadius: BorderRadius.base,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  proceedButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.WHITE,
  },
});
