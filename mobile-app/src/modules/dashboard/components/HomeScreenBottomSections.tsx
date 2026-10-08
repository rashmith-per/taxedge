import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "../styles/home.styles";
import type { Deadline, StatTile } from "../types/dashboard.types";

interface FinancialOverviewProps {
  colors: any;
  isDark: boolean;
  stats: StatTile[];
  deadlines: Deadline[];
  onNavigate: (route: any) => void;
}

export function FinancialOverviewSection({
  colors,
  isDark,
  stats,
  deadlines,
  onNavigate,
}: FinancialOverviewProps) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Your Financial Overview
        </Text>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <TouchableOpacity
            key={stat.id}
            activeOpacity={0.85}
            onPress={() => onNavigate(stat.route)}
            style={[
              styles.statsCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.statsTop}>
              <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>
                {stat.label}
              </Text>
              <View
                style={[
                  styles.statsIcon,
                  {
                    backgroundColor: isDark
                      ? colors.backgroundSelected
                      : stat.tintBg,
                  },
                ]}
              >
                <Ionicons
                  name={stat.icon}
                  size={17}
                  color={isDark ? colors.text : stat.tint}
                />
              </View>
            </View>
            <Text style={[styles.statsNumber, { color: stat.tint }]}>
              {stat.value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {deadlines.length > 0 && (
        <View
          style={[
            styles.card,
            styles.cardPadded,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Upcoming Deadlines
          </Text>

          {deadlines.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.75}
              onPress={() => onNavigate(item.route)}
              style={[
                styles.deadlineRow,
                index < deadlines.length - 1 && [
                  styles.deadlineRowBorder,
                  { borderBottomColor: colors.border },
                ],
              ]}
            >
              <View
                style={[
                  styles.deadlineTag,
                  {
                    backgroundColor: isDark
                      ? colors.backgroundSelected
                      : item.tintBg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.deadlineTagText,
                    { color: isDark ? colors.text : item.tint },
                  ]}
                >
                  {item.tag}
                </Text>
              </View>

              <View style={styles.deadlineText}>
                <Text
                  style={[styles.deadlineTitle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.deadlineDate,
                    { color: colors.textSecondary },
                  ]}
                >
                  {item.date}
                </Text>
              </View>

              {item.urgent && (
                <View
                  style={[
                    styles.duePill,
                    {
                      backgroundColor: isDark
                        ? colors.backgroundSelected
                        : "#FDEBEB",
                    },
                  ]}
                >
                  <Text style={[styles.duePillText, { color: colors.error }]}>
                    Due Soon
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );
}

interface RecentApplicationsProps {
  colors: any;
  isDark: boolean;
  recentApps: any[];
  onViewAll: () => void;
  onSelectApplication: (appId: string) => void;
}

export function RecentApplicationsSection({
  colors,
  isDark,
  recentApps,
  onViewAll,
  onSelectApplication,
}: RecentApplicationsProps) {
  const statusTone = (status: string) => {
    if (status === "Completed") return { fg: "#047857", bg: "#E6F5F0" };
    if (status === "Rejected") return { fg: "#B91C1C", bg: "#FDEBEB" };
    if (status === "Verification") return { fg: "#6D28D9", bg: "#F1ECFE" };
    return { fg: "#1D4ED8", bg: "#EAF1FE" };
  };

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Applications
        </Text>
        <TouchableOpacity onPress={onViewAll} hitSlop={8} style={styles.linkRow}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>
            View All
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {recentApps.length === 0 ? (
        <View
          style={[
            styles.card,
            styles.cardPadded,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No applications yet. Start a service to see it here.
          </Text>
        </View>
      ) : (
        recentApps.map((app) => {
          const tone = statusTone(app.status);
          return (
            <TouchableOpacity
              key={app.id}
              activeOpacity={0.85}
              onPress={() => onSelectApplication(app.id)}
              style={[
                styles.appCard,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.appCardTop}>
                <Text style={[styles.appId, { color: colors.success }]}>
                  {app.id}
                </Text>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: isDark
                        ? colors.backgroundSelected
                        : tone.bg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      { color: isDark ? colors.text : tone.fg },
                    ]}
                  >
                    {app.status}
                  </Text>
                </View>
              </View>

              <Text
                style={[styles.appName, { color: colors.text }]}
                numberOfLines={1}
              >
                {app.serviceName}
              </Text>

              <View style={styles.appCardBottom}>
                <Text
                  style={[styles.appDate, { color: colors.textSecondary }]}
                >
                  {app.createdAt}
                </Text>
                <View style={styles.linkRow}>
                  <Text
                    style={[styles.viewAllText, { color: colors.primary }]}
                  >
                    View Details
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={colors.primary}
                  />
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </>
  );
}

export function HelpSection({ onChatSupport }: { onChatSupport: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onChatSupport}
      style={styles.helpCard}
    >
      <View style={styles.helpIcon}>
        <Ionicons name="chatbubble-ellipses" size={22} color="#FFFFFF" />
      </View>

      <View style={styles.helpText}>
        <Text style={styles.helpTitle}>Need Help?</Text>
        <Text style={styles.helpDesc}>Our experts are available 24/7</Text>
      </View>

      <View style={styles.helpBtn}>
        <Text style={styles.helpBtnText}>Chat</Text>
      </View>
    </TouchableOpacity>
  );
}
