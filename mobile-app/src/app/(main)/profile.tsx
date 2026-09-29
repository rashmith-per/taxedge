import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
  type AlertButton,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter, type Href } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useTheme } from "../../hooks/use-theme";
import { useAuthStore } from "../../store/authStore";
import { useApplicationStore } from "../../store/applicationStore";
import authApi from "../../modules/authentication/services/authApi";

import { ScreenLayout, SCREEN_BOTTOM_PADDING } from "../../components/ScreenLayout";
import { styles } from "../../styles/app/(main)/profile.styles";
 
import { SecondaryButton } from "../../components/SecondaryButton";
import type { IconName } from "../../types/domain";
import {
  validateDateOfBirth,
  validateEmail,
  validateFullName,
} from "../../shared/validators/indianTaxValidators";

/**
 * Account hub. Rows either navigate to a screen that exists, open one of the
 * two detail modals below, or - for the parts of the menu that have no screen
 * behind them yet - say so rather than leading somewhere empty.
 */

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

/** ₹18,000 -> ₹18K, so the stat tile never wraps. */
const compactRupees = (value: number): string => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) {
    const thousands = value / 1000;
    return `₹${thousands % 1 === 0 ? thousands : thousands.toFixed(1)}K`;
  }
  return `₹${value}`;
};

export default function ProfileScreen() {
  const colors = useTheme();
  const router = useRouter();
  const { customer, logout, setAvatar, fetchAndSyncProfile } = useAuthStore();
  const applications = useApplicationStore((state) => state.applications);

  const [pickingPhoto, setPickingPhoto] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [fetchingPersonal, setFetchingPersonal] = useState(false);
  const [personalDetails, setPersonalDetails] = useState<any>(null);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [personalErrors, setPersonalErrors] = useState<Record<string, string>>({});
  const [personalForm, setPersonalForm] = useState({
    name: "",
    email: "",
    dob: "",
    address: "",
  });

  const fetchPersonalDetails = useCallback(async () => {
    const custId = customer?.customerId;
    if (!custId) {
      console.warn("⚠️ [Profile] No customerId found to fetch personal details");
      return;
    }
    setFetchingPersonal(true);
    try {
      console.log(`🚀 [Profile] Fetching details for custId: ${custId}`);
      const res = await authApi.getCustomerDetails(custId);
      if (res.success && res.data) {
        console.log("✅ [Profile] Personal details fetched successfully:", res.data);
        setPersonalDetails(res.data);
        setPersonalForm({
          name: res.data.name || customer?.name || "",
          email: res.data.email || customer?.email || "",
          dob: res.data.dob || customer?.dob || "",
          address: res.data.address || customer?.address || "",
        });
      } else {
        console.warn("⚠️ [Profile] Failed to fetch personal details:", res.message);
      }
    } catch (err) {
      console.error("❌ [Profile] Error fetching personal details:", err);
    } finally {
      setFetchingPersonal(false);
    }
  }, [customer]);

  const updatePersonalField = (field: keyof typeof personalForm, value: string) => {
    setPersonalForm((current) => ({ ...current, [field]: value }));
    if (personalErrors[field]) {
      setPersonalErrors((current) => ({ ...current, [field]: "" }));
    }
  };

  const handleSavePersonal = async () => {
    const errors: Record<string, string> = {};
    if (!validateFullName(personalForm.name)) {
      errors.name = "Enter a valid full name";
    }
    if (!validateEmail(personalForm.email)) {
      errors.email = "Enter a valid email address";
    }
    if (!validateDateOfBirth(personalForm.dob)) {
      errors.dob = "Please enter a valid date of birth.";
    }

    if (Object.keys(errors).length > 0) {
      setPersonalErrors(errors);
      return;
    }

    setSavingPersonal(true);
    setPersonalErrors({});
    try {
      const payload = {
        ...(personalDetails || {}),
        customerId: personalDetails?.customerId || customer?.customerId,
        custId: personalDetails?.custId || customer?.customerId,
        mobileNumber: personalDetails?.mobileNumber || customer?.mobile,
        name: personalForm.name.trim().replace(/\s+/g, " "),
        email: personalForm.email.trim(),
        dob: personalForm.dob.trim(),
        address: personalForm.address.trim(),
      };
      const result = await authApi.updateCustomerProfile(payload);
      if (!result.success) {
        setPersonalErrors({ form: "Unable to update personal information. Please try again." });
        return;
      }

      await fetchAndSyncProfile(customer?.mobile);
      await fetchPersonalDetails();
      setIsEditingPersonal(false);
      Alert.alert("Profile updated", "Your personal information was updated successfully.");
    } catch {
      setPersonalErrors({ form: "Unable to update personal information. Please try again." });
    } finally {
      setSavingPersonal(false);
    }
  };

  const closePersonalModal = () => {
    if (savingPersonal) return;
    setIsEditingPersonal(false);
    setPersonalErrors({});
    setShowPersonalModal(false);
  };

  useEffect(() => {
    if (!customer?.customerId) return;
    const fetchTimer = setTimeout(() => {
      void fetchPersonalDetails();
    }, 0);
    return () => clearTimeout(fetchTimer);
  }, [customer, fetchPersonalDetails]);

  /* ---------- Stats ---------- */
  const activeCount = applications.filter(
    (app) => app.status !== "Completed",
  ).length;
  const completedCount = applications.filter(
    (app) => app.status === "Completed",
  ).length;
  const totalPaid = applications
    .filter((app) => app.paymentStatus === "Paid")
    .reduce((sum, app) => sum + app.paymentAmount, 0);

  /* KYC reads as verified once both identity documents are on file or verified in profile */
  const activePan = personalDetails?.pan || customer?.pan;
  const activeAadhaar = personalDetails?.aadhaar || customer?.aadhaar;
  const allDocuments = applications.flatMap((app) => app.documents);
  const hasUploaded = (keyword: string) =>
    allDocuments.some(
      (doc) =>
        doc.name.toLowerCase().includes(keyword) && doc.status === "Uploaded",
    );
  const kycVerified =
    (hasUploaded("pan") && hasUploaded("aadhaar")) ||
    Boolean(activePan && activeAadhaar);

  /* ---------- Profile photo ---------- */
  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo access to choose a profile picture.",
      );
      return;
    }
    setPickingPhoto(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setAvatar(result.assets[0].uri);
      }
    } finally {
      setPickingPhoto(false);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow camera access to take a photo.");
      return;
    }
    setPickingPhoto(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setAvatar(result.assets[0].uri);
      }
    } finally {
      setPickingPhoto(false);
    }
  };

  const handleChangePhoto = () => {
    const options: AlertButton[] = [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Gallery", onPress: pickFromLibrary },
    ];
    if (customer?.avatarUri) {
      options.push({
        text: "Remove Photo",
        style: "destructive",
        onPress: () => setAvatar(null),
      });
    }
    options.push({ text: "Cancel", style: "cancel" });
    Alert.alert("Profile Photo", "Choose a picture for your profile", options);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out of TaxEdge?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const runAction = (row: MenuRow) => {
    switch (row.action.kind) {
      case "route":
        router.push(row.action.href);
        return;
      case "modal":
        if (row.action.modal === "kyc") {
          setShowKycModal(true);
        } else {
          setShowPersonalModal(true);
          fetchPersonalDetails();
        }
        return;
      case "soon":
        Alert.alert(row.label, "This section isn't available yet.");
    }
  };

  const infoRow = (label: string, value: string) => (
    <View key={label} style={styles.infoRow}>
      <Text style={[styles.infoKey, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );

  return (
    <ScreenLayout title="My Profile">
      <ScrollView
        contentContainerStyle={{ paddingBottom: SCREEN_BOTTOM_PADDING }}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- Hero ---------- */}
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

              {pickingPhoto && (
                <View style={styles.avatarLoading}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              )}
            </View>

            <View style={[styles.editBadge, { backgroundColor: colors.orange }]}>
              <Ionicons name="pencil" size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.heroName}>
            {personalDetails?.name || customer?.name || "Customer Profile"}
          </Text>
          <Text style={styles.heroId}>
            Customer ID: {personalDetails?.custId || personalDetails?.customerId || customer?.customerId || "N/A"}
          </Text>

          <View style={styles.pillRow}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {personalDetails?.customerType || customer?.customerType || "Client"}
              </Text>
            </View>
            <View
              style={[
                styles.pill,
                styles.pillOutline,
                { borderColor: kycVerified ? "#7BE0A8" : colors.orange },
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: kycVerified ? "#7BE0A8" : colors.orange },
                ]}
              >
                {kycVerified ? "KYC Verified ✓" : "KYC Pending"}
              </Text>
            </View>
          </View>
        </View>

        {/* ---------- Stats ---------- */}
        <View
          style={[
            styles.statsCard,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
            },
          ]}
        >
          {[
            { value: `${activeCount}`, label: "Active Apps", color: colors.primary },
            {
              value: `${completedCount}`,
              label: "Completed",
              color: colors.success,
            },
            {
              value: compactRupees(totalPaid),
              label: "Total Paid",
              color: colors.orange,
            },
          ].map((stat) => (
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

        {/* ---------- Menu ---------- */}
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
                      index > 0 && [
                        styles.rowBorderTop,
                        { borderTopColor: colors.border },
                      ],
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

      {/* ---------- Personal information ---------- */}
      <Modal
        visible={showPersonalModal}
        transparent
        animationType="fade"
        onRequestClose={closePersonalModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Personal Information
            </Text>

            {fetchingPersonal ? (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={{ marginTop: 12, color: colors.textSecondary, fontSize: 13 }}>
                  Fetching personal details...
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
                {isEditingPersonal ? (
                  <View style={styles.modalBody}>
                    <Text style={[styles.readOnlyNote, { color: colors.textSecondary }]}>Mobile number and customer type cannot be changed here.</Text>
                    {([
                      ["name", "Full Name", personalForm.name],
                      ["email", "Email", personalForm.email],
                      ["dob", "Date of Birth", personalForm.dob],
                      ["address", "Address", personalForm.address],
                    ] as const).map(([field, label, value]) => (
                      <View key={field} style={styles.editField}>
                        <Text style={[styles.editLabel, { color: colors.textSecondary }]}>{label}</Text>
                        <TextInput
                          value={value}
                          onChangeText={(text) => updatePersonalField(field, text)}
                          style={[
                            styles.editInput,
                            { color: colors.text, borderColor: personalErrors[field] ? colors.error : colors.border },
                          ]}
                          keyboardType={field === "email" ? "email-address" : "default"}
                          autoCapitalize={field === "email" ? "none" : "words"}
                          multiline={field === "address"}
                        />
                        {personalErrors[field] ? <Text style={styles.fieldError}>{personalErrors[field]}</Text> : null}
                      </View>
                    ))}
                    {personalErrors.form ? <Text style={styles.formError}>{personalErrors.form}</Text> : null}
                    <View style={styles.personalActions}>
                      <TouchableOpacity style={styles.cancelEditButton} onPress={() => { setIsEditingPersonal(false); setPersonalErrors({}); }} disabled={savingPersonal}>
                        <Text style={[styles.cancelEditText, { color: colors.text }]}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.saveEditButton, { backgroundColor: colors.orange }]} onPress={handleSavePersonal} disabled={savingPersonal}>
                        {savingPersonal ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.saveEditText}>Save</Text>}
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.modalBody}>
                    {infoRow("Full Name", personalDetails?.name || customer?.name || "N/A")}
                    {infoRow("Mobile", personalDetails?.mobileNumber || customer?.mobile || "N/A")}
                    {infoRow("Email", personalDetails?.email || customer?.email || "N/A")}
                    {infoRow("Date of Birth", personalDetails?.dob || customer?.dob || "N/A")}
                    {infoRow("Customer Type", personalDetails?.customerType || customer?.customerType || "N/A")}
                    {infoRow(
                      "Address",
                      personalDetails?.address ||
                        customer?.address ||
                        [personalDetails?.addressLine1, personalDetails?.city, personalDetails?.state, personalDetails?.pincode]
                          .filter(Boolean)
                          .join(", ") ||
                        "N/A",
                    )}
                  </View>
                )}
              </ScrollView>
            )}

            {!isEditingPersonal && (
              <View style={styles.personalActions}>
                <SecondaryButton title="Close" onPress={closePersonalModal} />
                <TouchableOpacity style={[styles.saveEditButton, { backgroundColor: colors.orange }]} onPress={() => setIsEditingPersonal(true)}>
                  <Ionicons name="pencil" size={16} color="#FFFFFF" />
                  <Text style={styles.saveEditText}>Edit</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ---------- KYC ---------- */}
      <Modal
        visible={showKycModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowKycModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              KYC Details
            </Text>

            <View style={styles.modalBody}>
              {infoRow(
                "PAN Number",
                activePan
                  ? `${activePan.substring(0, 5)}****${activePan.substring(9)}`
                  : "N/A",
              )}
              {infoRow(
                "Aadhaar Number",
                activeAadhaar
                  ? `**** **** ${activeAadhaar.substring(Math.max(0, activeAadhaar.length - 4))}`
                  : "N/A",
              )}
              <View style={styles.infoRow}>
                <Text style={[styles.infoKey, { color: colors.textSecondary }]}>
                  Verification Status
                </Text>
                <View style={styles.statusLabelContainer}>
                  <Ionicons
                    name={kycVerified ? "checkmark-circle" : "time"}
                    size={16}
                    color={kycVerified ? colors.success : colors.orange}
                  />
                  <Text
                    style={[
                      styles.statusLabelText,
                      { color: kycVerified ? colors.success : colors.orange },
                    ]}
                  >
                    {kycVerified ? "VERIFIED ✓" : "PENDING"}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={[styles.modalNote, { color: colors.textSecondary }]}>
              Status reflects the PAN and Aadhaar documents uploaded against
              your applications.
            </Text>

            <SecondaryButton
              title="Close"
              onPress={() => setShowKycModal(false)}
            />
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

