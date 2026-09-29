/**
 * Screen: Create Profile
 * Migrated from internal StyleSheet to external styles module.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import { StyleSheet, Platform } from "react-native";
import {
  BrandColors,
  BorderRadius,
  Spacing,
  Typography,
} from "../../../shared/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    marginTop: 4,
    fontWeight: Typography.fontWeight.medium,
    color: "#DC2626",
  },
  profileScroll: {
    flexGrow: 1,
  },
  waveHeaderWrapper: {
    height: 150,
    width: "100%",
    position: "relative",
  },
  waveHeaderContent: {
    paddingHorizontal: Spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    minHeight: 44,
  },
  backBtnWhite: {
    position: "absolute",
    left: 0,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitleWhite: {
    fontSize: Typography.fontSize.hero,
    fontWeight: Typography.fontWeight.extraBold,
    color: BrandColors.WHITE,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  formSection: {
    gap: 2,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.base,
  },
  fieldContainer: {
    marginBottom: Spacing.base - 2,
  },
  label: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: 6,
    color: BrandColors.PRIMARY_BLUE_DARK,
  },
  inputBox: {
    height: 52,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base - 2,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.WHITE,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    height: "100%",
    color: BrandColors.TEXT_PRIMARY,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
  rightIconTouch: {
    marginLeft: Spacing.sm,
    padding: 4,
  },
  submitBtnOrange: {
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    height: 54,
    borderRadius: BorderRadius.base - 2,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    ...Platform.select({
      ios: {
        shadowColor: BrandColors.PRIMARY_ORANGE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
  submitBtnText: {
    color: BrandColors.WHITE,
    fontSize: Typography.fontSize.lg + 1,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.3,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  alreadyText: {
    fontSize: Typography.fontSize.base,
    color: BrandColors.PRIMARY_BLUE_DARK,
    fontWeight: Typography.fontWeight.medium,
  },
  loginLinkText: {
    fontSize: Typography.fontSize.base,
    color: BrandColors.PRIMARY_ORANGE,
    fontWeight: Typography.fontWeight.bold,
  },
  dropdownText: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: BrandColors.TEXT_PRIMARY,
    fontWeight: Typography.fontWeight.medium,
  },
  customerTypeModalContent: {
    width: "100%",
    maxWidth: 360,
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
  customerTypeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm + 2,
    marginBottom: 4,
  },
  customerTypeOptionSelected: {
    backgroundColor: "#FFF7ED",
  },
  customerTypeOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerTypeOptionText: {
    fontSize: Typography.fontSize.md,
    color: "#334155",
    fontWeight: Typography.fontWeight.medium,
  },
  customerTypeOptionTextSelected: {
    color: BrandColors.PRIMARY_ORANGE,
    fontWeight: Typography.fontWeight.bold,
  },
  selectedBadge: {
    backgroundColor: "#FFEDD5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  selectedBadgeText: {
    fontSize: Typography.fontSize.xs,
    color: BrandColors.PRIMARY_ORANGE_DARK,
    fontWeight: Typography.fontWeight.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  calendarModalContent: {
    width: "100%",
    maxWidth: 360,
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
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.base,
  },
  calendarTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  monthYearNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F0F4FA",
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  navArrow: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#E2EDFB",
  },
  monthYearDisplay: {
    alignItems: "center",
  },
  monthYearText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  yearQuickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 6,
  },
  yearChip: {
    flex: 1,
    backgroundColor: BrandColors.WHITE,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  yearChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.PRIMARY_BLUE,
  },
  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  weekdayText: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.TEXT_SECONDARY,
    width: 38,
    textAlign: "center",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 18,
  },
  dayCellEmpty: {
    width: "14.28%",
    height: 38,
  },
  dayCell: {
    width: "14.28%",
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  dayCellText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BrandColors.WHITE,
  },
  modalCancelText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.WHITE,
  },
  stepIndicatorWrapper: {
    marginTop: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  stepPill: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  stepPillText: {
    color: BrandColors.WHITE,
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.semiBold,
    letterSpacing: 0.5,
  },
  inputBoxDisabled: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },
  inputDisabled: {
    color: "#475569",
  },
  disabledBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 6,
  },
  disabledBadgeText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.semiBold,
    color: "#475569",
  },
  sectionHeader: {
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.PRIMARY_BLUE_DARK,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.xs + 1,
    color: BrandColors.TEXT_SECONDARY,
    marginTop: 2,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.8,
    borderColor: BrandColors.BORDER,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 2,
    backgroundColor: BrandColors.WHITE,
  },
  checkboxChecked: {
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderColor: BrandColors.PRIMARY_ORANGE,
  },
  termsText: {
    flex: 1,
    fontSize: Typography.fontSize.xs + 1,
    color: BrandColors.TEXT_SECONDARY,
    lineHeight: 18,
  },
  termsLink: {
    color: BrandColors.PRIMARY_ORANGE,
    fontWeight: Typography.fontWeight.bold,
  },
  submitBtnDisabled: {
    backgroundColor: "#CBD5E1",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnTextDisabled: {
    color: "#64748B",
  },
  customerTypeContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.base,
    marginTop: Spacing.base,
  },
  customerTypeCard: {
    backgroundColor: BrandColors.WHITE,
    borderWidth: 1.5,
    borderColor: BrandColors.BORDER,
    borderRadius: BorderRadius.base,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  customerTypeCardSelected: {
    borderColor: BrandColors.PRIMARY_ORANGE,
    backgroundColor: "#FFF7ED",
    borderWidth: 2,
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F0F4FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardIconContainerSelected: {
    backgroundColor: "#FFEDD5",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.TEXT_PRIMARY,
    marginBottom: 2,
  },
  cardTitleSelected: {
    color: BrandColors.PRIMARY_ORANGE_DARK,
  },
  cardSubtitle: {
    fontSize: Typography.fontSize.xs + 1,
    color: BrandColors.TEXT_SECONDARY,
    lineHeight: 16,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  radioCircleSelected: {
    borderColor: BrandColors.PRIMARY_ORANGE,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
  },
  fixedBottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BrandColors.WHITE,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingHorizontal: Spacing.lg,
    paddingTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 10,
      },
      default: {},
    }),
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
  stateSearchBox: {
    height: 44,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  stateSearchInput: {
    flex: 1,
    fontSize: 14,
    color: BrandColors.TEXT_PRIMARY,
    marginLeft: 8,
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
  genderModalContent: {
    width: "100%",
    maxWidth: 340,
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
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    borderRadius: 8,
  },
  genderOptionSelected: {
    backgroundColor: "#FFF7ED",
  },
  genderOptionText: {
    fontSize: 15,
    color: BrandColors.TEXT_PRIMARY,
  },
  genderOptionTextSelected: {
    color: BrandColors.PRIMARY_ORANGE,
    fontWeight: Typography.fontWeight.bold,
  },
  cityPinRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  cityCol: {
    flex: 6,
  },
  pinCol: {
    flex: 4,
  },
  labelWithActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  addAddressLineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FDBA74",
  },
  addAddressLineBtnText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.PRIMARY_ORANGE,
  },
});
