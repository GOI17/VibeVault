import { useQuery } from "@tanstack/react-query";
import { type ReactElement } from "react";

import { DeviceRewindCard } from "@/components/premium/DeviceRewindCard";
import { useRepositories } from "@/providers/RepositoryProvider";
import { computeDeviceRewind } from "@/domain/utils/deviceRewind";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";
import { useShareCardImage } from "@/hooks/useShareCardImage";

export function RewindContainer(): ReactElement {
  const { palette } = useThemePreference();
  const { favoriteRepository, watchedProgressRepository } = useRepositories();
  const { ref: cardRef, captureAndShare } = useShareCardImage();

  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => favoriteRepository.getAll(),
  });

  const { data: progressStore } = useQuery({
    queryKey: ["watched-progress", "store"],
    queryFn: () => watchedProgressRepository.exportStore(),
  });

  const stats = computeDeviceRewind(
    favorites,
    progressStore?.movies ?? [],
    progressStore?.episodes ?? []
  );

  const handleShare = () => {
    void captureAndShare({
      title: `${stats.year} Rewind`,
      tagline: `${stats.moviesWatched} movies · ${stats.episodesWatched} episodes · ${stats.seriesCount} series`,
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.shellBackground }}
      contentContainerStyle={{ padding: 16, gap: 16, alignItems: "center" }}
    >
      <Text style={{ color: palette.text, fontSize: 24, fontWeight: "800" }}>Rewind</Text>
      <Text style={{ color: palette.shellMutedText, fontSize: 14 }}>
        Your year in review, generated on this device.
      </Text>

      <View ref={cardRef} style={{ opacity: 1 }}>
        <DeviceRewindCard stats={stats} />
      </View>

      <Pressable
        onPress={handleShare}
        style={{
          backgroundColor: palette.shellChipActive,
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 24,
        }}
      >
        <Text style={{ color: palette.shellChipTextActive, fontWeight: "800" }}>Share Rewind</Text>
      </Pressable>

      {
        /* Hidden capture card for consistent sizing */
      }
      <View
        ref={cardRef}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", left: -9999 }}
      >
        <DeviceRewindCard stats={stats} />
      </View>
    </ScrollView>
  );
}
