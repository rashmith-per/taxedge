/**
 * Screen: Application Details
 * Migrated from internal StyleSheet to external styles module.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  navyHeader: { backgroundColor: "#0A2346", paddingHorizontal: 16, paddingBottom: 16 },
  topNavRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  backButton: { width: 38, height: 38, borderRadius: 10, backgroundColor: "rgba(255, 255, 255, 0.14)", alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 17, fontWeight: "700", color: "#FFFFFF", letterSpacing: -0.2 },
  appIdLabel: { fontSize: 12, fontWeight: "600", color: "rgba(255, 255, 255, 0.7)", letterSpacing: 0.5, marginBottom: 6 },
  serviceTitle: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", letterSpacing: -0.3, marginBottom: 4 },
  serviceSubtitle: { fontSize: 13.5, color: "rgba(255, 255, 255, 0.85)", fontWeight: "400", marginBottom: 2 },
  headerTextWrap: { paddingHorizontal: 2 },
  navSpacer: { width: 38 },

  /* Tabs Bar */
  tabsContainer: { backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#F1F5F9", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  tabsScrollContent: { flexDirection: "row", paddingHorizontal: 12, paddingVertical: 10, alignItems: "center", gap: 8 },
  tabItem: { paddingHorizontal: 12, paddingVertical: 6, alignItems: "center", justifyContent: "center" },
  tabLabel: { fontSize: 13, textAlign: "center", letterSpacing: -0.1 },
  activeTabIndicator: { height: 2.5, width: "100%", minWidth: 24, backgroundColor: "#FF5722", borderRadius: 2, marginTop: 4 },
  inactiveTabIndicator: { height: 2.5, width: "100%", backgroundColor: "transparent", marginTop: 4 },

  /* Scroll Content & Card */
  scrollContent: { padding: 16, gap: 16 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#F1F5F9", padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1.5 },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  cardHeaderTitle: { fontSize: 15.5, fontWeight: "700", color: "#0A2346", letterSpacing: -0.2 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 2 },
  infoKey: { fontSize: 13.5, color: "#64748B", fontWeight: "500" },
  infoVal: { fontSize: 13.5, color: "#0F172A", fontWeight: "700" },
  infoDivider: { height: 1, backgroundColor: "#F1F5F9" },

  /* Overview: GST Amendment Summary Card */
  idCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  idLabel: { fontSize: 11, fontWeight: "700", color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase" },
  idValue: { fontSize: 18, fontWeight: "900", color: "#0A2346", marginTop: 2 },
  verificationBadge: { backgroundColor: "#F3E8FF", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  verificationBadgeText: { fontSize: 12, fontWeight: "700", color: "#7E22CE" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  metaColLeft: { flex: 1.2 },
  metaColCenter: { flex: 0.8, alignItems: "center" },
  metaColRight: { flex: 0.8, alignItems: "flex-end" },
  metaColLabel: { fontSize: 11, color: "#64748B", fontWeight: "500" },
  metaColValue: { fontSize: 13, fontWeight: "700", color: "#0F172A", marginTop: 2 },
  progressBarTrack: { height: 6, backgroundColor: "#E2E8F0", borderRadius: 3, overflow: "hidden" },
  progressBarFill: { width: "30%", height: "100%", backgroundColor: "#EA580C", borderRadius: 3 },
  progressBarText: { fontSize: 11, color: "#64748B", textAlign: "right", marginTop: 4, fontWeight: "600" },

  /* Overview: Assigned CA Card */
  assignedCaCard: { backgroundColor: "#F8FAFC", borderColor: "#E2E8F0" },
  assignedCaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  assignedCaLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  assignedCaAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#EAF2FF", alignItems: "center", justifyContent: "center" },
  assignedCaLabel: { fontSize: 11, color: "#64748B", fontWeight: "700", textTransform: "uppercase" },
  assignedCaName: { fontSize: 14, fontWeight: "700", color: "#0F172A", marginTop: 2 },
  assignedCaChatBtn: { backgroundColor: "#083B75", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 6 },
  assignedCaChatBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },

  /* Overview: Review & Edit Button */
  filingReviewBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "#EA580C", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14 },
  filingReviewBtnText: { fontSize: 12, fontWeight: "600", color: "#EA580C" },

  /* Overview: Requested Changes */
  requestedChangesCard: { marginTop: 14 },
  requestedChangesRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  requestedColCurrent: { flex: 1, backgroundColor: "#F8FAFC", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  requestedColCurrentLabel: { fontSize: 11, fontWeight: "700", color: "#64748B", textTransform: "uppercase", marginBottom: 6 },
  requestedColNew: { flex: 1, backgroundColor: "#EFF6FF", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#BFDBFE" },
  requestedColNewLabel: { fontSize: 11, fontWeight: "700", color: "#083B75", textTransform: "uppercase", marginBottom: 6 },
  changeItemKey: { fontSize: 10.5, color: "#94A3B8" },
  changeItemValCurrent: { fontSize: 12.5, fontWeight: "600", color: "#0F172A" },
  changeItemValNew: { fontSize: 12.5, fontWeight: "700", color: "#083B75" },

  /* Overview: Contact Support */
  supportCard: { backgroundColor: "#F0F9FF", borderColor: "#BAE6FD", borderWidth: 1 },
  supportDesc: { fontSize: 12.5, color: "#475569", lineHeight: 18, marginBottom: 14 },
  supportBtn: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: "#E0F2FE" },
  supportIconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  supportItemLabel: { fontSize: 11, color: "#64748B", fontWeight: "600" },
  supportItemValue: { fontSize: 13, color: "#0A2346", fontWeight: "700" },

  /* Status Tab */
  completedCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#16A34A", alignItems: "center", justifyContent: "center" },
  currentCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#EA580C", alignItems: "center", justifyContent: "center" },
  pendingCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#CBD5E1", backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" },
  timelineConnectingLine: { width: 2, flex: 1, minHeight: 28, marginVertical: 4 },
  timelineContentCol: { flex: 1, paddingBottom: 16, paddingRight: 4 },
  timelineStepTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  timelineStepTitle: { fontSize: 14, letterSpacing: -0.1, flex: 1, flexShrink: 1, lineHeight: 19 },
  timelineStepDate: { fontSize: 11.5, color: "#64748B", fontWeight: "500", marginTop: 1, flexShrink: 0 },
  timelineStepSub: { fontSize: 12, color: "#64748B", marginTop: 2, lineHeight: 16 },
  statusDiscussionCard: { backgroundColor: "#FFF2EA", borderColor: "#FED7AA", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statusDiscussionLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  statusDiscussionTitle: { fontSize: 13.5, fontWeight: "700", color: "#0A2346" },
  statusDiscussionSubtitle: { fontSize: 11.5, color: "#64748B", marginTop: 2 },
  withdrawBtn: { height: 48, borderRadius: 12, backgroundColor: "#FFFFFF", borderColor: "#EF4444", borderWidth: 1, marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  withdrawBtnText: { color: "#EF4444", fontWeight: "700", fontSize: 15 },

  /* Documents Tab */
  docItemCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 14, borderWidth: 1, borderColor: "#F1F5F9", padding: 12, gap: 12 },
  docIconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  docNameText: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  docMetaWrap: { flex: 1, paddingRight: 8, justifyContent: "center" },
  docSubText: { fontSize: 11, color: "#64748B", marginTop: 2 },
  uploadPeachBtn: { backgroundColor: "#FFF2EA", paddingHorizontal: 12, paddingVertical: 6.5, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 5 },
  uploadPeachBtnText: { color: "#EA580C", fontSize: 12.5, fontWeight: "700" },
  uploadedPill: { backgroundColor: "#EAF2FF", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 4 },
  uploadedPillText: { color: "#083B75", fontSize: 12, fontWeight: "700" },
  docEmptyContainer: { alignItems: "center", paddingVertical: 36, gap: 8 },
  docEmptyText: { fontSize: 14, fontWeight: "600", color: "#64748B", textAlign: "center" },
  docEmptyUploadBtn: { marginTop: 12, paddingHorizontal: 16, height: 42 },

  /* Payments Tab */
  statusPillSmall: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  paymentTotalKey: { fontWeight: "700", color: "#0A2346" },
  paymentTotalVal: { color: "#EA580C", fontSize: 16 },

  /* Chat with CA Styles */
  emptyChatWrap: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 20 },
  emptyChatIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#FFF2EA", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  emptyChatTitle: { fontSize: 16, fontWeight: "700", color: "#0A2346", textAlign: "center" },
  emptyChatSubtitle: { fontSize: 13, color: "#64748B", textAlign: "center", marginTop: 6, lineHeight: 18 },
  chatSecurityBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#ECFDF5", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 14 },
  chatSecurityText: { fontSize: 11, fontWeight: "600", color: "#059669" },

  chatBubbleUser: { alignSelf: "flex-end", backgroundColor: "#083B75", borderRadius: 16, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10, maxWidth: "80%", marginBottom: 10 },
  chatBubbleCA: { alignSelf: "flex-start", backgroundColor: "#F1F5F9", borderRadius: 16, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, maxWidth: "80%", marginBottom: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  chatSenderLabel: { fontSize: 11, fontWeight: "700", marginBottom: 3 },
  chatTextUser: { fontSize: 13.5, color: "#FFFFFF", lineHeight: 19 },
  chatTextCA: { fontSize: 13.5, color: "#0F172A", lineHeight: 19 },
  chatTimeUser: { fontSize: 10, color: "rgba(255,255,255,0.7)", alignSelf: "flex-end", marginTop: 4 },
  chatTimeCA: { fontSize: 10, color: "#94A3B8", alignSelf: "flex-end", marginTop: 4 },

  /* Bottom Actions */
  bottomActionBar: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingHorizontal: 16, paddingTop: 12, shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 8 },
  actionBtnFilled: { height: 48, borderRadius: 12, backgroundColor: "#FF5722", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  actionBtnFilledText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  chatInputBar: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#E2E8F0", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingTop: 10, gap: 10 },
  chatTextInput: { flex: 1, minHeight: 42, maxHeight: 100, backgroundColor: "#F8FAFC", borderRadius: 21, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: "#0F172A", borderWidth: 1, borderColor: "#E2E8F0" },
  chatSendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#FF5722", alignItems: "center", justifyContent: "center" },

  /* States: Loading & Not Found */
  loadingWrap: { flex: 1, backgroundColor: "#0A2346", justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#FFF", marginTop: 12, fontSize: 14 },
  errorContent: { flex: 1, backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, alignItems: "center", justifyContent: "center", padding: 24 },
  errorText: { fontSize: 16, fontWeight: "600", color: "#0F172A", marginTop: 12, marginBottom: 16 },

  /* Shared / Tab Layouts */
  flex1: { flex: 1 },
  tabContentGap: { gap: 14 },
  chatListWrap: { paddingVertical: 6 },
  chatSenderLabelUser: { color: "#FED7AA" },
  chatSenderLabelCA: { color: "#083B75" },
  docsListWrap: { gap: 12 },
  paymentRowsWrap: { gap: 10 },
  statusPillSmallText: { fontSize: 12, fontWeight: "700" },
  timelineWrap: { paddingLeft: 4, paddingTop: 4 },
  timelineRow: { flexDirection: "row", marginBottom: 6 },
  timelineLeftCol: { alignItems: "center", width: 28, marginRight: 10 },
  currentCircleText: { fontSize: 11, fontWeight: "800", color: "#FFF" },
  pendingCircleText: { fontSize: 10, fontWeight: "700", color: "#94A3B8" },
  cardRowsGap10: { gap: 10 },
  filingHeaderTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  changeItemRow: { marginBottom: 6 },
});
