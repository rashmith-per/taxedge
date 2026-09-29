import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  BackHandler,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "../../../../../shared/theme";
import { useApplicationStore } from "../../../../../store/applicationStore";
import type { Application } from "../../../../../types/domain";
import { loansApi } from "../../../services/loansApi";
import {
  LoanApplicationResponse,
  LoanApplicationStatus,
} from "../../../types/loans.types";
import { LoanStatusTracker } from "../../components/LoanStatusTracker";
import { styles } from "./LoanStatusScreen.styles";

export const LoanStatusScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string; loanType?: string; isSuccess?: string }>();
  const appId = params.id || "LN-849201";

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<LoanApplicationResponse | null>(null);

  useEffect(() => {
    loansApi
      .fetchStatus(appId)
      .then((res) => {
        setData(res);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [appId]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      router.replace("/(main)/home" as any);
      return true;
    });
    return () => sub.remove();
  }, []);

  const handleDownloadSanction = () => {
    Alert.alert(
      "Sanction Letter",
      "Official sanction letter download initiated. It will be saved to your device downloads."
    );
  };

  const handleSupport = () => {
    Alert.alert(
      "Loan Assistance Desk",
      "Connecting you with your dedicated TaxEdge Loan Agent."
    );
  };

  const appFromStore = useApplicationStore
    .getState()
    .applications.find((a: Application) => a.id === appId);
  const formData = appFromStore?.formData || {};
  const displayAmount = formData.requestedAmount || data?.amount || 3000000;
  const displayBank = formData.bankName || "Primary Current Bank";
  const displayAcc = formData.accountNumber ? `XXXX${formData.accountNumber.slice(-4)}` : "—";
  const displayEquipment = formData.equipmentType || "CNC / Automation Machinery";
  const displayTenure = formData.tenureMonths ? `${formData.tenureMonths} Months` : "48 Months";

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.replace("/(main)/home" as any)}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loan Application Status</Text>
        </View>

        <TouchableOpacity onPress={handleSupport}>
          <Ionicons name="help-circle-outline" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#0284C7" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Application Submitted Successfully Banner */}
          <View style={styles.successCard}>
            <View style={styles.successCheckCircle}>
              <Ionicons name="checkmark-circle" size={40} color="#16A34A" />
            </View>
            <Text style={styles.successTitle}>Application Submitted Successfully</Text>
            <Text style={styles.successSubtitle}>
              Your {params.loanType || appFromStore?.serviceName || data?.loanType || "Loan"} application has been lodged.
              Our Loan Agent and underwriting desk will initiate verification shortly.
            </Text>
          </View>
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.appIdRow}>
              <Text style={styles.refNumber}>
                Ref: {appFromStore?.id || data?.referenceNumber || appId}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {appFromStore?.status || data?.status || "Submitted"}
                </Text>
              </View>
            </View>

            <Text style={styles.loanName}>
              {params.loanType || appFromStore?.serviceName || data?.loanType || "Machinery Loan"}
            </Text>
            <Text style={styles.amountText}>
              ₹{Number(displayAmount).toLocaleString("en-IN")}
            </Text>

            <View style={styles.metaGrid}>
              <View>
                <Text style={styles.metaLabel}>Equipment</Text>
                <Text style={styles.metaValue}>{displayEquipment}</Text>
              </View>
              <View>
                <Text style={styles.metaLabel}>Tenure</Text>
                <Text style={styles.metaValue}>{displayTenure}</Text>
              </View>
              <View>
                <Text style={styles.metaLabel}>Disbursement Bank</Text>
                <Text style={styles.metaValue}>{displayBank} ({displayAcc})</Text>
              </View>
              <View>
                <Text style={styles.metaLabel}>Loan Agent</Text>
                <Text style={styles.metaValue}>TaxEdge Loan Agent</Text>
              </View>
            </View>
          </View>

          {/* 17 Lifecycle Status Timeline */}
          <View style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>
              Application Lifecycle Milestones
            </Text>
            <LoanStatusTracker
              currentStatus={data?.status || ("Application Received" as LoanApplicationStatus)}
              timeline={data?.timeline || []}
            />
          </View>

          {/* 2 Redirect Buttons: Track My Applications and Go to Home */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.replace("/(main)/applications" as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="list-outline" size={20} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Track My Applications</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => router.replace("/(main)/home" as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="home-outline" size={20} color="#0F172A" />
              <Text style={styles.secondaryBtnText}>Go to Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.downloadReceiptBtn}
              onPress={handleDownloadSanction}
              activeOpacity={0.7}
            >
              <Ionicons
                name="download-outline"
                size={16}
                color={BrandColors.PRIMARY_ORANGE || "#EA580C"}
              />
              <Text style={styles.downloadReceiptText}>
                Download Sanction Letter / Receipt
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default LoanStatusScreen;
