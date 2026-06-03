import { Image } from "expo-image";
import type { ReactElement } from "react";
import { Pressable, ScrollView, Share, Text, TouchableOpacity, View } from "react-native";

import type { Season } from "@/domain/entities/Movie";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";

interface DetailsViewProps {
  isLoading: boolean;
  errorMessage?: string;
  title: string;
  description?: string;
  cast?: string[];
  releaseDate?: string;
  whereToWatch?: string[];
  seasons?: Season[];
  imageSrc?: string;
  mediaType: "movie" | "series";
  isMovieWatched: boolean;
  isUpdatingMovieWatched: boolean;
  onToggleMovieWatched: () => void;
  isEpisodeWatched: (seasonNumber: number, episodeNumber: number) => boolean;
  lastWatchedEpisodeLabel?: string;
  isUpdatingEpisodeWatched: boolean;
  onToggleEpisodeWatched: (seasonNumber: number, episodeNumber: number, watched: boolean) => void;
  seriesProgress: { watched: number; total: number };
}

function formatMetadata({
  releaseDate,
  seasons,
  mediaType,
}: Pick<DetailsViewProps, "releaseDate" | "seasons" | "mediaType">): string {
  const year = releaseDate?.slice(0, 4);
  const seasonCount = seasons?.length;
  const seasonLabel = mediaType === "series" && seasonCount ? `${seasonCount} ${seasonCount === 1 ? "Season" : "Seasons"}` : null;

  return [year, seasonLabel].filter(Boolean).join(" · ") || (mediaType === "series" ? "Series" : "Movie");
}

export function DetailsView({
  isLoading,
  errorMessage,
  title,
  description,
  cast,
  releaseDate,
  whereToWatch,
  seasons,
  imageSrc,
  mediaType,
  isMovieWatched,
  isUpdatingMovieWatched,
  onToggleMovieWatched,
  isEpisodeWatched,
  lastWatchedEpisodeLabel,
  isUpdatingEpisodeWatched,
  onToggleEpisodeWatched,
  seriesProgress,
}: DetailsViewProps): ReactElement {
  const { palette } = useThemePreference();
  const fallbackImage = require("../../assets/images/logo.png");
  const metadata = formatMetadata({ releaseDate, seasons, mediaType });
  const episodeProgressPercent = seriesProgress.total > 0 ? Math.round((seriesProgress.watched / seriesProgress.total) * 100) : 0;

  const handleShare = (): void => {
    void Share.share({ title, message: title });
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: palette.shellBackground }}>
        <Text style={{ color: palette.text, fontSize: 18 }}>Loading details…</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: palette.shellBackground, padding: 20 }}>
        <Text style={{ color: palette.text, fontSize: 18, fontWeight: "700" }}>Error loading details</Text>
        <Text style={{ color: palette.shellMutedText, marginTop: 10 }}>{errorMessage}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, minHeight: 0, backgroundColor: palette.shellBackground }}
      contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 96, gap: 16 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={{ borderRadius: 24, overflow: "hidden", backgroundColor: palette.shellSurface }}>
        <Image
          source={imageSrc ? { uri: imageSrc } : fallbackImage}
          placeholder={fallbackImage}
          style={{ width: "100%", height: 260 }}
        />
        <View
          style={{
            marginTop: -54,
            marginHorizontal: 14,
            marginBottom: 14,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: palette.shellBorder,
            backgroundColor: palette.shellSurface,
            padding: 14,
            gap: 12,
          }}
        >
          <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-end" }}>
            <Image
              source={imageSrc ? { uri: imageSrc } : fallbackImage}
              placeholder={fallbackImage}
              style={{ width: 76, height: 96, borderRadius: 12 }}
            />
            <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
              <Text style={{ color: palette.text, fontSize: 26, lineHeight: 30, fontWeight: "800" }} numberOfLines={2}>
                {title}
              </Text>
              <Text style={{ color: palette.shellMutedText, fontSize: 14, fontWeight: "600" }}>{metadata}</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={mediaType === "movie" ? onToggleMovieWatched : undefined}
              disabled={mediaType !== "movie" || isUpdatingMovieWatched}
              accessibilityRole="button"
              accessibilityState={{ selected: mediaType === "movie" ? isMovieWatched : false, disabled: mediaType !== "movie" || isUpdatingMovieWatched }}
              accessibilityLabel={mediaType === "movie" ? (isMovieWatched ? "Mark movie as unwatched" : "Mark movie as watched") : "Favorite status"}
              style={{
                flex: 1,
                minHeight: 44,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: palette.shellBorder,
                alignItems: "center",
                justifyContent: "center",
                opacity: isUpdatingMovieWatched ? 0.6 : 1,
              }}
            >
              <Text style={{ color: palette.text, fontWeight: "700" }}>
                {mediaType === "movie" ? (isMovieWatched ? "Watched" : "Mark watched") : "Favorite"}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleShare}
              accessibilityRole="button"
              accessibilityLabel={`Share ${title}`}
              style={{
                flex: 1,
                minHeight: 44,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: palette.shellBorder,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: palette.text, fontWeight: "700" }}>Share</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {mediaType === "series" ? (
        <View
          style={{
            borderWidth: 1,
            borderColor: palette.shellBorder,
            borderRadius: 18,
            backgroundColor: palette.shellSurface,
            padding: 14,
            gap: 10,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: palette.text, fontSize: 18, fontWeight: "800" }}>Episodes</Text>
            <Text style={{ color: palette.shellMutedText, fontWeight: "700" }}>{episodeProgressPercent}%</Text>
          </View>
          <Text style={{ color: palette.text, fontSize: 15, fontWeight: "700" }}>
            {seriesProgress.watched} / {seriesProgress.total} Episodes
          </Text>
          <View style={{ height: 6, borderRadius: 999, overflow: "hidden", backgroundColor: palette.shellBorder }}>
            <View style={{ height: "100%", width: `${episodeProgressPercent}%`, backgroundColor: "#3B82F6" }} />
          </View>
          <Text style={{ color: palette.shellMutedText, fontSize: 13 }}>
            {lastWatchedEpisodeLabel ? `Last watched: ${lastWatchedEpisodeLabel}` : "No watched episodes yet"}
          </Text>
        </View>
      ) : null}

      <View style={{ gap: 8 }}>
        <Text style={{ color: palette.shellMutedText, fontSize: 12, fontWeight: "700", textTransform: "uppercase" }}>Description / Synopsis</Text>
        <Text style={{ color: palette.text, fontSize: 16, lineHeight: 24 }}>{description || "Not available"}</Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: palette.shellMutedText, fontSize: 12, fontWeight: "700", textTransform: "uppercase" }}>Cast</Text>
        <Text style={{ color: palette.text, fontSize: 16, lineHeight: 24 }}>
          {cast && cast.length > 0 ? cast.join(", ") : "Not available"}
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: palette.shellMutedText, fontSize: 12, fontWeight: "700", textTransform: "uppercase" }}>Release date</Text>
        <Text style={{ color: palette.text, fontSize: 16 }}>{releaseDate || "Not available"}</Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: palette.shellMutedText, fontSize: 12, fontWeight: "700", textTransform: "uppercase" }}>Where to watch</Text>
        <Text style={{ color: palette.text, fontSize: 16 }}>
          {whereToWatch && whereToWatch.length > 0 ? whereToWatch.join(", ") : "Not available"}
        </Text>
      </View>

      {mediaType === "series" && (
        <View style={{ gap: 10 }}>
          <Text style={{ color: palette.shellMutedText, fontSize: 12, fontWeight: "700", textTransform: "uppercase" }}>
            Seasons and episodes
          </Text>
          <Text style={{ color: palette.text, fontSize: 16, fontWeight: "700" }}>
            Progress: {seriesProgress.watched}/{seriesProgress.total} watched
          </Text>

          {seasons && seasons.length > 0 ? (
            seasons.map((season) => (
              <View
                key={`season-${season.seasonNumber}`}
                style={{ backgroundColor: palette.shellSurface, borderColor: palette.shellBorder, borderWidth: 1, borderRadius: 14, padding: 12, gap: 8 }}
              >
                <Text style={{ color: palette.text, fontSize: 18, fontWeight: "700" }}>
                  {season.title || `Season ${season.seasonNumber}`}
                </Text>

                {season.episodes.map((episode) => {
                  const episodeWatched = isEpisodeWatched(season.seasonNumber, episode.episodeNumber);

                  return (
                    <TouchableOpacity
                      key={`episode-${season.seasonNumber}-${episode.episodeNumber}`}
                      onPress={() =>
                        onToggleEpisodeWatched(
                          season.seasonNumber,
                          episode.episodeNumber,
                          !episodeWatched
                        )
                      }
                      disabled={isUpdatingEpisodeWatched}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: episodeWatched, disabled: isUpdatingEpisodeWatched }}
                      accessibilityLabel={`${episodeWatched ? "Unmark" : "Mark"} season ${season.seasonNumber} episode ${episode.episodeNumber} as watched`}
                      style={{
                        backgroundColor: episodeWatched ? palette.shellChipActive : palette.shellBackground,
                        borderColor: episodeWatched ? palette.shellChipActive : palette.shellBorder,
                        borderRadius: 10,
                        borderWidth: 1,
                        gap: 2,
                        opacity: isUpdatingEpisodeWatched ? 0.6 : 1,
                        padding: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: episodeWatched ? palette.shellChipTextActive : palette.text,
                          fontSize: 15,
                          fontWeight: episodeWatched ? "700" : "400",
                        }}
                      >
                        {episodeWatched ? "✓ " : ""}E{episode.episodeNumber}. {episode.title}
                      </Text>
                      <Text
                        style={{
                          color: episodeWatched ? palette.shellChipTextActive : palette.shellMutedText,
                          fontSize: 13,
                        }}
                      >
                        Release: {episode.releaseDate || "Not available"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          ) : (
            <Text style={{ color: palette.text, fontSize: 16 }}>No seasons available</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}
