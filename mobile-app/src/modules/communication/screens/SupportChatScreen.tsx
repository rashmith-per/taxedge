import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useTheme } from "@/hooks/use-theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSupportStore } from "@/store/supportStore";
import { logger } from "@/core/logging/logger";
import { supportChatStyles as styles } from "./SupportChatScreen.styles";

const QUICK_REPLIES = [
  "Track my application",
  "Document help",
  "Payment issue",
  "Talk to an expert",
];

export function SupportChatScreen() {
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
    try {
      const t = setTimeout(
        () => scrollViewRef.current?.scrollToEnd({ animated: true }),
        100
      );
      return () => clearTimeout(t);
    } catch (err) {
      logger.debug("[SupportChat] Scroll error fallback", { error: err });
    }
  }, [messages]);

  // Drop pending canned replies when screen unmounts
  useEffect(() => {
    return () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
  }, []);

  const send = useCallback(
    (raw: string) => {
      try {
        const text = sendMessage(raw);
        if (!text) return;

        setInputMessage("");

        if (replyTimer.current) clearTimeout(replyTimer.current);
        replyTimer.current = setTimeout(() => {
          try {
            receiveReply(text);
          } catch (replyErr) {
            logger.warn("[SupportChat] Failed to receive canned reply:", { error: replyErr });
          }
        }, 900);
      } catch (err) {
        logger.warn("[SupportChat] Failed to send support message:", { error: err });
      }
    },
    [sendMessage, receiveReply]
  );

  const showQuickReplies = messages.length === 1;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      {/* Header */}
      <View
        style={[
          styles.headerWrap,
          { backgroundColor: colors.primaryDark, paddingTop: insets.top },
        ]}
      >
        <FocusAwareStatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
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
                accessibilityRole="button"
                accessibilityLabel={reply}
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
          accessibilityRole="button"
          accessibilityLabel="Send support message"
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

export default SupportChatScreen;
