import React, { type ReactNode } from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useTheme } from "../hooks/use-theme";
import { AppHeader } from "./AppHeader";
import {
  FLOATING_TAB_HEIGHT,
  FLOATING_TAB_GAP,
} from "./FloatingTabBar";

/**
 * The common shell for every tab screen.
 *
 *   <ScreenLayout title="Payments">
 *     <ScrollView contentContainerStyle={styles.scrollContent}>...</ScrollView>
 *   </ScreenLayout>
 *
 * It owns everything that must not change between tabs: the navy status bar,
 * the header (logo left, title centred, bell right, one fixed height), and the
 * page background. The floating tab bar is NOT rendered here - it lives in the
 * navigator, above the scene, so it never unmounts or re-measures when the
 * route changes. That is what keeps it from jumping between tabs.
 */

/** Horizontal padding every screen's content should use. */
export const SCREEN_PADDING = 16;

/**
 * Bottom padding for a screen's scroll content: clears the floating bar plus
 * a little breathing room, so a card or button is never trapped underneath it.
 * Screens use this instead of their own insets math, so all tabs end alike.
 */
export const SCREEN_BOTTOM_PADDING = FLOATING_TAB_HEIGHT + FLOATING_TAB_GAP + 24;

export interface ScreenLayoutProps {
  title: string;
  children?: ReactNode;
  showBack?: boolean;
  showNotification?: boolean;
  onBack?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ScreenLayout({
  title,
  children,
  showBack = false,
  showNotification = true,
  onBack,
  style,
}: ScreenLayoutProps) {
  const colors = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, style]}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <AppHeader
        title={title}
        showBack={showBack}
        showNotification={showNotification}
        onBack={onBack}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
