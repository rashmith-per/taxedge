import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../hooks/use-theme";
import { useApplicationStore } from "../../store/applicationStore";
import { useAuthStore } from "../../store/authStore";
import { formatIndianCurrency } from "../../shared/formatters/currencyFormatter";
import { paymentService } from "../../modules/payments/services/paymentService";
import { AppHeader } from "../../components/AppHeader";
import { PrimaryButton } from "../../components/PrimaryButton";
import type { IconName } from "../../types/domain";

/**
 * Checkout for a single application's stored payment amount.
 */
const GST_RATE = 0.18;

type PaymentMethodId = "UPI" | "DEBIT" | "CREDIT" | "NETBANKING";

interface PaymentMethod {
  id: PaymentMethodId;
  icon: IconName;
  title: string;
  subtitle: string;
}

const METHODS: PaymentMethod[] = [
  {
    id: "UPI",
    icon: "phone-portrait",
    title: "UPI",
    subtitle: "Pay via any UPI app",
  },
  {
    id: "DEBIT",
    icon: "card",
    title: "Debit Card",
    subtitle: "Visa / Mastercard / RuPay",
  },
  {
    id: "CREDIT",
    icon: "card",
    title: "Credit Card",
    subtitle: "Visa / Mastercard / Amex",
  },
  {
    id: "NETBANKING",
    icon: "business",
    title: "Net Banking",
    subtitle: "All major banks",
  },
];

/** Handle suffix each app issues, so the shortcut fills a plausible VPA. */
const UPI_APPS: { label: string; suffix: string }[] = [
  { label: "PhonePe", suffix: "@ybl" },
  { label: "GPay", suffix: "@okicici" },
  { label: "Paytm", suffix: "@paytm" },
  { label: "BHIM", suffix: "@upi" },
];

const BANKS = ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank"];

export default function PaymentScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const applications = useApplicationStore((state) => state.applications);
  const customer = useAuthStore((state) => state.customer);

  const app = applications.find((a) => a.id === id);

  const [method, setMethod] = useState<PaymentMethodId>("UPI");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [bank, setBank] = useState(BANKS[0]);
  const [processing, setProcessing] = useState(false);

  if (!app) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Complete Payment" showBack showNotification={false} />
        <View style={styles.errorContent}>
          <Ionicons name="warning-outline" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            This payment could not be loaded.
          </Text>
        </View>
      </View>
    );
  }

  const total = Number(app.paymentAmount);
  const hasValidAmount = Number.isFinite(total) && total > 0;
  const fee = Math.round(total / (1 + GST_RATE));
  const gst = total - fee;
  const businessName =
    app.formData.businessName ?? customer?.name ?? "TaxEdge Client";

  const alreadyPaid = app.paymentStatus === "Paid";

  const handlePay = async () => {
    if (!hasValidAmount) {
      Alert.alert("Payment unavailable", "The payment amount for this application is unavailable.");
      return;
    }
    if (method === "UPI" && !upiId.trim()) {
      Alert.alert("UPI ID required", "Enter the UPI ID you want to pay from.");
      return;
    }
    if (
      (method === "DEBIT" || method === "CREDIT") &&
      (cardNumber.trim().length < 12 ||
        !cardExpiry.trim() ||
        cardCvv.trim().length < 3)
    ) {
      Alert.alert(
        "Card details incomplete",
        "Enter the card number, expiry and CVV to continue.",
      );
      return;
    }

    setProcessing(true);
    const order = await paymentService.createOrder(total, app.id);
    setProcessing(false);
    if (!order) {
      Alert.alert(
        "Payment unavailable",
        "Online payment processing is not configured yet. Your application was not marked as paid.",
      );
      return;
    }

    Alert.alert(
      "Payment provider unavailable",
      "A payment order was created, but no provider checkout or verification flow is configured. Your application was not marked as paid.",
    );
  };

  const summaryRow = (label: string, value: string, muted = true) => (
    <View style={styles.summaryRow}>
      <Text
        style={[
          styles.summaryLabel,
          { color: muted ? colors.textSecondary : colors.text },
        ]}
      >
        {label}
      </Text>
      <Text style={[styles.summaryValue, { color: colors.text }]}>{value}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Complete Payment" showBack showNotification={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ---------- Order summary ---------- */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Order Summary
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.serviceRow}>
            <View style={[styles.serviceIcon, { backgroundColor: "#E8EFF7" }]}>
              <Ionicons name="document-text" size={20} color={colors.primary} />
            </View>
            <View style={styles.serviceText}>
              <Text style={[styles.serviceName, { color: colors.text }]}>
                {app.serviceName}
              </Text>
              <Text
                style={[styles.serviceMeta, { color: colors.textSecondary }]}
              >
                {businessName} • {app.id}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {summaryRow("Professional Fee", hasValidAmount ? formatIndianCurrency(fee) : "Unavailable")}
          {summaryRow(`GST (${GST_RATE * 100}%)`, hasValidAmount ? formatIndianCurrency(gst) : "Unavailable")}
          {summaryRow("Discount", formatIndianCurrency(0))}

          <View style={[styles.totalRow, { backgroundColor: "#E8EFF7" }]}>
            <Text style={[styles.totalLabel, { color: colors.primary }]}>
              Total Amount
            </Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              {hasValidAmount ? formatIndianCurrency(total) : "Amount unavailable"}
            </Text>
          </View>
        </View>

        {/* ---------- Payment method ---------- */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Choose Payment Method
        </Text>

        {METHODS.map((item) => {
          const selected = method === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => setMethod(item.id)}
              style={[
                styles.methodCard,
                {
                  backgroundColor: selected
                    ? "#EEF4FB"
                    : colors.backgroundElement,
                  borderColor: selected ? colors.primary : colors.border,
                  borderWidth: selected ? 1.6 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.methodIcon,
                  { backgroundColor: selected ? "#DCE7F5" : "#F1F5F9" },
                ]}
              >
                <Ionicons name={item.icon} size={19} color={colors.primary} />
              </View>

              <View style={styles.methodText}>
                <Text style={[styles.methodTitle, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text
                  style={[styles.methodSub, { color: colors.textSecondary }]}
                >
                  {item.subtitle}
                </Text>
              </View>

              <Ionicons
                name={selected ? "checkmark-circle" : "ellipse-outline"}
                size={22}
                color={selected ? colors.primary : colors.border}
              />
            </TouchableOpacity>
          );
        })}

        {/* ---------- Method details ---------- */}
        {method === "UPI" && (
          <View
            style={[
              styles.detailCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              UPI ID
            </Text>
            <TextInput
              value={upiId}
              onChangeText={setUpiId}
              placeholder="yourname@bank"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
            />
            <View style={styles.chipRow}>
              {UPI_APPS.map((upiApp) => (
                <TouchableOpacity
                  key={upiApp.label}
                  activeOpacity={0.8}
                  onPress={() =>
                    setUpiId((current) => {
                      const handle = current.split("@")[0].trim();
                      return `${handle || "yourname"}${upiApp.suffix}`;
                    })
                  }
                  style={[styles.chip, { borderColor: colors.border }]}
                >
                  <Text style={[styles.chipText, { color: colors.text }]}>
                    {upiApp.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {(method === "DEBIT" || method === "CREDIT") && (
          <View
            style={[
              styles.detailCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Card Number
            </Text>
            <TextInput
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={19}
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
            />

            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <Text
                  style={[styles.fieldLabel, { color: colors.textSecondary }]}
                >
                  Expiry
                </Text>
                <TextInput
                  value={cardExpiry}
                  onChangeText={setCardExpiry}
                  placeholder="MM/YY"
                  placeholderTextColor={colors.textSecondary}
                  maxLength={5}
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    },
                  ]}
                />
              </View>
              <View style={styles.fieldHalf}>
                <Text
                  style={[styles.fieldLabel, { color: colors.textSecondary }]}
                >
                  CVV
                </Text>
                <TextInput
                  value={cardCvv}
                  onChangeText={setCardCvv}
                  placeholder="123"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        )}

        {method === "NETBANKING" && (
          <View
            style={[
              styles.detailCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Select Bank
            </Text>
            <View style={styles.chipRow}>
              {BANKS.map((name) => {
                const selected = bank === name;
                return (
                  <TouchableOpacity
                    key={name}
                    activeOpacity={0.8}
                    onPress={() => setBank(name)}
                    style={[
                      styles.chip,
                      {
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected ? "#EEF4FB" : "transparent",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: selected ? colors.primary : colors.text,
                          fontWeight: selected ? "700" : "600",
                        },
                      ]}
                    >
                      {name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ---------- Reassurance ---------- */}
        <View style={[styles.secureNote, { backgroundColor: "#FFF4EC" }]}>
          <Ionicons name="shield-checkmark" size={16} color={colors.orange} />
          <Text style={[styles.secureText, { color: colors.textSecondary }]}>
            Payments are processed over an encrypted connection. TaxEdge never
            stores your card or UPI credentials.
          </Text>
        </View>
      </ScrollView>

      {/* ---------- Sticky pay bar ---------- */}
      <View
        style={[
          styles.payBar,
          {
            backgroundColor: colors.backgroundElement,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 12,
          },
        ]}
      >
        <PrimaryButton
            title={
            alreadyPaid
              ? "Already Paid"
              : hasValidAmount
                ? `Pay Securely ${formatIndianCurrency(total)}`
                : "Amount unavailable"
          }
          onPress={handlePay}
          loading={processing}
          disabled={alreadyPaid || !hasValidAmount}
          colorType="orange"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  errorContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },

  /* Order summary */
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 14,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  serviceText: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "700",
  },
  serviceMeta: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 3,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 7,
  },
  summaryLabel: {
    fontSize: 13.5,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 19,
    fontWeight: "800",
  },

  /* Method picker */
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 22,
    marginBottom: 12,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  methodText: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 14.5,
    fontWeight: "700",
  },
  methodSub: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },

  /* Method details */
  detailCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginTop: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 7,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14.5,
    fontWeight: "500",
  },
  fieldRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  fieldHalf: {
    flex: 1,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: "600",
  },

  /* Reassurance */
  secureNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    borderRadius: 12,
    padding: 13,
    marginTop: 18,
  },
  secureText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: "500",
    lineHeight: 17,
  },

  /* Pay bar */
  payBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
