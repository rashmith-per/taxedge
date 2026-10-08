import { Colors, type ThemeColors, type ThemeName } from "@/shared/constants/theme";
import { useThemeStore } from "@/design-system/theme/themeStore";

export type UseThemeResult = ThemeColors & {
  colors: ThemeColors;
  isDark: boolean;
  scheme: ThemeName;
};

export function useTheme(): UseThemeResult {
  const scheme = useThemeStore((state) => state.theme);
  const colors = Colors[scheme];

  return {
    ...colors,
    colors,
    isDark: scheme === "dark",
    scheme,
  };
}

export default useTheme;

