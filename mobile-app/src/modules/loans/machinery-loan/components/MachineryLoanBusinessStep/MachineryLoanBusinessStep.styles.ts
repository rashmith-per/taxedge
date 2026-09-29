import { StyleSheet } from "react-native";
import { BrandColors, Typography } from "../../../../../shared/theme";

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
  vintageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  vintageChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  vintageChipActive: {
    backgroundColor: "#EFF6FF",
    borderColor: BrandColors.PRIMARY_BLUE,
  },
  vintageChipText: {
    fontSize: Typography.fontSize.sm,
    color: "#475569",
  },
  vintageChipTextActive: {
    color: BrandColors.PRIMARY_BLUE,
    fontWeight: "700",
  },
  customFieldWrapper: {
    marginTop: 12,
  },
  toggleContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: BrandColors.WHITE,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#EFF6FF",
    borderColor: BrandColors.PRIMARY_BLUE,
  },
  toggleText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "600",
    color: "#64748B",
  },
  toggleTextActive: {
    color: BrandColors.PRIMARY_BLUE,
    fontWeight: "700",
  },
});

