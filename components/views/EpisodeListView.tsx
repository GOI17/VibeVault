import { useMemo, useState, type ReactElement } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";

export interface EpisodeListEpisodeViewModel {
  key: string;
  episodeNumber: number;
  title: string;
  releaseDate?: string;
  isWatched: boolean;
  isCurrent: boolean;
}

export interface EpisodeListSeasonViewModel {
  seasonNumber: number;
  label: string;
  watchedCount: number;
  progressPercent: number;
  episodes: EpisodeListEpisodeViewModel[];
}

interface EpisodeListViewProps {
  title: string;
  seasons: EpisodeListSeasonViewModel[];
  initialSeasonNumber: number;
  isUpdatingEpisodeWatched: boolean;
  onToggleEpisodeWatched: (seasonNumber: number, episodeNumber: number, watched: boolean) => void;
}

export function EpisodeListView({
  title,
  seasons,
  initialSeasonNumber,
  isUpdatingEpisodeWatched,
  onToggleEpisodeWatched,
}: EpisodeListViewProps): ReactElement {
  const { palette } = useThemePreference();
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(initialSeasonNumber);
  const [isSeasonSelectorOpen, setIsSeasonSelectorOpen] = useState(false);
  const selectedSeason = seasons.find((season) => season.seasonNumber === selectedSeasonNumber) ?? seasons[0];
  const seasonEpisodes = useMemo(() => selectedSeason?.episodes ?? [], [selectedSeason]);

  if (!selectedSeason) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: palette.shellBackground, padding: 20 }}>
        <Text style={{ color: palette.text, fontSize: 18, fontWeight: "700" }}>No episodes available</Text>
        <Text style={{ color: palette.shellMutedText, marginTop: 8, textAlign: "center" }}>
          This series does not include season information yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, minHeight: 0, backgroundColor: palette.shellBackground }}>
      <ScrollView
        style={{ flex: 1, minHeight: 0 }}
        contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 96, gap: 14 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={{ gap: 10, zIndex: 2, elevation: 2 }}>
          <Text style={{ color: palette.text, fontSize: 22, lineHeight: 26, fontWeight: "800" }}>{title}</Text>
          <View style={{ alignSelf: "flex-start", minWidth: 184, zIndex: 1000, elevation: 1000 }}>
            <TouchableOpacity
              onPress={() => setIsSeasonSelectorOpen((isOpen) => !isOpen)}
              accessibilityRole="button"
              accessibilityState={{ expanded: isSeasonSelectorOpen }}
              accessibilityLabel="Choose season"
              style={{
                minHeight: 56,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: palette.shellBorder,
                backgroundColor: palette.shellSurface,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 28,
                paddingHorizontal: 18,
                paddingVertical: 12,
              }}
            >
              <Text style={{ color: palette.text, fontSize: 20, fontWeight: "800" }}>{selectedSeason.label}</Text>
              <Text style={{ color: palette.text, fontSize: 28, lineHeight: 28 }}>{isSeasonSelectorOpen ? "⌃" : "⌄"}</Text>
            </TouchableOpacity>

            {isSeasonSelectorOpen ? (
              <View
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  marginTop: 8,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: palette.shellBorder,
                  backgroundColor: palette.shellSurface,
                  overflow: "hidden",
                  zIndex: 999,
                  elevation: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                }}
              >
                {seasons.map((season) => {
                  const isSelected = season.seasonNumber === selectedSeason.seasonNumber;

                  return (
                    <TouchableOpacity
                      key={season.seasonNumber}
                      onPress={() => {
                        setSelectedSeasonNumber(season.seasonNumber);
                        setIsSeasonSelectorOpen(false);
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`Show ${season.label}`}
                      style={{
                        paddingHorizontal: 18,
                        paddingVertical: 14,
                        backgroundColor: isSelected ? palette.shellChipActive : palette.shellSurface,
                      }}
                    >
                      <Text style={{ color: isSelected ? palette.shellChipTextActive : palette.text, fontSize: 16, fontWeight: "700" }}>
                        {season.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: palette.text, fontWeight: "700" }}>
                {selectedSeason.watchedCount} / {seasonEpisodes.length} Episodes
              </Text>
              <Text style={{ color: palette.shellMutedText, fontWeight: "700" }}>{selectedSeason.progressPercent}%</Text>
            </View>
            <View style={{ height: 6, borderRadius: 999, overflow: "hidden", backgroundColor: palette.shellBorder }}>
              <View style={{ height: "100%", width: `${selectedSeason.progressPercent}%`, backgroundColor: "#3B82F6" }} />
            </View>
          </View>
        </View>

        <View style={{ gap: 10, zIndex: 1 }}>
          {seasonEpisodes.map((episode) => {
            return (
              <TouchableOpacity
                key={episode.key}
                onPress={() => onToggleEpisodeWatched(selectedSeason.seasonNumber, episode.episodeNumber, !episode.isWatched)}
                disabled={isUpdatingEpisodeWatched}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: episode.isWatched, disabled: isUpdatingEpisodeWatched }}
                accessibilityLabel={`${episode.isWatched ? "Unmark" : "Mark"} episode ${episode.episodeNumber} as watched`}
                style={{
                  minHeight: 64,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: episode.isCurrent ? "#3B82F6" : palette.shellBorder,
                  backgroundColor: palette.shellSurface,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  opacity: isUpdatingEpisodeWatched ? 0.7 : 1,
                }}
              >
                <IconSymbol
                  name={episode.isWatched ? "checkmark" : episode.isCurrent ? "arrow.up.right" : "circle"}
                  color={episode.isWatched ? "#7CFF4E" : episode.isCurrent ? "#3B82F6" : palette.shellMutedText}
                  size={24}
                />
                <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                  <Text style={{ color: palette.text, fontSize: 15, fontWeight: "700" }} numberOfLines={1}>
                    {`Episode ${episode.episodeNumber}: ${episode.title}`}
                  </Text>
                  <Text style={{ color: palette.shellMutedText, fontSize: 13 }} numberOfLines={1}>
                    {episode.releaseDate || "Release date unavailable"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
