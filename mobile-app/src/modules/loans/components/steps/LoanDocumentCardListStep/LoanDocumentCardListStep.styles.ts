import { StyleSheet } from "react-native";
import { BrandColors, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: "#64748B",
    marginBottom: 16,
  },
  progressContainer: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "600",
    color: "#1E293B",
  },
  progressCount: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "700",
    color: "#EA580C",
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  categoryContainer: {
    marginBottom: 18,
  },
  categoryHeader: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 2,
  },
});

