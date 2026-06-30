import type { ReactElement } from "react";
import { Pressable, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";

interface ShareActionsProps {
  onShareLink: () => void;
  onShareImage: () => void;
}

export function ShareActions({ onShareLink, onShareImage }: ShareActionsProps): ReactElement {
  const { palette } = useThemePreference();

  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      <Pressable
        onPress={onShareLink}
        accessibilityRole="button"
        accessibilityLabel="Share link"
        style={{
          flex: 1,
          minHeight: 42,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: palette.shellBorder,
          flexDirection: "row",
          gap: 8,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconSymbol name="square.and.arrow.up" color={palette.text} size={18} />
        <Text style={{ color: palette.text, fontSize: 15, fontWeight: "700" }}>Share Link</Text>
      </Pressable>

      <Pressable
        onPress={onShareImage}
        accessibilityRole="button"
        accessibilityLabel="Share image"
        style={{
          flex: 1,
          minHeight: 42,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: palette.shellBorder,
          flexDirection: "row",
          gap: 8,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconSymbol name="photo" color={palette.text} size={18} />
        <Text style={{ color: palette.text, fontSize: 15, fontWeight: "700" }}>Share Image</Text>
      </Pressable>
    </View>
  );
}
