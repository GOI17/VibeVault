import type { ReactElement } from "react";
import { View, Text, Image } from "react-native";

import { useThemePreference } from "@/providers/ThemePreferenceProvider";

interface ShareCardProps {
  title: string;
  year?: string;
  tagline?: string;
  imageSrc?: string;
  whereToWatch?: string[];
}

export function ShareCard({ title, year, tagline, imageSrc, whereToWatch }: ShareCardProps): ReactElement {
  const { palette } = useThemePreference();

  return (
    <View
      style={{
        width: 300,
        backgroundColor: palette.shellSurface,
        borderRadius: 16,
        overflow: "hidden",
        borderColor: palette.shellBorder,
        borderWidth: 1,
      }}
    >
      {imageSrc ? (
        <Image
          source={{ uri: imageSrc }}
          style={{ width: "100%", height: 160 }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: "100%",
            height: 160,
            backgroundColor: palette.shellSurfaceAlt,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: palette.shellMutedText, fontWeight: "700" }}>VibeVault</Text>
        </View>
      )}
      <View style={{ padding: 16, gap: 6 }}>
        <Text style={{ color: palette.text, fontSize: 18, fontWeight: "800" }}>{title}</Text>
        {year ? (
          <Text style={{ color: palette.shellMutedText, fontSize: 13 }}>{year}</Text>
        ) : null}
        {tagline ? (
          <Text style={{ color: palette.text, fontSize: 14, lineHeight: 20 }}>{tagline}</Text>
        ) : null}
        {whereToWatch && whereToWatch.length > 0 ? (
          <Text style={{ color: palette.tint, fontSize: 12, fontWeight: "700", marginTop: 6 }}>
            Watch on {whereToWatch.join(", ")}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
