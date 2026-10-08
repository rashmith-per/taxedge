import React from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "@/styles/app/application/[id].styles";
import type { RowItem } from "./types";
import { logger } from "@/core/logging/logger";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

interface OverviewTabProps {
  isGstAmendment: boolean;
  displayId: string;
  appliedDate: string;
  formData: Record<string, any>;
  overviewRows: RowItem[];
  assignedCA: string;
  isLoans: boolean;
  onChatPress: () => void;
  filingRows: RowItem[];
  estimateRows: RowItem[];
  registrationRows: RowItem[];
  appId: string;
  onReviewEdit: () => void;
  onSupportTicket: () => void;
}

export function OverviewTab({
  isGstAmendment,
  displayId,
  appliedDate,
  formData,
  overviewRows,
  assignedCA,
  isLoans,
  onChatPress,
  filingRows,
  estimateRows,
  registrationRows,
  appId,
  onReviewEdit,
  onSupportTicket,
}: OverviewTabProps) {
  let parsedCurrent: Record<string, unknown> = {};
  let parsedRequested: Record<string, unknown> = {};
  try {
    parsedCurrent =
      typeof formData.currentValues === "string"
        ? JSON.parse(formData.currentValues || "{}")
        : (formData.currentValues as Record<string, unknown>) || {};
  } catch (err) {
    logger.debug("Failed to parse currentValues", { error: getErrorMessage(err) });
  }
  try {
    parsedRequested =
      typeof formData.requestedValues === "string"
        ? JSON.parse(formData.requestedValues || "{}")
        : (formData.requestedValues as Record<string, unknown>) || {};
  } catch (err) {
    logger.debug("Failed to parse requestedValues", { error: getErrorMessage(err) });
  }
  const hasRequested = Object.keys(parsedRequested).length > 0;

  return (
    <>
      {/* GST Amendment Card */}
      {isGstAmendment && (
        <View style={styles.card}>
          <View style={styles.idCardHeader}>
            <View>
              <Text style={styles.idLabel}>APPLICATION ID</Text>
              <Text style={styles.idValue}>{displayId}</Text>
            </View>
            <View style={styles.verificationBadge}>
              <Text style={styles.verificationBadgeText}>
                • Under Verification
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaColLeft}>
              <Text style={styles.metaColLabel}>Section</Text>
              <Text style={styles.metaColValue} numberOfLines={1}>
                {formData.section || "GST Amendment"}
              </Text>
            </View>
            <View style={styles.metaColCenter}>
              <Text style={styles.metaColLabel}>GSTIN</Text>
              <Text style={styles.metaColValue}>{formData.gstin || "—"}</Text>
            </View>
            <View style={styles.metaColRight}>
              <Text style={styles.metaColLabel}>Applied</Text>
              <Text style={styles.metaColValue}>{appliedDate}</Text>
            </View>
          </View>

          <View>
            <View style={styles.progressBarTrack}>
              <View style={styles.progressBarFill} />
            </View>
            <Text style={styles.progressBarText}>30% complete</Text>
          </View>
        </View>
      )}

      {/* Application Info Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#083B75"
          />
          <Text style={styles.cardHeaderTitle}>
            {isGstAmendment ? "Amendment Overview" : "Application Info"}
          </Text>
        </View>
        <View style={styles.cardRowsGap10}>
          {overviewRows.map((r, i) => (
            <React.Fragment key={r.key}>
              {i > 0 && <View style={styles.infoDivider} />}
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>{r.key}</Text>
                <Text style={styles.infoVal}>{r.val}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Assigned CA Card with Direct Chat Action */}
      <View style={[styles.card, styles.assignedCaCard]}>
        <View style={styles.assignedCaRow}>
          <View style={styles.assignedCaLeft}>
            <View style={styles.assignedCaAvatar}>
              <Ionicons name="person" size={22} color="#083B75" />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.assignedCaLabel}>Assigned Executive</Text>
              <Text style={styles.assignedCaName}>{assignedCA}</Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onChatPress}
            style={styles.assignedCaChatBtn}
          >
            <Ionicons name="chatbubbles-outline" size={15} color="#FFFFFF" />
            <Text style={styles.assignedCaChatBtnText}>
              {isLoans ? "Chat with Loan Agent" : "Chat with CA"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* GST Filing Details */}
      {filingRows.length > 0 && (
        <View style={styles.card}>
          <View
            style={[styles.cardHeaderRow, { justifyContent: "space-between" }]}
          >
            <View style={styles.filingHeaderTitleRow}>
              <Ionicons name="document-text-outline" size={20} color="#083B75" />
              <Text style={styles.cardHeaderTitle}>Filing Details</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onReviewEdit}
              style={styles.filingReviewBtn}
            >
              <Ionicons name="eye-outline" size={12} color="#EA580C" />
              <Text style={styles.filingReviewBtnText}>Review & Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardRowsGap10}>
            {filingRows.map((r, i) => (
              <React.Fragment key={r.key}>
                {i > 0 && <View style={styles.infoDivider} />}
                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>{r.key}</Text>
                  <Text
                    style={[
                      styles.infoVal,
                      r.key === "GSTIN"
                        ? { letterSpacing: 0.5, color: "#EA580C" }
                        : null,
                    ]}
                  >
                    {r.val}
                  </Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>
      )}

      {/* Estimated Tax Computation */}
      {estimateRows.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="calculator-outline" size={20} color="#083B75" />
            <Text style={styles.cardHeaderTitle}>
              Tax Computation (Estimated)
            </Text>
          </View>
          <View style={styles.cardRowsGap10}>
            {estimateRows.map((r, i) => (
              <React.Fragment key={r.key}>
                {i > 0 && <View style={styles.infoDivider} />}
                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>{r.key}</Text>
                  <Text
                    style={[
                      styles.infoVal,
                      r.key.includes("Credit") ? { color: "#059669" } : null,
                    ]}
                  >
                    {r.val}
                  </Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>
      )}

      {/* Business Registration Details */}
      {registrationRows.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="business-outline" size={20} color="#083B75" />
            <Text style={styles.cardHeaderTitle}>
              Business Registration Details
            </Text>
          </View>
          <View style={styles.cardRowsGap10}>
            {registrationRows.map((r, i) => (
              <React.Fragment key={r.key}>
                {i > 0 && <View style={styles.infoDivider} />}
                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>{r.key}</Text>
                  <Text style={styles.infoVal}>{r.val}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>
      )}

      {/* Requested Changes (GST Amendment) */}
      {isGstAmendment && hasRequested && (
        <View style={[styles.card, styles.requestedChangesCard]}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="swap-horizontal-outline" size={20} color="#083B75" />
            <Text style={styles.cardHeaderTitle}>Requested Changes</Text>
          </View>
          <View style={styles.requestedChangesRow}>
            <View style={styles.requestedColCurrent}>
              <Text style={styles.requestedColCurrentLabel}>Current</Text>
              {Object.entries(parsedCurrent).map(([k, v]) => (
                <View key={k} style={styles.changeItemRow}>
                  <Text style={styles.changeItemKey}>{k}</Text>
                  <Text style={styles.changeItemValCurrent}>{String(v)}</Text>
                </View>
              ))}
            </View>
            <View style={styles.requestedColNew}>
              <Text style={styles.requestedColNewLabel}>Requested</Text>
              {Object.entries(parsedRequested).map(([k, v]) => (
                <View key={k} style={styles.changeItemRow}>
                  <Text style={styles.changeItemKey}>{k}</Text>
                  <Text style={styles.changeItemValNew}>{String(v)}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Contact Support Card */}
      <View style={[styles.card, styles.supportCard]}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="headset-outline" size={20} color="#0369A1" />
          <Text style={[styles.cardHeaderTitle, { color: "#0369A1" }]}>
            Contact Support
          </Text>
        </View>
        <Text style={styles.supportDesc}>
          Need help with your application? Our CA team is available Mon–Sat
          9am–6pm.
        </Text>
        <View style={styles.cardRowsGap10}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => Linking.openURL("tel:+918800123456")}
            style={styles.supportBtn}
          >
            <View style={[styles.supportIconWrap, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="call" size={16} color="#083B75" />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.supportItemLabel}>Call Us</Text>
              <Text style={styles.supportItemValue}>+91 8800 123 456</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#EA580C" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              Linking.openURL(
                "https://wa.me/918800123456?text=Hi%2C%20I%20need%20help%20with%20my%20TaxEdge%20application%20" +
                  encodeURIComponent(appId)
              )
            }
            style={styles.supportBtn}
          >
            <View style={[styles.supportIconWrap, { backgroundColor: "#F0FDF4" }]}>
              <Ionicons name="logo-whatsapp" size={16} color="#16A34A" />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.supportItemLabel}>WhatsApp Support</Text>
              <Text style={styles.supportItemValue}>Chat with a CA Now</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#EA580C" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              Linking.openURL(
                "mailto:support@taxedge.in?subject=Help with Application " +
                  encodeURIComponent(appId)
              )
            }
            style={styles.supportBtn}
          >
            <View style={[styles.supportIconWrap, { backgroundColor: "#FFF1E8" }]}>
              <Ionicons name="mail" size={16} color="#EA580C" />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.supportItemLabel}>Email Support</Text>
              <Text style={styles.supportItemValue}>support@taxedge.in</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#EA580C" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onSupportTicket}
            style={styles.supportBtn}
          >
            <View style={[styles.supportIconWrap, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={16}
                color="#083B75"
              />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.supportItemLabel}>In-App Support Ticket</Text>
              <Text style={styles.supportItemValue}>
                Chat with TaxEdge Support
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#EA580C" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
