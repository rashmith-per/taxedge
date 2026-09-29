import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { useApplicationStore } from "@/store/applicationStore";
import { styles } from "../screens/GstCancellationScreen/GstCancellationScreen.styles";

interface GstCancellationSuccessProps {
  submissionResult: any;
  gstin: string;
  cancellationDate: string;
}

export function GstCancellationSuccess({
  submissionResult,
  gstin,
  cancellationDate,
}: GstCancellationSuccessProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    const { BackHandler } = require("react-native");
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      router.replace("/(main)/home");
      return true;
    });
    return () => sub.remove();
  }, []);

  return (
    <View style={styles.successContainer}>
      <FocusAwareStatusBar
        barStyle="light-content"
        backgroundColor={BrandColors.PRIMARY_BLUE}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.successHero, { paddingTop: insets.top + 32 }]}>
          <View style={styles.successHeroIconBox}>
            <View style={styles.successHeroCheckCircle}>
              <Ionicons name="checkmark" size={36} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.successHeroTitle}>Cancellation Submitted</Text>
          <Text style={styles.successHeroSubtitle}>
            Your application Form REG-16 has been initiated successfully.
          </Text>
        </View>
        <View style={styles.successCard}>
          {[
            { k: "Application Type", v: "GST Cancellation" },
            {
              k: "ARN / Reference",
              v: submissionResult.arn,
              c: BrandColors.PRIMARY_BLUE,
            },
            { k: "GSTIN", v: gstin },
            { k: "Submission Date", v: submissionResult.date },
            { k: "Effective Date", v: cancellationDate },
            { k: "Current Status", v: "Submitted", c: "#16A34A" },
          ].map((row, i) => (
            <React.Fragment key={row.k}>
              {i > 0 && <View style={styles.successDivider} />}
              <View style={styles.successRow}>
                <Text style={styles.successRowKey}>{row.k}</Text>
                <Text
                  style={[
                    styles.successRowVal,
                    row.c ? { color: row.c } : null,
                  ]}
                >
                  {row.v}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
      <View
        style={[
          styles.successActionsWrap,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={() => {
            useApplicationStore
              .getState()
              .setSelectedApplicationId(submissionResult.appId);
            router.replace(`/application/${submissionResult.appId}`);
          }}
        >
          <Text style={styles.primaryBtnText}>Track Cancellation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace('/(main)/home')}
          activeOpacity={0.8}
        >
          <Ionicons name="home-outline" size={20} color="#FFFFFF" />
          <Text style={styles.homeBtnText}>Go to Home Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => router.replace('/(main)/applications')}
          activeOpacity={0.8}
        >
          <Ionicons name="folder-open-outline" size={20} color="#475569" />
          <Text style={styles.trackBtnText}>Track in My Applications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryBtn,
            { marginTop: 4, borderColor: "#EF4444", borderWidth: 1 },
          ]}
          activeOpacity={0.85}
          onPress={() => {
            useApplicationStore
              .getState()
              .deleteApplication(submissionResult.appId);
            router.replace("/(main)/home");
          }}
        >
          <Text style={[styles.secondaryBtnText, { color: "#EF4444" }]}>
            Withdraw Cancellation
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
