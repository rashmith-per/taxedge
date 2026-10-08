import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { Application } from "@/types/domain";
import { styles } from "@/styles/app/(main)/applications.styles";
import { ApplicationCardAvatar } from "./ApplicationIcons";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function formatDisplayDate(dateStr?: string): string {
  return !dateStr
    ? ""
    : MONTH_NAMES.some((m) => dateStr.includes(m))
      ? dateStr
      : (() => {
          try {
            const d = new Date(dateStr);
            return !isNaN(d.getTime())
              ? `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
              : dateStr;
          } catch {
            return dateStr;
          }
        })();
}

interface StatusBadgeConfig {
  matcher: (lower: string) => boolean;
  bg: string;
  text: string;
  label: string;
}

const STATUS_CONFIGS: StatusBadgeConfig[] = [
  {
    matcher: (s) =>
      s.includes("complete") ||
      s.includes("disbursed") ||
      s.includes("active") ||
      s.includes("approved"),
    bg: "#E0F2FE",
    text: "#083B75",
    label: "Completed",
  },
  {
    matcher: (s) => s.includes("submit"),
    bg: "#E0F2FE",
    text: "#083B75",
    label: "Submitted",
  },
  {
    matcher: (s) => s.includes("officer"),
    bg: "#FFF1E8",
    text: "#EA580C",
    label: "Officer Review",
  },
  {
    matcher: (s) => s.includes("verification"),
    bg: "#F3E8FF",
    text: "#7E22CE",
    label: "Under Verification",
  },
  {
    matcher: (s) =>
      s.includes("process") ||
      s.includes("calculation") ||
      s.includes("quote") ||
      s.includes("progress"),
    bg: "#E0F2FE",
    text: "#0284C7",
    label: "Processing",
  },
  {
    matcher: (s) => s.includes("credit"),
    bg: "#FFF1E8",
    text: "#EA580C",
    label: "Credit Review",
  },
];

export function getStatusBadgeStyle(status?: string) {
  const lower = (status || "").toLowerCase();
  const matched = STATUS_CONFIGS.find((cfg) => cfg.matcher(lower));
  return (
    matched ?? {
      bg: "#EAF2FF",
      text: "#083B75",
      label: status || "Submitted",
    }
  );
}

const NON_CORE_SECTIONS = [
  "Bank Accounts",
  "Authorised Signatories",
  "Contact Details",
];

interface ApplicationCardItemProps {
  item: Application;
  isDark: boolean;
  textColor: string;
  borderColor: string;
  bgColor: string;
  onPress: (item: Application) => void;
}

export function ApplicationCardItem({
  item,
  isDark,
  textColor,
  borderColor,
  bgColor,
  onPress,
}: ApplicationCardItemProps) {
  const badge = getStatusBadgeStyle(item.status);
  const isDraft = item.status === "Draft" || Boolean(item.formData?.isDraft);
  const pendingDocsCount = item.documents.filter(
    (doc) => doc.status === "Pending"
  ).length;
  const isGstAmendment = item.serviceId === "gst-amendment";
  const isGstCancellation = item.serviceId === "gst-cancellation";
  const idColor =
    item.category === "BUSINESS" || item.category === "LOANS"
      ? "#EA580C"
      : "#083B75";
  const formattedDate = formatDisplayDate(item.createdAt);
  const displayId =
    (isGstAmendment || isGstCancellation) && item.formData?.arn
      ? item.formData.arn
      : item.id;
  const displayName = isGstCancellation
    ? "GST Cancellation (REG-16)"
    : isGstAmendment && item.formData?.section
      ? `GST Amendment — ${item.formData.section}`
      : item.serviceName;

  const isNonCore =
    String(item.formData?.isCore).toLowerCase() === "false" ||
    Boolean(item.formData?.amendmentCategory?.toLowerCase().includes("non-core")) ||
    (item.formData?.section
      ? NON_CORE_SECTIONS.some((s) => item.formData?.section?.includes(s))
      : false);
  const isCore = !isNonCore;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(item)}
      style={[
        styles.appCard,
        {
          backgroundColor: bgColor,
          borderColor,
        },
      ]}
    >
      <ApplicationCardAvatar
        category={item.category}
        serviceId={item.serviceId}
        serviceName={item.serviceName}
      />
      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <Text style={[styles.appIdText, { color: idColor }]}>{displayId}</Text>
          <View style={styles.cardBadgeWithArrow}>
            {isDraft ? (
              <View style={styles.resumeBadge}>
                <Text style={styles.resumeBadgeText}>Resume</Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                  {badge.label}
                </Text>
              </View>
            )}
            <Ionicons
              name="chevron-forward"
              size={17}
              color="#EA580C"
              style={styles.cardChevron}
            />
          </View>
        </View>

        <Text
          style={[styles.serviceNameText, { color: textColor }]}
          numberOfLines={1}
        >
          {displayName}
        </Text>

        <View style={styles.cardBottomRow}>
          <View style={styles.metaChip}>
            <Ionicons name="card-outline" size={12} color="#64748B" />
            <Text style={styles.metaChipText}>
              {item.category === "LOANS" && item.formData?.requestedAmount
                ? `₹${Number(item.formData.requestedAmount).toLocaleString("en-IN")}`
                : item.paymentStatus}
            </Text>
          </View>

          {formattedDate ? (
            <View style={styles.dateWrapRight}>
              <Ionicons name="calendar-outline" size={13} color="#64748B" />
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
          ) : null}
        </View>



          {isGstAmendment && item.formData?.gstin ? (
            <View style={[styles.gstinBadge, isDark && styles.gstinBadgeDark]}>
              <Text
                style={[
                  styles.gstinBadgeText,
                  isDark && styles.gstinBadgeTextDark,
                ]}
              >
                {item.formData.gstin}
              </Text>
            </View>
          ) : null}

          {isGstAmendment ? (
            <View
              style={[
                styles.coreBadge,
                isCore
                  ? isDark
                    ? styles.coreBadgeCoreDark
                    : styles.coreBadgeCore
                  : isDark
                    ? styles.coreBadgeNonCoreDark
                    : styles.coreBadgeNonCore,
              ]}
            >
              <Text
                style={[
                  styles.coreBadgeText,
                  isCore
                    ? isDark
                      ? styles.coreBadgeTextCoreDark
                      : styles.coreBadgeTextCore
                    : isDark
                      ? styles.coreBadgeTextNonCoreDark
                      : styles.coreBadgeTextNonCore,
                ]}
              >
                {isCore ? "CORE" : "NON-CORE"}
              </Text>
            </View>
          ) : null}
        </View>
    </TouchableOpacity>
  );
}
