import { StyleSheet } from "react-native";
import { BrandColors, Typography } from "../../../../../shared/theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  headerIcon: {
    marginTop: 2,
  },
  headerTextContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: "#64748B",
    lineHeight: 18,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  requiredStar: {
    color: "#EF4444",
  },
  optionalTag: {
    fontSize: Typography.fontSize.xs,
    color: "#64748B",
    fontWeight: "normal",
  },
  helperText: {
    fontSize: Typography.fontSize.xs,
    color: "#64748B",
    marginTop: 4,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: "#EF4444",
    marginTop: 4,
  },
  input: {
    backgroundColor: BrandColors.WHITE,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: Typography.fontSize.base,
    color: "#0F172A",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  statusRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  statusChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: BrandColors.WHITE,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statusChipActive: {
    backgroundColor: BrandColors.WHITE,
    borderColor: "#EA580C",
    borderWidth: 1.5,
  },
  statusChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "500",
    color: "#64748B",
  },
  statusChipTextActive: {
    color: "#EA580C",
    fontWeight: "700",
  },
  subCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  subCardTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 10,
  },
  itrBox: {
    backgroundColor: "#FFFBF5",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FED7AA",
    marginTop: 4,
  },
  itrHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  itrBoxTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "700",
    color: "#0F172A",
  },
  itrLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
  },
  ifscInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  ifscLoadingText: {
    fontSize: Typography.fontSize.xs,
    color: "#EA580C",
    fontWeight: "500",
  },
  ifscSuccessText: {
    fontSize: Typography.fontSize.xs,
    color: "#16A34A",
    fontWeight: "600",
  },
});
