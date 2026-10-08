import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useTheme } from "@/hooks/use-theme";
import { useApplicationStore } from "@/store/applicationStore";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { logger } from "@/core/logging/logger";
import { chatStyles as styles } from "@/styles/app/chat/chat.styles";

export default function ChatScreen() {
  const colors = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const applications = useApplicationStore((state) => state.applications);
  const addChatMessage = useApplicationStore((state) => state.addChatMessage);
  const app = applications.find((a) => a.id === id);

  const [inputMessage, setInputMessage] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    try {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    } catch (err) {
      logger.debug("[ChatScreen] Scroll to end fallback", { error: err });
    }
  }, [app?.chatHistory]);

  const handleSend = useCallback(() => {
    if (!app || !inputMessage.trim()) return;
    try {
      addChatMessage(app.id, "user", inputMessage.trim());
      setInputMessage("");
    } catch (err) {
      logger.warn("[ChatScreen] Failed to send chat message:", { appId: app.id, error: err });
    }
  }, [app, inputMessage, addChatMessage]);

  if (!app) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={[styles.headerWrap, { backgroundColor: colors.primaryDark }]}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chat</Text>
          </View>
        </SafeAreaView>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>Application not found</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      {/* Header bar */}
      <View style={[styles.headerWrap, { backgroundColor: colors.primaryDark, paddingTop: insets.top }]}>
        <FocusAwareStatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{app.assignedExecutive || "Executive"}</Text>
            <Text style={styles.headerSubtitle}>
              {app.serviceName} representative
            </Text>
          </View>
          <View style={styles.statusDot} />
        </View>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.systemAlert,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="shield-checkmark" size={16} color={colors.success} />
          <Text
            style={[styles.systemAlertText, { color: colors.textSecondary }]}
          >
            This chat is encrypted and monitored for service quality.
          </Text>
        </View>

        {(app.chatHistory || []).map((message) => {
          const isUser = message.sender === "user";
          return (
            <View
              key={message.id}
              style={[
                styles.messageBubbleContainer,
                isUser
                  ? styles.userBubbleContainer
                  : styles.staffBubbleContainer,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  {
                    backgroundColor: isUser
                      ? colors.primary
                      : colors.backgroundElement,
                    borderColor: colors.border,
                    borderWidth: isUser ? 0 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: isUser ? "#FFFFFF" : colors.text },
                  ]}
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
      </ScrollView>

      {/* Message Input Controls */}
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
          onPress={handleSend}
          style={[
            styles.sendBtn,
            {
              backgroundColor: inputMessage.trim()
                ? colors.primary
                : colors.backgroundSelected,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Send message"
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
