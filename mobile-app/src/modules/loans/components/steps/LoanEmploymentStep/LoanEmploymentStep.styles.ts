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
  errorText: {
    fontSize: Typography.fontSize.xs - 1,
    color: "#EF4444",
    marginTop: 4,
  },
  // Selection Pills
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    flex: 1,
    minWidth: "30%",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  pillActive: {
    backgroundColor: "#FEF0E6",
    borderColor: BrandColors.PRIMARY_ORANGE,
  },
  pillText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: "#475569",
    textAlign: "center",
  },
  pillTextActive: {
    color: BrandColors.PRIMARY_ORANGE_DARK || "#EA580C",
    fontWeight: Typography.fontWeight.bold,
  },
  // Toggle Switch Container
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: BorderRadius.sm,
    padding: 3,
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: "#64748B",
  },
  toggleTextActive: {
    color: BrandColors.PRIMARY_ORANGE_DARK || "#EA580C",
    fontWeight: Typography.fontWeight.bold,
  },
  // Dropdown Input Selector
  dropdownSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownSelectorActive: {
    borderColor: BrandColors.PRIMARY_ORANGE || "#EA580C",
    backgroundColor: "#FFFBF7",
  },
  dropdownText: {
    fontSize: Typography.fontSize.sm,
    color: "#0F172A",
    fontWeight: Typography.fontWeight.medium,
  },
  dropdownPlaceholder: {
    fontSize: Typography.fontSize.sm,
    color: "#94A3B8",
  },
  customInputContainer: {
    marginTop: 10,
  },
  // Modal Picker Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.base,
    maxHeight: "75%",
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F172A",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  optionItemActive: {
    backgroundColor: "#FEF0E6",
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
  },
  optionText: {
    fontSize: Typography.fontSize.sm,
    color: "#334155",
  },
  optionTextActive: {
    color: BrandColors.PRIMARY_ORANGE_DARK || "#EA580C",
    fontWeight: Typography.fontWeight.bold,
  },
});
