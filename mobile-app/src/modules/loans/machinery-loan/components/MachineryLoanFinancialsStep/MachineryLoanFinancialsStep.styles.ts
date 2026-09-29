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
  customFieldWrapper: {
    marginTop: 12,
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
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipActive: {
    backgroundColor: "#EFF6FF",
    borderColor: BrandColors.PRIMARY_BLUE,
  },
  chipText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: "500",
    color: "#475569",
  },
  chipTextActive: {
    color: BrandColors.PRIMARY_BLUE,
    fontWeight: "700",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: BrandColors.WHITE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "500",
    color: "#64748B",
  },
  toggleTextActive: {
    color: BrandColors.PRIMARY_BLUE,
    fontWeight: "700",
  },
  tenureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tenureBox: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tenureBoxActive: {
    backgroundColor: "#EFF6FF",
    borderColor: BrandColors.PRIMARY_BLUE,
  },
  tenureText: {
    fontSize: Typography.fontSize.sm,
    color: "#475569",
  },
  tenureTextActive: {
    color: BrandColors.PRIMARY_BLUE,
    fontWeight: "700",
  },
});
