import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "../screens/GstCancellationScreen/GstCancellationScreen.styles";

interface GstCancellationReviewProps {
  formData: any;
  isReviewDeclared: boolean;
  setIsReviewDeclared: (val: boolean) => void;
  isSubmitting: boolean;
  handleSubmitCancellation: () => void;
  onBack: () => void;
}

export function GstCancellationReview({ 
  formData, 
  isReviewDeclared, 
  setIsReviewDeclared, 
  isSubmitting, 
  handleSubmitCancellation, 
  onBack 
}: GstCancellationReviewProps) {
  const insets = useSafeAreaInsets();
  const { gstin, reason, otherReason, cancellationDate, closingStock, pendingLiabilities, lastGstr3b, supportingDoc } = formData;
  
    return (
      <View style={styles.root}>
        <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View
          style={[
            styles.headerBar,
            { paddingTop: Math.max(insets.top, 12) + 6 },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onBack()}
            style={styles.roundBackButton}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={BrandColors.TEXT_PRIMARY}
            />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerMainTitle}>Review Cancellation</Text>
            <Text style={styles.headerSubtitle}>
              Confirm application details
            </Text>
          </View>
          <View style={styles.placeholderBox} />
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.reviewCard}>
            <View style={styles.reviewCardHeader}>
              <Ionicons
                name="document-text-outline"
                size={18}
                color="#083B75"
              />
              <Text style={styles.reviewCardTitle}>Application Summary</Text>
            </View>
            {[
              { k: "Form", v: "REG-16 (Cancellation)" },
              { k: "GSTIN", v: gstin, c: BrandColors.PRIMARY_BLUE },
              {
                k: "Reason",
                v: reason === "Other Valid Reason" ? otherReason : reason,
              },
              { k: "Effective Date", v: cancellationDate },
              { k: "Closing Stock & ITC", v: closingStock },
              { k: "Pending Liabilities", v: pendingLiabilities || "Nil" },
              { k: "Last GSTR-3B Filed", v: lastGstr3b },
              {
                k: "Supporting Document",
                v: supportingDoc?.name || "None (Optional)",
              },
            ].map((row, i) => (
              <React.Fragment key={row.k}>
                {i > 0 && <View style={styles.reviewDivider} />}
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewKey}>{row.k}</Text>
                  <Text
                    style={[styles.reviewVal, row.c ? { color: row.c } : null]}
                  >
                    {row.v}
                  </Text>
                </View>
              </React.Fragment>
            ))}
          </View>
          <TouchableOpacity
            style={styles.reviewDeclarationBox}
            activeOpacity={0.85}
            onPress={() => setIsReviewDeclared(!isReviewDeclared)}
          >
            <View
              style={[
                styles.checkbox,
                isReviewDeclared && styles.checkboxActive,
              ]}
            >
              {isReviewDeclared && (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.reviewDeclarationText}>
              I declare that the information provided above is true and correct,
              and I authorise TaxEdge Fin Solutions to file Form REG-16 on my
              behalf.
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              (!isReviewDeclared || isSubmitting) && { opacity: 0.65 },
            ]}
            activeOpacity={0.85}
            onPress={handleSubmitCancellation}
            disabled={isSubmitting || !isReviewDeclared}
          >
            <Text style={styles.primaryBtnText}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  
}
