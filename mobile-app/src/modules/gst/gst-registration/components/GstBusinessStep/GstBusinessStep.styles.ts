/**
 * Component: GstBusinessStep
 * Migrated from internal StyleSheet to external styles module.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import { StyleSheet, Platform } from "react-native";
import { BrandColors } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13.5,
    fontWeight: "600",
    color: BrandColors.TEXT_PRIMARY,
    marginBottom: 6,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
    marginTop: 10,
    marginBottom: 14,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  accordionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  accordionContent: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  halfField: {
    width: "48%",
  },
  input: {
    height: 50,
    backgroundColor: BrandColors.WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    fontSize: 14,
    color: BrandColors.TEXT_PRIMARY,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  inputReadOnly: {
    backgroundColor: "#F8FAFC",
    color: "#475569",
  },
  errorText: {
    fontSize: 11.5,
    color: "#DC2626",
    marginTop: 4,
    fontWeight: "500",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  lookupIndicator: {
    marginTop: 5,
    alignSelf: "flex-start",
  },
  lookupInfoText: {
    color: "#64748B",
    fontSize: 11.5,
    marginTop: -6,
    marginBottom: 10,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    minHeight: 38,
    paddingVertical: 6,
  },
  locationButtonText: {
    color: BrandColors.PRIMARY_ORANGE,
    fontSize: 13,
    fontWeight: "600",
  },
  selectInput: {
    height: 50,
    backgroundColor: BrandColors.WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    fontSize: 14,
    color: BrandColors.TEXT_PRIMARY,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  placeholderText: {
    color: "#94A3B8",
  },
  proofGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  proofPill: {
    width: "48%",
    paddingVertical: 13,
    paddingHorizontal: 10,
    backgroundColor: BrandColors.WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  proofPillSelected: {
    backgroundColor: "#FEF0E6",
    borderColor: BrandColors.PRIMARY_ORANGE,
  },
  proofPillText: {
    fontSize: 12.5,
    fontWeight: "500",
    color: BrandColors.TEXT_PRIMARY,
    textAlign: "center",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  proofPillTextSelected: {
    color: BrandColors.PRIMARY_ORANGE,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: 16,
    padding: 20,
    maxHeight: 380,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
    marginBottom: 14,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalOptionSelected: {
    backgroundColor: "#F8FAFC",
  },
  modalOptionText: {
    fontSize: 14,
    color: BrandColors.TEXT_PRIMARY,
    fontWeight: "500",
  },
  modalOptionTextSelected: {
    color: BrandColors.PRIMARY_BLUE,
    fontWeight: "700",
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
    marginBottom: 8,
  },
  checkboxTouch: {
    marginRight: 10,
    marginTop: 2,
  },
  consentText: {
    flex: 1,
    fontSize: 13,
    color: BrandColors.TEXT_PRIMARY,
    lineHeight: 20,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  dateInput: {
    height: 50,
    backgroundColor: BrandColors.WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  // Shared UniversalDatePicker, styled to match the existing GST date fields.
  datePickerContainer: {
    marginBottom: 0,
  },
  datePickerInput: {
    paddingHorizontal: 10,
    gap: 6,
  },
  datePickerText: {
    fontSize: 13,
    fontWeight: "400",
    color: BrandColors.TEXT_PRIMARY,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  leftIcon: {
    marginRight: 10,
  },
  calendarModalContent: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  monthYearNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  navArrow: {
    padding: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  monthYearDisplay: {
    flex: 1,
    alignItems: "center",
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: "600",
  },
  yearQuickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  yearChip: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  yearChipText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },
  weekdaysRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCellEmpty: {
    width: "14.28%",
    height: 40,
  },
  dayCell: {
    width: "14.28%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  dayCellText: {
    fontSize: 14,
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 24,
    gap: 12,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalConfirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalConfirmText: {
    color: BrandColors.WHITE,
    fontSize: 14,
    fontWeight: "600",
  },
});
