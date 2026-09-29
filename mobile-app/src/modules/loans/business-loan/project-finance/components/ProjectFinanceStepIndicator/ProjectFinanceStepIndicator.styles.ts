import { StyleSheet } from "react-native";
import { BrandColors, Typography } from "../../../../../../shared/theme";

export const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: BrandColors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepItem: {
    alignItems: "center",
    flex: 1,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
  },
  stepCircleActive: {
    backgroundColor: BrandColors.PRIMARY_BLUE,
    borderColor: BrandColors.PRIMARY_BLUE,
  },
  stepCircleCompleted: {
    backgroundColor: "#16A34A",
    borderColor: "#16A34A",
  },
  stepNumber: {
    fontSize: Typography.fontSize.xs,
    fontWeight: "700",
    color: "#64748B",
  },
  stepNumberActive: {
    color: BrandColors.WHITE,
  },
  stepTitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "500",
    textAlign: "center",
  },
  stepTitleActive: {
    color: BrandColors.PRIMARY_BLUE,
    fontWeight: "700",
  },
  stepLine: {
    position: "absolute",
    top: 14,
    left: "50%",
    right: "-50%",
    height: 2,
    backgroundColor: "#E2E8F0",
    zIndex: -1,
  },
  stepLineCompleted: {
    backgroundColor: "#16A34A",
  },
});
