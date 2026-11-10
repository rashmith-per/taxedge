import { StyleSheet, Platform } from "react-native";
import { BrandColors } from "@/shared/theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.BORDER,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  editDocsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF0E6",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FDBA74",
  },
  editDocsButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: BrandColors.PRIMARY_ORANGE,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  uploadedDocList: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: BrandColors.CARD_BORDER,
    gap: 10,
  },
  uploadedDocItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 10,
  },
  uploadedDocTextCol: {
    flex: 1,
  },
  uploadedDocName: {
    fontSize: 13.5,
    color: BrandColors.TEXT_PRIMARY,
    fontWeight: "500",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  uploadedDocSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  eyeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EAF1FE",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyDocText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 10,
  },
});
