import { Image } from "expo-image";
import type { ReactElement } from "react";
import { ScrollView, Text, View } from "react-native";

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

          {seasons && seasons.length > 0 ? (
            seasons.map((season) => (
              <View
                key={`season-${season.seasonNumber}`}
                style={{ backgroundColor: palette.shellSurface, borderColor: palette.shellBorder, borderWidth: 1, borderRadius: 14, padding: 12, gap: 8 }}
              >
                <Text style={{ color: palette.text, fontSize: 18, fontWeight: "700" }}>
                  {season.title || `Temporada ${season.seasonNumber}`}
                </Text>

                {season.episodes.map((episode) => (
                  <View key={`episode-${season.seasonNumber}-${episode.episodeNumber}`} style={{ gap: 2 }}>
                    <Text style={{ color: palette.text, fontSize: 15 }}>
                      E{episode.episodeNumber}. {episode.title}
                    </Text>
                    <Text style={{ color: palette.shellMutedText, fontSize: 13 }}>
                      Lanzamiento: {episode.releaseDate || "No disponible"}
                    </Text>
                  </View>
                ))}
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
