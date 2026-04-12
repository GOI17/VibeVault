import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

type ThemeName = "light" | "dark";

interface ThemePreferenceContextType {
  theme: ThemeName;
  palette: typeof Colors.light;
  toggleTheme: () => void;
}

const ThemePreferenceContext = createContext<ThemePreferenceContextType | undefined>(undefined);

interface ThemePreferenceProviderProps {
  children: ReactNode;
}

export function ThemePreferenceProvider({ children }: ThemePreferenceProviderProps): ReactElement {
  const systemScheme = useColorScheme() === "dark" ? "dark" : "light";
  const [themeOverride, setThemeOverride] = useState<ThemeName | null>(null);

  const theme: ThemeName = themeOverride ?? systemScheme;

  const toggleTheme = useCallback((): void => {
    setThemeOverride((current) => {
      const currentTheme: ThemeName = current ?? systemScheme;
      return currentTheme === "light" ? "dark" : "light";
    });
  }, [systemScheme]);

  const value = useMemo<ThemePreferenceContextType>(
    () => ({
      theme,
      palette: Colors[theme],
      toggleTheme,
    }),
    [theme, toggleTheme]
  );

  return <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>;
}

export function useThemePreference(): ThemePreferenceContextType {
  const context = useContext(ThemePreferenceContext);

  if (!context) {
    throw new Error("useThemePreference must be used within a ThemePreferenceProvider");
  }

  return context;
}
