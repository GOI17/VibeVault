import { Image } from "expo-image";
import type { ReactElement } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import type { Season } from "@/domain/entities/Movie";
import { createEpisodeWatchedKey } from "@/domain/entities/WatchedProgress";
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
  watchedEpisodeKeys: ReadonlySet<string>;
  isUpdatingEpisodeWatched: boolean;
  onToggleEpisodeWatched: (seasonNumber: number, episodeNumber: number, watched: boolean) => void;
  seriesProgress: { watched: number; total: number };
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
  watchedEpisodeKeys,
  isUpdatingEpisodeWatched,
  onToggleEpisodeWatched,
  seriesProgress,
}: DetailsViewProps): ReactElement {
  const { palette } = useThemePreference();
  const fallbackImage = require("../../assets/images/logo.png");

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: palette.shellBackground }}>
        <Text style={{ color: palette.text, fontSize: 18 }}>Loading details...</Text>
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
    <ScrollView style={{ flex: 1, backgroundColor: palette.shellBackground }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Image
        source={imageSrc ? { uri: imageSrc } : fallbackImage}
        placeholder={fallbackImage}
        style={{ width: "100%", height: 260, borderRadius: 18 }}
      />

      <Text style={{ color: palette.text, fontSize: 30, lineHeight: 34, fontWeight: "800" }}>{title}</Text>

      {mediaType === "movie" ? (
        <TouchableOpacity
          onPress={onToggleMovieWatched}
          disabled={isUpdatingMovieWatched}
          accessibilityRole="button"
          accessibilityState={{ selected: isMovieWatched, disabled: isUpdatingMovieWatched }}
          accessibilityLabel={isMovieWatched ? "Mark movie as unwatched" : "Mark movie as watched"}
          style={{
            alignSelf: "flex-start",
            backgroundColor: isMovieWatched ? palette.shellChipActive : palette.shellSurface,
            borderColor: isMovieWatched ? palette.shellChipActive : palette.shellBorder,
            borderRadius: 18,
            borderWidth: 1,
            opacity: isUpdatingMovieWatched ? 0.6 : 1,
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          <Text
            style={{
              color: isMovieWatched ? palette.shellChipTextActive : palette.text,
              fontSize: 15,
              fontWeight: "700",
            }}
          >
            {isMovieWatched ? "Watched" : "Mark as watched"}
          </Text>
        </TouchableOpacity>
      ) : null}

      <View style={{ gap: 8 }}>
        <Text style={{ color: palette.shellMutedText, fontSize: 12, fontWeight: "700", textTransform: "uppercase" }}>Descripción / Sinopsis</Text>
        <Text style={{ color: palette.text, fontSize: 16, lineHeight: 24 }}>{description || "No disponible"}</Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: palette.shellMutedText, fontSize: 12, fontWeight: "700", textTransform: "uppercase" }}>Elenco</Text>
        <Text style={{ color: palette.text, fontSize: 16, lineHeight: 24 }}>
          {cast && cast.length > 0 ? cast.join(", ") : "No disponible"}
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: palette.shellMutedText, fontSize: 12, fontWeight: "700", textTransform: "uppercase" }}>Fecha de estreno</Text>
        <Text style={{ color: palette.text, fontSize: 16 }}>{releaseDate || "No disponible"}</Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: palette.shellMutedText, fontSize: 12, fontWeight: "700", textTransform: "uppercase" }}>Dónde ver</Text>
        <Text style={{ color: palette.text, fontSize: 16 }}>
          {whereToWatch && whereToWatch.length > 0 ? whereToWatch.join(", ") : "No disponible"}
        </Text>
      </View>

      {mediaType === "series" && (
        <View style={{ gap: 10 }}>
          <Text style={{ color: palette.shellMutedText, fontSize: 12, fontWeight: "700", textTransform: "uppercase" }}>
            Temporadas y episodios
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
                  {season.title || `Temporada ${season.seasonNumber}`}
                </Text>

                {season.episodes.map((episode) => {
                  const episodeKey = createEpisodeWatchedKey(season.seasonNumber, episode.episodeNumber);
                  const isEpisodeWatched = watchedEpisodeKeys.has(episodeKey);

                  return (
                    <TouchableOpacity
                      key={`episode-${season.seasonNumber}-${episode.episodeNumber}`}
                      onPress={() =>
                        onToggleEpisodeWatched(
                          season.seasonNumber,
                          episode.episodeNumber,
                          !isEpisodeWatched
                        )
                      }
                      disabled={isUpdatingEpisodeWatched}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isEpisodeWatched, disabled: isUpdatingEpisodeWatched }}
                      accessibilityLabel={`${isEpisodeWatched ? "Unmark" : "Mark"} season ${season.seasonNumber} episode ${episode.episodeNumber} as watched`}
                      style={{
                        backgroundColor: isEpisodeWatched ? palette.shellChipActive : palette.shellBackground,
                        borderColor: isEpisodeWatched ? palette.shellChipActive : palette.shellBorder,
                        borderRadius: 10,
                        borderWidth: 1,
                        gap: 2,
                        opacity: isUpdatingEpisodeWatched ? 0.6 : 1,
                        padding: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: isEpisodeWatched ? palette.shellChipTextActive : palette.text,
                          fontSize: 15,
                          fontWeight: isEpisodeWatched ? "700" : "400",
                        }}
                      >
                        {isEpisodeWatched ? "✓ " : ""}E{episode.episodeNumber}. {episode.title}
                      </Text>
                      <Text
                        style={{
                          color: isEpisodeWatched ? palette.shellChipTextActive : palette.shellMutedText,
                          fontSize: 13,
                        }}
                      >
                        Lanzamiento: {episode.releaseDate || "No disponible"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          ) : (
            <Text style={{ color: palette.text, fontSize: 16 }}>No hay temporadas disponibles</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}
