import * as Linking from "expo-linking";
import type { ReactElement } from "react";
import { Pressable, Text, View } from "react-native";

import {
  getStreamingPlatformLabel,
  type StreamingLink,
} from "@/domain/entities/StreamingPlatform";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";

interface StreamingLinksProps {
  links: StreamingLink[];
}

export function StreamingLinks({ links }: StreamingLinksProps): ReactElement | null {
  const { palette } = useThemePreference();

  if (links.length === 0) {
    return null;
  }

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {links.map((link) => {
        const label = getStreamingPlatformLabel(link.platform);

        return (
          <Pressable
            key={link.platform}
            onPress={() => void Linking.openURL(link.webUrl)}
            accessibilityRole="button"
            accessibilityLabel={`Watch on ${label}`}
            style={{
              backgroundColor: palette.shellChipIdle,
              borderRadius: 8,
              paddingVertical: 8,
              paddingHorizontal: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Text style={{ color: palette.shellChipTextIdle, fontSize: 13, fontWeight: "700" }}>
              ▶ {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
