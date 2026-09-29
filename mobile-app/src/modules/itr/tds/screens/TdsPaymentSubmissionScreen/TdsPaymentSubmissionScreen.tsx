import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import {
  PaymentMethodType,
  PaymentOptionItem,
  PaymentProcessingState,
  TdsFeeBreakdown,
} from "../../types/payment.types";
import { formatCurrency } from "../../utils/tdsValidation";
import { tdsFeeService } from "../../services/tdsFeeService";
import { tdsApiService } from "../../services/tdsApiService";
import { tdsDraftService } from "../../services/tdsDraftService";
import { FeeSummaryCard } from "../../components/payment/FeeSummaryCard";
import { PaymentMethodCard } from "../../components/payment/PaymentMethodCard";
import { styles } from "./TdsPaymentSubmissionScreen.styles";

const PAYMENT_METHODS: PaymentOptionItem[] = [
  {
    id: "upi",
    title: "UPI (Google Pay, PhonePe, Paytm, BHIM)",
    subtitle: "Instant & zero transaction fee",
    iconName: "qr-code-outline",
  },
  {
    id: "debit",
    title: "Debit Card",
    subtitle: "Visa, Mastercard, RuPay",
    iconName: "card-outline",
  },
  {
    id: "credit",
    title: "Credit Card",
    subtitle: "Visa, Mastercard, AMEX",
    iconName: "card",
  },
  {
    id: "netbanking",
    title: "Net Banking",
    subtitle: "All major Indian banks (SBI, HDFC, ICICI, etc.)",
    iconName: "business-outline",
  },
];

export const TdsPaymentSubmissionScreen: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    applicationId?: string;
    refundAmount?: string;
    isAdditionalPayable?: string;
    payableAmount?: string;
    serviceFee?: string;
    gstAmount?: string;
    totalPayable?: string;
  }>();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("upi");
  const [processingState, setProcessingState] = useState<PaymentProcessingState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string>(params.applicationId || "");

  const refundEstimate = parseFloat(params.refundAmount || "0") || 0;
  const isAdditionalPayable = params.isAdditionalPayable === "1";

  // Prevent leaving while payment is in-flight
  useEffect(() => {
    const unsubscribe = (navigation as any).addListener("beforeRemove", (e: any) => {
      if (processingState === "processing") {
        e.preventDefault();
        Alert.alert(
          "Payment in Progress",
          "Your transaction is currently being processed. Please wait to prevent duplicate charges."
        );
      }
    });
    return unsubscribe;
  }, [navigation, processingState]);

  // Calculate dynamic fees
  const feeData: TdsFeeBreakdown = tdsFeeService.calculateFee(
    refundEstimate,
    isAdditionalPayable
  );

  useEffect(() => {
    (async () => {
      if (!applicationId) {
        const savedId = await tdsDraftService.getApplicationId();
        if (savedId) {
          setApplicationId(savedId);
        }
      }
    })();
  }, [applicationId]);

  const handlePayPress = async () => {
    if (processingState === "processing") return; // Prevent multiple taps

    setProcessingState("processing");
    setErrorMessage(null);

    const targetAppId = applicationId.trim();
    if (!targetAppId) {
      setProcessingState("idle");
      setErrorMessage("Application draft not found. Please navigate back to review your application.");
      return;
    }

    try {
      const response = await tdsApiService.payAndConfirm(
        targetAppId,
        selectedMethod.toUpperCase(),
        feeData.totalPayable
      );

      setProcessingState("success");

      // Clear local draft upon confirmed payment
      await tdsDraftService.clearDraft();

      // Navigate to Screen 5 (Application Status)
      router.replace({
        pathname: "/service/tds-status" as any,
        params: {
          applicationId: response?.applicationId || targetAppId,
          refundAmount: formatCurrency(refundEstimate),
          isAdditionalPayable: isAdditionalPayable ? "1" : "0",
        },
      });
    } catch (err: any) {
      if (__DEV__) {
        console.warn("Payment API error:", err);
      }
      if (err?.message?.toLowerCase().includes("network")) {
        setProcessingState("network_error");
        setErrorMessage("Network error connecting to payment gateway. Please check your internet connection.");
      } else {
        setProcessingState("network_error");
        setErrorMessage(err?.message || "Payment could not be processed. Please try again.");
      }
    }
  };

  const isProcessing = processingState === "processing";

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          disabled={isProcessing}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={20} color={BrandColors.PRIMARY_BLUE_DARK} />
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Pay & Submit</Text>
          <Text style={styles.headerSubtitle}>Step 4 of 5: Payment</Text>
        </View>

        <View style={styles.headerRightSpacer} />
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 85 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Error / Failure Banner */}
        {errorMessage && (
          <View style={styles.errorBanner}>
            <View style={styles.errorIconBox}>
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
            </View>
            <View style={styles.errorTextBox}>
              <Text style={styles.errorTitle}>Payment Incomplete</Text>
              <Text style={styles.errorDesc}>{errorMessage}</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handlePayPress}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Dynamic Fee Summary Card */}
        <FeeSummaryCard feeData={feeData} />

        {/* Payment Methods Selection */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          <Text style={styles.sectionSubtitle}>
            Choose your preferred secure payment mode
          </Text>
        </View>

        {PAYMENT_METHODS.map((method) => (
          <PaymentMethodCard
            key={method.id}
            item={method}
            isSelected={selectedMethod === method.id}
            onSelect={(id) => setSelectedMethod(id)}
            disabled={isProcessing}
          />
        ))}

        {/* Security Row */}
        <View style={styles.securityRow}>
          <Ionicons name="lock-closed" size={14} color={BrandColors.PRIMARY_BLUE} />
          <Text style={styles.securityText}>
            256-bit bank-grade encryption • Instant CA assigned
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePayPress}
          disabled={isProcessing}
          style={[styles.payButton, isProcessing ? styles.payButtonDisabled : null]}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={BrandColors.WHITE} />
          ) : (
            <>
              <Ionicons name="lock-closed" size={17} color={BrandColors.WHITE} />
              <Text style={styles.payButtonText}>
                Pay {formatCurrency(feeData.totalPayable)} Securely
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TdsPaymentSubmissionScreen;
