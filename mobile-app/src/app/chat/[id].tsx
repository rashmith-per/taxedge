import React, { useState, useRef, useEffect } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useTheme } from "../../hooks/use-theme";
import { useApplicationStore } from "../../store/applicationStore";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

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
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [app?.chatHistory]);

  if (!app) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={{ backgroundColor: colors.primaryDark }}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chat</Text>
          </View>
        </SafeAreaView>
        <View style={styles.emptyContainer}>
          <Text style={{ color: colors.text }}>Application not found</Text>
        </View>
      </View>
    );
  }

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    addChatMessage(app.id, "user", inputMessage.trim());
    setInputMessage("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      {/* Header bar */}
      <View style={{ backgroundColor: colors.primaryDark, paddingTop: insets.top }}>
        <FocusAwareStatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{app.assignedExecutive}</Text>
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

        {app.chatHistory.map((message) => {
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
  container: {
    flex: 1,
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
  headerTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#E2E8F0",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
