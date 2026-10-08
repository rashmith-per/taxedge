import { StyleSheet } from "react-native";

export const supportChatStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrap: {
    width: "100%",
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backBtn: {
    padding: 4,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#CBD9EA",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#16A34A",
    marginRight: 4,
  },
  messagesContainer: {
    padding: 16,
    gap: 16,
  },
  systemAlert: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 8,
    marginBottom: 8,
  },
  systemAlertText: {
    fontSize: 11,
    fontWeight: "500",
    flex: 1,
  },
  messageBubbleContainer: {
    flexDirection: "row",
    width: "100%",
  },
  userBubbleContainer: {
    justifyContent: "flex-end",
  },
  staffBubbleContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  messageText: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 9,
    fontWeight: "500",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  quickWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  quickChip: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    justifyContent: "center",
  },
  quickChipText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1.5,
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default supportChatStyles;
