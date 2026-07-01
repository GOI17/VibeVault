import type { ReactElement } from "react";
import { View, Text, StyleSheet } from "react-native";

import { useThemePreference } from "@/providers/ThemePreferenceProvider";
import type { DeviceRewindStats } from "@/domain/utils/deviceRewind";

interface DeviceRewindCardProps {
  stats: DeviceRewindStats;
}

export function DeviceRewindCard({ stats }: DeviceRewindCardProps): ReactElement {
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
      <Text style={[styles.heading, { color: palette.tint }]}>{stats.year} Rewind</Text>
      <Text style={[styles.subheading, { color: palette.text }]}>Your year in VibeVault</Text>

      <View style={styles.row}>
        <StatBox label="Movies" value={String(stats.moviesWatched)} palette={palette} />
        <StatBox label="Episodes" value={String(stats.episodesWatched)} palette={palette} />
        <StatBox label="Series" value={String(stats.seriesCount)} palette={palette} />
      </View>

      {stats.topMovie ? (
        <Text style={[styles.detail, { color: palette.text }]} numberOfLines={1}>
          Top movie: {stats.topMovie.title}
        </Text>
      ) : null}
      {stats.topSeries ? (
        <Text style={[styles.detail, { color: palette.text }]} numberOfLines={1}>
          Top series: {stats.topSeries.title}
        </Text>
      ) : null}
    </View>
  );
}

function StatBox({
  label,
  value,
  palette,
}: {
  label: string;
  value: string;
  palette: ReturnType<typeof useThemePreference>["palette"];
}): ReactElement {
  return (
    <View style={styles.stat}>
      <Text style={{ color: palette.tint, fontSize: 24, fontWeight: "800" }}>{value}</Text>
      <Text style={{ color: palette.shellMutedText, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 300,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 12,
    alignItems: "center",
  },
  heading: {
    fontSize: 22,
    fontWeight: "900",
  },
  subheading: {
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  stat: {
    alignItems: "center",
    minWidth: 70,
  },
  detail: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
});
