import { StyleSheet, Platform } from "react-native";
import {
  BrandColors,
  BorderRadius,
  Spacing,
  Typography,
} from "@/shared/theme";

export const commonStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: 40,
  },

  /* ---------------- HEADERS ---------------- */
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingBottom: 12,
    backgroundColor: "#F8FAFC",
  },
  roundBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EAF1FE",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 14,
  },
  headerMainTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 2,
  },
  placeholderBox: {
    width: 40,
  },

  /* ---------------- TOP INFO BANNER ---------------- */
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EAF1FE",
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 14,
    marginTop: 12,
    marginBottom: 18,
  },
  infoIconBox: {
    marginRight: 10,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.sm + 0.5,
    lineHeight: 20,
    color: "#083B75",
    fontWeight: "500",
  },

  /* ---------------- GSTIN INPUT ---------------- */
  gstinBlock: {
    marginBottom: 20,
  },
  gstinLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  star: {
    color: "#EF4444",
  },
  gstinInput: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.base,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    paddingHorizontal: 16,
    fontSize: Typography.fontSize.base + 1,
    color: "#0F172A",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  gstinInputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  gstinCounterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  charCountText: {
    fontSize: Typography.fontSize.xs + 1,
    color: "#94A3B8",
    fontWeight: "500",
    alignSelf: "flex-end",
  },
  errorText: {
    fontSize: Typography.fontSize.xs + 1.5,
    color: "#DC2626",
    fontWeight: "500",
  },

  /* ---------------- SECTION HEADERS & CARDS ---------------- */
  sectionHeading: {
    fontSize: Typography.fontSize.lg,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
    marginTop: 6,
  },
  cardGroup: {
    gap: 12,
    marginBottom: 24,
  },
  amendmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.base + 2,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardContentCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: Typography.fontSize.base + 1,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "500",
    color: "#64748B",
  },
  cardChevron: {
    marginLeft: 8,
  },

  /* ---------------- CTA BUTTONS ---------------- */
  bottomBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingHorizontal: Spacing.base,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 16 : 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: BrandColors.PRIMARY_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: Typography.fontSize.md,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.8,
    borderColor: BrandColors.PRIMARY_BLUE,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryBtnText: {
    fontSize: Typography.fontSize.md,
    fontWeight: "800",
    color: BrandColors.PRIMARY_BLUE,
  },
  gap8: { gap: 8 },
  gap6: { gap: 6 },
  noDocText: { color: "#94A3B8" },
});
