import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useTheme } from "../../hooks/use-theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSupportStore } from "../../store/supportStore";

/**
 * General support chat, not tied to any application.
 *
 * A static route, so it takes precedence over chat/[id] for the path /chat/support.
 * Messages live in component state - there is no support thread in the stores yet,
 * so the conversation resets when the screen is closed.
 */

const QUICK_REPLIES = [
  "Track my application",
  "Document help",
  "Payment issue",
  "Talk to an expert",
];

export default function SupportChatScreen() {
  const colors = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const messages = useSupportStore((state) => state.messages);
  const sendMessage = useSupportStore((state) => state.sendMessage);
  const receiveReply = useSupportStore((state) => state.receiveReply);

  const [inputMessage, setInputMessage] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    const t = setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    return () => clearTimeout(t);
  }, [messages]);

  // Any pending canned reply is dropped when the screen goes away.
  useEffect(() => () => clearTimeout(replyTimer.current), []);

  const send = (raw: string) => {
    const text = sendMessage(raw);
    if (!text) return;

    setInputMessage("");

    clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => receiveReply(text), 900);
  };

  const showQuickReplies = messages.length === 1;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      {/* Header */}
      <View style={{ backgroundColor: colors.primaryDark, paddingTop: insets.top }}>
        <FocusAwareStatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerAvatar}>
            <Ionicons name="headset" size={20} color="#FFFFFF" />
          </View>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>TaxEdge Support</Text>
            <Text style={styles.headerSubtitle}>Online · replies in a few minutes</Text>
          </View>

          <View style={styles.statusDot} />
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.systemAlert,
            { backgroundColor: colors.backgroundElement, borderColor: colors.border },
          ]}
        >
          <Ionicons name="shield-checkmark" size={16} color={colors.success} />
          <Text style={[styles.systemAlertText, { color: colors.textSecondary }]}>
            This chat is encrypted and monitored for service quality.
          </Text>
        </View>

        {messages.map((message) => {
          const isUser = message.sender === "user";
          return (
            <View
              key={message.id}
              style={[
                styles.messageBubbleContainer,
                isUser ? styles.userBubbleContainer : styles.staffBubbleContainer,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  {
                    backgroundColor: isUser ? colors.primary : colors.backgroundElement,
                    borderColor: colors.border,
                    borderWidth: isUser ? 0 : 1,
                  },
                ]}
              >
                <Text
                  style={[styles.messageText, { color: isUser ? "#FFFFFF" : colors.text }]}
                >
                  {message.text}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    { color: isUser ? "#E2E8F0" : colors.textSecondary },
                  ]}
                >
                  {message.timestamp}
                </Text>
              </View>
            </View>
          );
        })}

        {showQuickReplies && (
          <View style={styles.quickWrap}>
            {QUICK_REPLIES.map((reply) => (
              <TouchableOpacity
                key={reply}
                activeOpacity={0.75}
                onPress={() => send(reply)}
                style={[
                  styles.quickChip,
                  { backgroundColor: colors.backgroundElement, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.quickChipText, { color: colors.primary }]}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.backgroundElement,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <TextInput
          placeholder="Type your message..."
          placeholderTextColor={colors.textSecondary}
          value={inputMessage}
          onChangeText={setInputMessage}
          style={[
            styles.textInput,
            {
              color: colors.text,
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
          multiline
        />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => send(inputMessage)}
          style={[
            styles.sendBtn,
            {
              backgroundColor: inputMessage.trim()
                ? colors.primary
                : colors.backgroundSelected,
            },
          ]}
        >
          <Ionicons
            name="send"
            size={18}
            color={inputMessage.trim() ? "#FFFFFF" : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backBtn: { padding: 4 },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  headerTextContainer: { marginLeft: 12, flex: 1 },
  headerTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
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
  messagesContainer: { padding: 16, gap: 16 },
  systemAlert: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 8,
    marginBottom: 8,
  },
  systemAlertText: { fontSize: 11, fontWeight: "500", flex: 1 },
  messageBubbleContainer: { flexDirection: "row", width: "100%" },
  userBubbleContainer: { justifyContent: "flex-end" },
  staffBubbleContainer: { justifyContent: "flex-start" },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  messageText: { fontSize: 14, fontWeight: "500", lineHeight: 20 },
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
  quickChipText: { fontSize: 12.5, fontWeight: "700" },
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
