import { Image } from "expo-image";
import type { ReactElement } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/IconSymbol";
import type { Season } from "@/domain/entities/Movie";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";
import Toast from "react-native-toast-message";
import { useShare } from "@/hooks/useShare";
import { StreamingLinks } from "@/components/premium/StreamingLinks";
import { PremiumGate } from "@/components/premium/PremiumGate";
import type { StreamingLink } from "@/domain/entities/StreamingPlatform";

interface DetailsViewProps {
  id: string;
  isLoading: boolean;
  errorMessage?: string;
  title: string;
  description?: string;
  cast?: string[];
  releaseDate?: string;
  whereToWatch?: string[];
  streamingLinks?: StreamingLink[];
  seasons?: Season[];
  imageSrc?: string;
  mediaType: "movie" | "series";
  isFavorite: boolean;
  isUpdatingFavorite: boolean;
  onToggleFavorite: () => void;
  isWatched?: boolean;
  isUpdatingWatched?: boolean;
  onToggleWatched?: () => void;
  lastWatchedEpisodeLabel?: string;
  seriesProgress: { watched: number; total: number };
  onOpenEpisodeList: () => void;
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

function DetailRow({ label, value }: { label: string; value: string }): ReactElement {
  const { palette } = useThemePreference();

  return (
    <View
      style={{
        borderTopColor: palette.shellBorder,
        borderTopWidth: 1,
        flexDirection: "row",
        gap: 14,
        paddingVertical: 10,
      }}
    >
      <Text style={{ color: palette.shellMutedText, flex: 0.36, fontSize: 14 }}>{label}</Text>
      <View style={{ flex: 0.64 }}>
        <Text style={{ color: palette.text, fontSize: 14, lineHeight: 19 }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export function DetailsView({
  id,
  isLoading,
  errorMessage,
  title,
  description,
  cast,
  releaseDate,
  whereToWatch,
  streamingLinks,
  seasons,
  imageSrc,
  mediaType,
  isFavorite,
  isUpdatingFavorite,
  onToggleFavorite,
  isWatched,
  isUpdatingWatched,
  onToggleWatched,
  lastWatchedEpisodeLabel,
  seriesProgress,
  onOpenEpisodeList,
}: DetailsViewProps): ReactElement {
  const { palette } = useThemePreference();
  const fallbackImage = require("../../assets/images/logo.png");
  const metadata = formatMetadata({ releaseDate, seasons, mediaType });
  const episodeProgressPercent = seriesProgress.total > 0 ? Math.round((seriesProgress.watched / seriesProgress.total) * 100) : 0;

  const share = useShare();
  const handleShare = (): void => {
    void share({ id, mediaType, title, imageSrc, description, cast, releaseDate, whereToWatch, seasons }).catch(() => {
      Toast.show({
        type: "info",
        text1: "Share unavailable",
        text2: "Use your browser controls to copy this page link.",
        visibilityTime: 2000,
        position: "top",
      });
    });
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
      contentContainerStyle={{ flexGrow: 1, alignItems: "center", padding: 8, paddingBottom: 96 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View
        style={{
          width: "100%",
          maxWidth: 480,
          borderColor: palette.shellBorder,
          borderRadius: 24,
          borderWidth: 1,
          borderTopWidth: 0,
          backgroundColor: palette.shellSurface,
          overflow: "hidden",
        }}
      >
        <View style={{ minHeight: 168 }}>
          <Image
            source={imageSrc ? { uri: imageSrc } : fallbackImage}
            placeholder={fallbackImage}
            style={{ width: "100%", height: 178 }}
          />
        </View>

        <View style={{ marginTop: -42, paddingHorizontal: 20, paddingBottom: 18, gap: 12 }}>
          <View style={{ flexDirection: "row", gap: 14, alignItems: "flex-end" }}>
            <Image
              source={imageSrc ? { uri: imageSrc } : fallbackImage}
              placeholder={fallbackImage}
              style={{ width: 82, height: 82, borderRadius: 12 }}
            />
            <View style={{ flex: 1, minWidth: 0, gap: 5, paddingBottom: 4 }}>
              <Text style={{ color: palette.text, fontSize: 24, lineHeight: 28, fontWeight: "800" }} numberOfLines={1}>
                {title}
              </Text>
              <Text style={{ color: palette.shellMutedText, fontSize: 14, fontWeight: "600" }}>{metadata}</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={onToggleFavorite}
              disabled={isUpdatingFavorite}
              accessibilityRole="button"
              accessibilityState={{ selected: isFavorite, disabled: isUpdatingFavorite }}
              accessibilityLabel={isFavorite ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
              style={{
                flex: 1,
                minHeight: 42,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: palette.shellBorder,
                flexDirection: "row",
                gap: 8,
                alignItems: "center",
                justifyContent: "center",
                opacity: isUpdatingFavorite ? 0.6 : 1,
              }}
            >
              <IconSymbol name={isFavorite ? "heart.fill" : "heart"} color="#FF2D55" size={18} />
              <Text style={{ color: palette.text, fontSize: 15, fontWeight: "700" }}>
                {isFavorite ? "Favorited" : "Favorite"}
              </Text>
            </Pressable>
            {mediaType === "movie" && onToggleWatched ? (
              <Pressable
                onPress={onToggleWatched}
                disabled={isUpdatingWatched}
                accessibilityRole="button"
                accessibilityState={{ selected: isWatched, disabled: isUpdatingWatched }}
                accessibilityLabel={isWatched ? `Mark ${title} as not watched` : `Mark ${title} as watched`}
                style={{
                  flex: 1,
                  minHeight: 42,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: palette.shellBorder,
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: isUpdatingWatched ? 0.6 : 1,
                }}
              >
                <IconSymbol name={isWatched ? "eye.fill" : "eye"} color="#34C759" size={18} />
                <Text style={{ color: palette.text, fontSize: 15, fontWeight: "700" }}>
                  {isWatched ? "Watched" : "Watch"}
                </Text>
              </Pressable>
            ) : mediaType === "series" ? (
              <Pressable
                onPress={onOpenEpisodeList}
                accessibilityRole="button"
                accessibilityLabel="Open episode list"
                style={{
                  flex: 1,
                  minHeight: 42,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: palette.shellBorder,
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#3B82F6", fontSize: 16, fontWeight: "900" }}>▶</Text>
                <Text style={{ color: palette.text, fontSize: 15, fontWeight: "700" }}>Episodes</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleShare}
                accessibilityRole="button"
                accessibilityLabel={`Share ${title}`}
                style={{
                  flex: 1,
                  minHeight: 42,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: palette.shellBorder,
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconSymbol name="square.and.arrow.up" color={palette.text} size={18} />
                <Text style={{ color: palette.text, fontSize: 15, fontWeight: "700" }}>Share</Text>
              </Pressable>
            )}
          </View>

          {mediaType === "series" ? (
            <Pressable
              onPress={onOpenEpisodeList}
              accessibilityRole="button"
              accessibilityLabel="Open episode list"
              style={{
                borderColor: palette.shellBorder,
                borderRadius: 10,
                borderWidth: 1,
                padding: 14,
                gap: 9,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: palette.text, fontSize: 18, fontWeight: "800" }}>Episodes</Text>
                <Text style={{ color: palette.text, fontSize: 26, lineHeight: 26 }}>›</Text>
              </View>
              <Text style={{ color: palette.text, fontSize: 15, fontWeight: "700" }}>
                {seriesProgress.watched} / {seriesProgress.total} Episodes
              </Text>
              <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                <View style={{ flex: 1, height: 6, borderRadius: 999, overflow: "hidden", backgroundColor: palette.shellBorder }}>
                  <View style={{ height: "100%", width: `${episodeProgressPercent}%`, backgroundColor: "#3B82F6" }} />
                </View>
                <Text style={{ color: palette.text, fontSize: 13, fontWeight: "700" }}>{episodeProgressPercent}%</Text>
              </View>
              <Text style={{ color: palette.shellMutedText, fontSize: 13, lineHeight: 18 }}>
                {lastWatchedEpisodeLabel ? (
                  <>
                    <Text>Last watched:</Text>
                    {"\n"}
                    <Text>{lastWatchedEpisodeLabel}</Text>
                  </>
                ) : (
                  <Text>No watched episodes yet</Text>
                )}
              </Text>
            </Pressable>
          ) : null}

          <Text style={{ color: palette.text, fontSize: 15, lineHeight: 22 }}>
            {description || "Not available"}
          </Text>

          <View>
            <DetailRow label="Cast" value={cast && cast.length > 0 ? cast.join(", ") : "Not available"} />
            <DetailRow label="Where to Watch" value={whereToWatch && whereToWatch.length > 0 ? whereToWatch.join(", ") : "Not available"} />
            <View style={{ borderTopColor: palette.shellBorder, borderTopWidth: 1, paddingVertical: 10, gap: 10 }}>
              <Text style={{ color: palette.shellMutedText, fontSize: 14 }}>Watch Now</Text>
              <PremiumGate
                title="Premium Streaming Links"
                description="Upgrade to premium to open Netflix, Prime Video, Disney+ and more directly from this title."
              >
                <StreamingLinks links={streamingLinks ?? []} />
              </PremiumGate>
            </View>
            <View
              style={{
                borderTopColor: palette.shellBorder,
                borderTopWidth: 1,
                flexDirection: "row",
                gap: 14,
                paddingTop: 10,
              }}
            >
              <Text style={{ color: palette.shellMutedText, flex: 0.36, fontSize: 14 }}>Release Date</Text>
              <Text style={{ color: palette.text, flex: 0.64, fontSize: 14 }}>{releaseDate || "Not available"}</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
