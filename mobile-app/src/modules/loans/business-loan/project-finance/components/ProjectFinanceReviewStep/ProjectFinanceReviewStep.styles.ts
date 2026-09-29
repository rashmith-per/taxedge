import { StyleSheet } from "react-native";
import { BrandColors, Typography } from "../../../../../../shared/theme";

export const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: "#64748B",
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  cardTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: "700",
    color: "#1E293B",
  },
  editAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: "600",
    color: BrandColors.PRIMARY_BLUE,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    color: "#64748B",
  },
  value: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "right",
    flexShrink: 1,
  },
  highlightValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: "700",
    color: BrandColors.PRIMARY_BLUE,
  },
  docsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  docBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#86EFAC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  docBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#15803D",
  },
  consentContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 8,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: BrandColors.PRIMARY_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: BrandColors.PRIMARY_BLUE,
  },
  consentText: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    color: "#475569",
    lineHeight: 18,
  },
});
