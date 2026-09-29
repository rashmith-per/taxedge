import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  fieldGroup: {
    marginTop: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  requiredStar: {
    color: "#EF4444",
  },
  dateContainer: {
    height: 44,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  dateText: {
    fontSize: 13,
    color: "#0F172A",
    flex: 1,
  },
  placeholderText: {
    fontSize: 13,
    color: "#94A3B8",
    flex: 1,
  },
  iosModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  iosPickerContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  iosHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  iosTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  iosDoneButton: {
    fontSize: 15,
    fontWeight: "600",
    color: "#EA580C",
  },
});
