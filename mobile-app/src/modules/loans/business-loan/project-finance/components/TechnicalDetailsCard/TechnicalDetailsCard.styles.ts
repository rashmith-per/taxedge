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
  fieldGroup: {
    marginTop: 12,
  },
  rowThreeCols: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
  },
  requiredStar: {
    color: "#EF4444",
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 12,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  pickerContainer: {
    height: 42,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  pickerText: {
    fontSize: 11,
    color: "#0F172A",
  },
  placeholderText: {
    fontSize: 11,
    color: "#94A3B8",
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 42,
    gap: 8,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: "#F97316",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F97316",
  },
  radioLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#334155",
  },
});
