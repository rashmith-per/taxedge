import { StyleSheet } from "react-native";
import { BrandColors, Typography, Spacing, BorderRadius } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.xl,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: Spacing.md,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F172A",
  },
  cardDescription: {
    fontSize: Typography.fontSize.xs,
    color: "#64748B",
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: "#334155",
    marginBottom: 6,
  },
  requiredStar: {
    color: "#EF4444",
  },
  optionalTag: {
    fontSize: Typography.fontSize.xs - 1,
    color: "#94A3B8",
    fontWeight: "normal",
  },
  helperText: {
    fontSize: Typography.fontSize.xs - 1,
    color: "#64748B",
    marginTop: 4,
  },
  errorText: {
    fontSize: Typography.fontSize.xs - 1,
    color: "#EF4444",
    marginTop: 4,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: Typography.fontSize.sm,
    color: "#0F172A",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  ifscLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  ifscSuccessBox: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#86EFAC",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 6,
  },
  ifscSuccessText: {
    fontSize: 11,
    color: "#166534",
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  statusChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: BorderRadius.sm,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  statusChipActive: {
    backgroundColor: "#FEF0E6",
    borderColor: BrandColors.PRIMARY_ORANGE,
  },
  statusChipText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: "#64748B",
  },
  statusChipTextActive: {
    color: BrandColors.PRIMARY_ORANGE_DARK || "#EA580C",
    fontWeight: Typography.fontWeight.bold,
  },
});
