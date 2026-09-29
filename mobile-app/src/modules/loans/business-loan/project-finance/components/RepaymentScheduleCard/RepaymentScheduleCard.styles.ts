import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFF3EB",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 8,
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: "row",
    backgroundColor: "#F0F7FF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E0EEFF",
  },
  summaryCol: {
    flex: 1,
    paddingHorizontal: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "500",
  },
  summaryVal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E3A8A",
    marginTop: 4,
  },
  tableWrapper: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 10,
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1E3A8A",
    paddingHorizontal: 8,
  },
  tableDataRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  tableDataCell: {
    fontSize: 11,
    color: "#334155",
    paddingHorizontal: 8,
  },
  cellYear: {
    width: 65,
  },
  cellOpening: {
    width: 120,
    textAlign: "right",
  },
  cellPrincipal: {
    width: 95,
    textAlign: "right",
  },
  cellInterest: {
    width: 90,
    textAlign: "right",
  },
  cellTotal: {
    width: 110,
    textAlign: "right",
  },
  cellClosing: {
    width: 120,
    textAlign: "right",
  },
});
