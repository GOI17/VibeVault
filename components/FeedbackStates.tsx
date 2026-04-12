import { View, Text } from "react-native";
import type { ReactElement } from "react";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";

interface LoadingStateProps {
  message?: string;
}

interface ErrorStateProps {
  message: string;
  error?: Error | null;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps): ReactElement {
  const { palette } = useThemePreference();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: palette.shellBackground,
      }}
    >
      <Text style={{ color: palette.text, fontSize: 18 }}>{message}</Text>
    </View>
  );
}

export function ErrorState({
  message,
  error,
}: ErrorStateProps): ReactElement {
  const { palette } = useThemePreference();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: palette.shellBackground,
      }}
    >
      <Text style={{ color: palette.text, fontSize: 18 }}>{message}</Text>
      {error?.message && (
        <Text style={{ color: palette.shellMutedText, fontSize: 14, marginTop: 10 }}>
          {error.message}
        </Text>
      )}
    </View>
  );
}
