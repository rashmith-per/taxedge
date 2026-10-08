import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/hooks/use-theme";
import { useApplicationStore } from "@/store/applicationStore";
import {
  ScreenLayout,
  SCREEN_BOTTOM_PADDING,
} from "@/shared/components/ScreenLayout";
import { styles, getProfileScrollStyle, getKycPillStyle } from "./ProfileScreen.styles";

import type { IconName } from "@/types/domain";
import { useProfileManager } from "@/components/screens/profile/useProfileManager";
import { PersonalDetailsModal } from "@/components/screens/profile/PersonalDetailsModal";
import { KycDetailsModal } from "@/components/screens/profile/KycDetailsModal";

type RowAction =
  | { kind: "route"; href: any }
  | { kind: "modal"; modal: "personal" | "kyc" }
  | { kind: "soon" };

interface MenuRow {
  label: string;
  icon: IconName;
  tint: string;
  tintBg: string;
  action: RowAction;
}

interface MenuSection {
  title: string;
  rows: MenuRow[];
}

const SECTIONS: MenuSection[] = [
  {
    title: "Account",
    rows: [
      {
        label: "Personal Information",
        icon: "person",
        tint: "#6D28D9",
        tintBg: "#F1ECFE",
        action: { kind: "modal", modal: "personal" },
      },
      {
        label: "KYC Details",
        icon: "card",
        tint: "#2563EB",
        tintBg: "#EAF1FE",
        action: { kind: "modal", modal: "kyc" },
      },
      {
        label: "GST Details",
        icon: "receipt",
        tint: "#7C3AED",
        tintBg: "#F1ECFE",
        action: { kind: "soon" },
      },
      {
        label: "ITR History",
        icon: "reader",
        tint: "#EA580C",
        tintBg: "#FEF0E6",
        action: { kind: "soon" },
      },
      {
        label: "Loan History",
        icon: "business",
        tint: "#475569",
        tintBg: "#EEF2F6",
        action: { kind: "soon" },
      },
    ],
  },
  {
    title: "Services",
    rows: [
      {
        label: "My Applications",
        icon: "folder",
        tint: "#D97706",
        tintBg: "#FDF2E3",
        action: { kind: "route", href: "/(main)/applications" },
      },
      {
        label: "My Documents",
        icon: "document-text",
        tint: "#2563EB",
        tintBg: "#EAF1FE",
        action: { kind: "route", href: "/(main)/documents" },
      },
      {
        label: "Payments & Invoices",
        icon: "card",
        tint: "#0891B2",
        tintBg: "#E5F5F9",
        action: { kind: "route", href: "/(main)/payments" },
      },
      {
        label: "Notifications",
        icon: "notifications",
        tint: "#EA580C",
        tintBg: "#FEF0E6",
        action: { kind: "route", href: "/notifications" },
      },
    ],
  },
  {
    title: "Preferences",
    rows: [
      {
        label: "Appearance & Settings",
        icon: "color-palette",
        tint: "#FF7A00",
        tintBg: "#FEF0E6",
        action: { kind: "route", href: "/settings" },
      },
    ],
  },
  {
    title: "Security",
    rows: [
      {
        label: "Change Password",
        icon: "lock-closed",
        tint: "#DC2626",
        tintBg: "#FDEBEB",
        action: { kind: "soon" },
      },
      {
        label: "Two-Factor Authentication",
        icon: "keypad",
        tint: "#6D28D9",
        tintBg: "#F1ECFE",
        action: { kind: "soon" },
      },
      {
        label: "Login History",
        icon: "time",
        tint: "#475569",
        tintBg: "#EEF2F6",
        action: { kind: "soon" },
      },
      {
        label: "Privacy Settings",
        icon: "shield-half",
        tint: "#D97706",
        tintBg: "#FDF2E3",
        action: { kind: "soon" },
      },
    ],
  },
  {
    title: "Support",
    rows: [
      {
        label: "Customer Support",
        icon: "chatbubbles",
        tint: "#2563EB",
        tintBg: "#EAF1FE",
        action: { kind: "route", href: "/chat/support" },
      },
      {
        label: "Rate TaxEdge",
        icon: "star",
        tint: "#D97706",
        tintBg: "#FDF2E3",
        action: { kind: "soon" },
      },
      {
        label: "Terms & Conditions",
        icon: "document-text",
        tint: "#475569",
        tintBg: "#EEF2F6",
        action: { kind: "soon" },
      },
      {
        label: "Privacy Policy",
        icon: "shield-checkmark",
        tint: "#0891B2",
        tintBg: "#E5F5F9",
        action: { kind: "soon" },
      },
    ],
  },
];

const compactRupees = (value: number): string =>
  value >= 100000
    ? `₹${(value / 100000).toFixed(1)}L`
    : value >= 1000
      ? `₹${(value / 1000) % 1 === 0 ? value / 1000 : (value / 1000).toFixed(1)}K`
      : `₹${value}`;

export function ProfileScreen() {
  const colors = useTheme();
  const router = useRouter();
  const applications = useApplicationStore((state) => state.applications);

  const {
    customer,
    pickingPhoto,
    showKycModal,
    setShowKycModal,
    showPersonalModal,
    setShowPersonalModal,
    fetchingPersonal,
    personalDetails,
    isEditingPersonal,
    setIsEditingPersonal,
    savingPersonal,
    personalErrors,
    setPersonalErrors,
    personalForm,
    fetchPersonalDetails,
    updatePersonalField,
    handleSavePersonal,
    closePersonalModal,
    handleChangePhoto,
    handleLogout,
  } = useProfileManager();

  /* Stats */
  const activeCount = applications.filter(
    (app) => app.status !== "Completed"
  ).length;
  const completedCount = applications.filter(
    (app) => app.status === "Completed"
  ).length;
  const totalPaid = applications
    .filter((app) => app.paymentStatus === "Paid")
    .reduce((sum, app) => sum + app.paymentAmount, 0);

  const activePan = personalDetails?.pan || customer?.pan;
  const activeAadhaar = personalDetails?.aadhaar || customer?.aadhaar;
  const allDocuments = applications.flatMap((app) => app.documents);
  const hasUploaded = (keyword: string) =>
    allDocuments.some(
      (doc) =>
        doc.name.toLowerCase().includes(keyword) && doc.status === "Uploaded"
    );
  const kycVerified =
    (hasUploaded("pan") && hasUploaded("aadhaar")) ||
    Boolean(activePan && activeAadhaar);

  const ACTION_HANDLERS: Record<
    string,
    (action: RowAction, label: string) => void
  > = {
    route: (act) => act.kind === "route" && router.push(act.href),
    modal: (act) => {
      if (act.kind === "modal") {
        if (act.modal === "kyc") {
          setShowKycModal(true);
        } else {
          setShowPersonalModal(true);
          fetchPersonalDetails();
        }
      }
    },
    soon: (_, label) =>
      Alert.alert(label, "This section isn't available yet."),
  };

  const runAction = (row: MenuRow) => {
    ACTION_HANDLERS[row.action.kind]?.(row.action, row.label);
  };

  const statItems = [
    { value: `${activeCount}`, label: "Active Apps", color: colors.primary },
    { value: `${completedCount}`, label: "Completed", color: colors.success },
    { value: compactRupees(totalPaid), label: "Total Paid", color: colors.orange },
  ];

  return (
    <ScreenLayout title="My Profile">
      <ScrollView
        contentContainerStyle={getProfileScrollStyle(SCREEN_BOTTOM_PADDING)}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: colors.primaryDark }]}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleChangePhoto}
            style={styles.avatarWrap}
          >
            <View style={styles.avatarBg}>
              {customer?.avatarUri ? (
                <Image
                  source={{ uri: customer.avatarUri }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person" size={38} color="#FFFFFF" />
              )}

              {pickingPhoto ? (
                <View style={styles.avatarLoading}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              ) : null}
            </View>

            <View
              style={[styles.editBadge, { backgroundColor: colors.orange }]}
            >
              <Ionicons name="pencil" size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.heroName}>
            {personalDetails?.name || customer?.name || "Customer Profile"}
          </Text>
          <Text style={styles.heroId}>
            Customer ID:{" "}
            {personalDetails?.custId ||
              personalDetails?.customerId ||
              customer?.customerId ||
              "N/A"}
          </Text>

          <View style={styles.pillRow}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {personalDetails?.customerType ||
                  customer?.customerType ||
                  "Client"}
              </Text>
            </View>
            <View
              style={[
                styles.pill,
                styles.pillOutline,
                { borderColor: getKycPillStyle(kycVerified, colors).borderColor },
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: getKycPillStyle(kycVerified, colors).color },
                ]}
              >
                {kycVerified ? "KYC Verified ✓" : "KYC Pending"}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View
          style={[
            styles.statsCard,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
            },
          ]}
        >
          {statItems.map((stat) => (
            <View key={stat.label} style={styles.statCell}>
              <Text style={[styles.statValue, { color: stat.color }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menuArea}>
          {SECTIONS.map((section) => (
            <View key={section.title}>
              <Text
                style={[styles.sectionLabel, { color: colors.textSecondary }]}
              >
                {section.title.toUpperCase()}
              </Text>

              <View
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.border,
                  },
                ]}
              >
                {section.rows.map((row, index) => (
                  <TouchableOpacity
                    key={row.label}
                    activeOpacity={0.75}
                    onPress={() => runAction(row)}
                    style={[
                      styles.row,
                      index > 0
                        ? [
                            styles.rowBorderTop,
                            { borderTopColor: colors.border },
                          ]
                        : null,
                    ]}
                  >
                    <View
                      style={[styles.rowIcon, { backgroundColor: row.tintBg }]}
                    >
                      <Ionicons name={row.icon} size={17} color={row.tint} />
                    </View>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>
                      {row.label}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={17}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogout}
            style={[
              styles.logoutBtn,
              {
                borderColor: colors.error,
                backgroundColor: colors.backgroundElement,
              },
            ]}
          >
            <Ionicons name="log-out-outline" size={19} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Personal Information Modal */}
      <PersonalDetailsModal
        visible={showPersonalModal}
        onClose={closePersonalModal}
        colors={colors}
        fetchingPersonal={fetchingPersonal}
        isEditingPersonal={isEditingPersonal}
        setIsEditingPersonal={setIsEditingPersonal}
        savingPersonal={savingPersonal}
        personalDetails={personalDetails}
        customer={customer}
        personalForm={personalForm}
        personalErrors={personalErrors}
        updatePersonalField={updatePersonalField}
        handleSavePersonal={handleSavePersonal}
        onCancelEdit={() => {
          setIsEditingPersonal(false);
          setPersonalErrors({});
        }}
      />

      {/* KYC Details Modal */}
      <KycDetailsModal
        visible={showKycModal}
        onClose={() => setShowKycModal(false)}
        colors={colors}
        activePan={activePan}
        activeAadhaar={activeAadhaar}
        kycVerified={kycVerified}
      />
    </ScreenLayout>
  );
}

export default ProfileScreen;
