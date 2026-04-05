import { View, Text } from "react-native";
import type { ReactElement } from "react";
import { Colors } from "@/constants/Colors";

const palette = Colors.light;

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export function EmptyState({
  title = "No favorites yet! 🎬",
  message = "Double-tap movies on the home screen to add them here, or use the add form to create custom entries.",
}: EmptyStateProps): ReactElement {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: palette.shellBackground,
        padding: 20,
      }}
    >
      <Text
        style={{
          color: palette.text,
          fontSize: 18,
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        {title}
      </Text>
      <Text style={{ color: palette.shellMutedText, fontSize: 14, textAlign: "center" }}>
        {message}
      </Text>
    </View>
  );
}
