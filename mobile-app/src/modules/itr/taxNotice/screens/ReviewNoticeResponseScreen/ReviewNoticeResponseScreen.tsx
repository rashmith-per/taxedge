import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TaxNoticeHeader } from "../../components/common";
import { DraftedResponseCard } from "../../components/review";
import { generateNoticeDraftResponse } from "../../mock/taxNoticeData";
import { useApplicationStore } from "@/store/applicationStore";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import {
  styles,
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
  getBottomBarInsetsStyle,
} from "./ReviewNoticeResponseScreen.styles";

export const ReviewNoticeResponseScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const createApplication = useApplicationStore((state) => state.createApplication);
  const customer = useAuthStore((state) => state.customer);
  const authUser = useAuthStore((state) => state.authenticatedUser);

  const params = useLocalSearchParams<{
    pan?: string;
    noticeNumber?: string;
    noticeDate?: string;
    assessmentYear?: string;
    noticeType?: string;
  }>();

  const taxNoticeDraft = useApplicationStore((state) => state.taxNoticeDraft);

  const customerName =
    customer?.name || authUser?.name || "Assessee";
  const pan =
    params.pan || taxNoticeDraft?.formData?.pan || customer?.pan || "AXTPD4419K";
  const noticeNumber =
    params.noticeNumber ||
    taxNoticeDraft?.formData?.noticeNumber ||
    "CPC/2526/A3/284419260";
  const noticeDate =
    params.noticeDate || taxNoticeDraft?.formData?.noticeDate || "18 August 2026";
  const assessmentYear =
    params.assessmentYear ||
    taxNoticeDraft?.formData?.assessmentYear ||
    "AY 2025–26";

  // Checked by default matching reference screenshot
  const [isChecked, setIsChecked] = useState(true);

  // Edit request modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNotes, setEditNotes] = useState("");

  const dynamicResponseLetter = `Respected Sir/Madam,

With reference to the intimation under section 143(1)(a) bearing number ${noticeNumber} dated ${noticeDate}, we respectfully submit the following response on behalf of the assessee, ${customerName} (PAN ${pan}), for ${assessmentYear}.

The proposed adjustment relates to interest income reflected in the Annual Information Statement (AIS) and Form 26AS. The assessee confirms that the accounts and corresponding statements have been reconciled. The assessee agrees with the proposed adjustment and any resulting tax adjustments have been duly computed. A copy of the relevant supporting documentation and challan payment proof is enclosed for verification.

We request that the return be processed accordingly.

Yours faithfully,
For TaxEdge Fin Solutions
Meera Iyer, Tax Executive`;

  const handleSendEditRequest = () => {
    if (!editNotes.trim()) {
      Alert.alert("Input Required", "Please enter the changes you would like our Tax Executive to make.");
      return;
    }
    setShowEditModal(false);
    setEditNotes("");
    Alert.alert(
      "Edit Request Sent",
      "Your revision instructions have been sent to your Tax Executive. We will update the response accordingly."
    );
  };

  const handleApproveAndSubmit = () => {
    if (!isChecked) {
      Alert.alert(
        "Confirmation Required",
        "Please confirm that you have reviewed the response before submitting."
      );
      return;
    }

    const createdAppId = createApplication(
      "tax-notice-assistance",
      `Tax Notice Response (${noticeNumber || "Section 143(1)(a)"})`,
      "ITR",
      {
        noticeNumber,
        assessmentYear,
        noticeDate,
        section: "143(1)(a)",
        assesseeName: customerName,
        pan,
        status: "Response Submitted",
      },
      [
        "Notice Copy",
        "AIS Statement",
        "Form 26AS",
        "Bank Statement",
        "Supporting Proof",
      ],
      1499, // service fee
      "Paid"
    );

    // Navigate to Screen 6: Response Submission & Notice Status
    router.push({
      pathname: "/service/tax-notice-status" as any,
      params: {
        applicationId: createdAppId,
        noticeNumber,
        assessmentYear,
        pan,
      },
    });
  };

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top)]}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <TaxNoticeHeader subtitle="Review Response" />

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          getScrollContentInsetsStyle(insets.bottom),
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Please review our response</Text>
          <Text style={styles.pageSubtitle}>
            Your Tax Executive has prepared the following response to the Income
            Tax Department.
          </Text>
        </View>

        {/* Why Review is Required Callout Banner */}
        <View
          style={{
            backgroundColor: "#EFF6FF",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#BFDBFE",
            padding: 14,
            marginBottom: 16,
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: "#2563EB",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 10,
              marginTop: 2,
            }}
          >
            <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 13.5,
                fontWeight: "700",
                color: "#1E3A8A",
                marginBottom: 3,
              }}
            >
              Why Assessee Review is Required
            </Text>
            <Text style={{ fontSize: 12, color: "#1E40AF", lineHeight: 17 }}>
              Under Income Tax regulations, any response submitted on the portal is legally binding upon the taxpayer. We require your review to ensure all stated figures, explanations, and challan payments are verified by you prior to formal filing.
            </Text>
          </View>
        </View>

        {/* Drafted Response Letter */}
        <DraftedResponseCard responseText={dynamicResponseLetter} />

        {/* Checkbox Section */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsChecked(!isChecked)}
          style={styles.checkboxRow}
        >
          <View style={[styles.checkbox, isChecked ? styles.checkboxActive : null]}>
            {isChecked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxLabel}>
            I have reviewed the response and confirm that the details are correct.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Sticky Action Buttons */}
      <View style={[styles.bottomBar, getBottomBarInsetsStyle(insets.bottom)]}>
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowEditModal(true)}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>Edit Request</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleApproveAndSubmit}
            style={styles.approveButton}
          >
            <Text style={styles.approveButtonText}>Approve & Submit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit Request Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowEditModal(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(15, 23, 42, 0.6)",
              justifyContent: "center",
              paddingHorizontal: 20,
            }}
          >
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#0F172A",
                    marginBottom: 8,
                  }}
                >
                  Request Edits from Tax Executive
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#64748B",
                    marginBottom: 14,
                    lineHeight: 18,
                  }}
                >
                  Describe any modifications, corrections in income amounts, or additional facts you would like added to the response.
                </Text>

                <TextInput
                  style={{
                    height: 100,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#CBD5E1",
                    padding: 12,
                    fontSize: 14,
                    color: "#0F172A",
                    textAlignVertical: "top",
                    marginBottom: 16,
                  }}
                  multiline
                  numberOfLines={4}
                  placeholder="e.g. Please clarify that interest from SBI was already declared under Schedule OS line 2..."
                  placeholderTextColor="#94A3B8"
                  value={editNotes}
                  onChangeText={setEditNotes}
                />

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowEditModal(false)}
                    style={{
                      flex: 1,
                      height: 46,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#CBD5E1",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontWeight: "600", color: "#475569" }}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleSendEditRequest}
                    style={{
                      flex: 1,
                      height: 46,
                      borderRadius: 12,
                      backgroundColor: "#FF7A00",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontWeight: "700", color: "#FFFFFF" }}>Send to Executive</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default ReviewNoticeResponseScreen;

