import { useQuery } from "@tanstack/react-query";
import { useMemo, type ReactElement } from "react";
import { ScrollView, Text, View } from "react-native";

import { useRepositories } from "@/providers/RepositoryProvider";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";
import type { AnalyticsEventKind } from "@/domain/entities/Analytics";

const EVENT_LABELS: Record<AnalyticsEventKind, string> = {
  app_open: "App opens",
  first_favorite: "First favorites",
  first_watched_episode: "First watched episodes",
  first_movie_watched: "First watched movies",
  share_generated: "Shares generated",
  return_after_7_days: "7-day returns",
  return_after_30_days: "30-day returns",
};

export default function AnalyticsScreen(): ReactElement {
  const { analyticsRepository } = useRepositories();
  const { palette } = useThemePreference();

  const { data: store } = useQuery({
    queryKey: ["analytics", "store"],
    queryFn: () => analyticsRepository.getStore(),
  });

  const counts = useMemo(() => {
    const initial: Record<AnalyticsEventKind, number> = {
      app_open: 0,
      first_favorite: 0,
      first_watched_episode: 0,
      first_movie_watched: 0,
      share_generated: 0,
      return_after_7_days: 0,
      return_after_30_days: 0,
    };

    if (!store) return initial;

    return store.events.reduce((acc, event) => {
      acc[event.kind] += 1;
      return acc;
    }, initial);
  }, [store]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.shellBackground }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
    >
      <Text style={{ color: palette.text, fontSize: 24, fontWeight: "800" }}>
        Analytics
      </Text>
      <Text style={{ color: palette.shellMutedText, fontSize: 14 }}>
        Local-first event counts. Data stays on this device until you export it.
      </Text>

      {Object.entries(EVENT_LABELS).map(([kind, label]) => (
        <View
          key={kind}
          style={{
            backgroundColor: palette.shellSurface,
            borderColor: palette.shellBorder,
            borderWidth: 1,
            borderRadius: 10,
            padding: 14,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: palette.text, fontSize: 15, fontWeight: "600" }}>{label}</Text>
          <Text style={{ color: palette.tint, fontSize: 18, fontWeight: "800" }}>
            {counts[kind as AnalyticsEventKind]}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
