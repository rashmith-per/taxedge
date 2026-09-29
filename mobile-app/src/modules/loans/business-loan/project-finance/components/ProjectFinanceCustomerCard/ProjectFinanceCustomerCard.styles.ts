import { StyleSheet } from "react-native";
import { BrandColors, Typography } from "../../../../../../shared/theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: "700",
    color: BrandColors.PRIMARY_BLUE,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
  },
  verifiedText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: "600",
    color: "#16A34A",
  },
  infoBanner: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: BrandColors.PRIMARY_BLUE,
  },
  infoBannerText: {
    fontSize: Typography.fontSize.xs,
    color: "#475569",
    lineHeight: 16,
  },
  detailsGrid: {
    rowGap: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  detailLabel: {
    fontSize: Typography.fontSize.sm,
    color: "#64748B",
    fontWeight: "500",
    flex: 1,
  },
  detailValue: {
    fontSize: Typography.fontSize.sm,
    color: "#0F172A",
    fontWeight: "600",
    flex: 1.5,
    textAlign: "right",
  },
});
