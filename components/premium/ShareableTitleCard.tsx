import type { ReactElement } from "react";
import { View, Text, Image, StyleSheet } from "react-native";

import { useThemePreference } from "@/providers/ThemePreferenceProvider";

interface ShareableTitleCardProps {
  title: string;
  year?: string;
  tagline?: string;
  imageSrc?: string;
  whereToWatch?: string[];
}

export function ShareableTitleCard({
  title,
  year,
  tagline,
  imageSrc,
  whereToWatch,
}: ShareableTitleCardProps): ReactElement {
  const { palette } = useThemePreference();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.shellSurface,
          borderColor: palette.shellBorder,
        },
      ]}
    >
      <View style={styles.imageContainer}>
        {imageSrc ? (
          <Image source={{ uri: imageSrc }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: palette.shellSurfaceAlt }]}>
            <Text style={{ color: palette.shellMutedText, fontWeight: "700" }}>VibeVault</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: palette.text }]} numberOfLines={2}>{title}</Text>
        {year ? <Text style={[styles.year, { color: palette.shellMutedText }]}>{year}</Text> : null}
        {tagline ? (
          <Text style={[styles.tagline, { color: palette.text }]} numberOfLines={3}>{tagline}</Text>
        ) : null}
        {whereToWatch && whereToWatch.length > 0 ? (
          <Text style={[styles.providers, { color: palette.tint }]} numberOfLines={2}>
            Watch on {whereToWatch.join(", ")}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 300,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: 160,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
  },
  year: {
    fontSize: 13,
  },
  tagline: {
    fontSize: 14,
    lineHeight: 20,
  },
  providers: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
  },
});
