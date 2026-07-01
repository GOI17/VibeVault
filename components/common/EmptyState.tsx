import type { ReactElement, ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";

import { useThemePreference } from "@/providers/ThemePreferenceProvider";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message?: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps): ReactElement {
  const { palette } = useThemePreference();

  return (
    <View style={styles.container}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      {message ? (
        <Text style={[styles.message, { color: palette.shellMutedText }]}>{message}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 8,
  },
  icon: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
