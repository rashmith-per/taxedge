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
    marginTop: 8,
  },
  statusChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statusChipActive: {
    backgroundColor: "#EFF6FF",
    borderColor: BrandColors.PRIMARY_BLUE,
  },
  statusChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "500",
    color: "#64748B",
  },
  statusChipTextActive: {
    color: BrandColors.PRIMARY_BLUE,
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
});
