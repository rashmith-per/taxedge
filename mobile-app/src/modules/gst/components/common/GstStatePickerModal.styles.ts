import { StyleSheet, Platform } from "react-native";
import { BrandColors, BorderRadius, Spacing, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  stateModalContent: {
    width: "100%",
    maxWidth: 380,
    height: "78%",
    backgroundColor: BrandColors.WHITE,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.base,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.PRIMARY_BLUE_DARK,
  },
  closeBtn: {
    padding: 4,
  },
  searchBox: {
    height: 44,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: BrandColors.TEXT_PRIMARY,
    marginLeft: 8,
    paddingVertical: 0,
  },
  stateList: {
    flex: 1,
  },
  stateItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
    borderRadius: 8,
  },
  stateItemSelected: {
    backgroundColor: "#FFF7ED",
  },
  stateItemText: {
    fontSize: 14.5,
    color: BrandColors.TEXT_PRIMARY,
  },
  stateItemTextSelected: {
    color: BrandColors.PRIMARY_ORANGE,
    fontWeight: Typography.fontWeight.bold,
  },
});
