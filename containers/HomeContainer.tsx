import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { useCallback, useMemo, useState, type ReactElement } from "react";
import Toast from "react-native-toast-message";

import type { RootStackParamList } from "@/app/navigation/types";
import type { PosterQueueItem } from "@/components/views/PosterQueue";
import { PosterQueueView } from "@/components/views/PosterQueueView";
import { queryOptions } from "@/constants/query";
import { createEpisodeWatchedKey } from "@/domain/entities/WatchedProgress";
import { useRepositories } from "@/providers/RepositoryProvider";
import type { Season } from "@/domain/entities/Movie";

interface CurrentEpisodeInfo {
  seasonNumber: number;
  episodeNumber: number;
  title?: string;
  label: string;
}

interface EnrichedFavoriteItem extends PosterQueueItem {
  currentEpisode?: CurrentEpisodeInfo;
  watchedCount: number;
  totalCount: number;
  progressLabel: string;
  progressPercent: number;
  nextEpisodeLabel?: string;
}

export function HomeContainer(): ReactElement {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const { watchedProgressRepository, favoriteRepository, movieRepository } = useRepositories();

  const { data: favoritesData, isLoading: isLoadingFavorites, error: errorFavorites } = useQuery({
    ...queryOptions.movies.favorites,
    queryFn: () => favoriteRepository.getAll(),
  });

  const favoriteItems = useMemo(
    () =>
      (favoritesData ?? []).map((fav) => ({
        key: fav.id,
        imageSrc: fav.url,
        title: fav.title,
        mediaType: fav.mediaType,
        description: fav.description,
        cast: fav.cast,
        releaseDate: fav.releaseDate,
        whereToWatch: fav.whereToWatch,
        seasons: fav.seasons,
        source: fav.source,
        watchStatus: "favorite" as const,
      })),
    [favoritesData],
  );

  const favoriteIds = useMemo(
    () => favoriteItems.map((item) => item.key).filter(Boolean),
    [favoriteItems],
  );

  const seriesFavoriteIdsWithoutSeasons = useMemo(
    () =>
      favoriteItems
        .filter((item) => item.mediaType === "series" && (!item.seasons || item.seasons.length === 0))
        .map((item) => item.key),
    [favoriteItems],
  );

  const seriesDetailsHydration = useQuery({
    queryKey: ["home-series-details", [...seriesFavoriteIdsWithoutSeasons].sort()],
    queryFn: async (): Promise<Record<string, Season[]>> => {
      const results: Record<string, Season[]> = {};
      await Promise.all(
        seriesFavoriteIdsWithoutSeasons.map(async (id) => {
          try {
            const details = await movieRepository.getById(id);
            if (details?.seasons && details.seasons.length > 0) {
              results[id] = details.seasons;
            }
          } catch {
            // Non-blocking: keep favorite visible but without episode info
          }
        }),
      );
      return results;
    },
    enabled: seriesFavoriteIdsWithoutSeasons.length > 0,
  });

  const movieWatchStatusQuery = useQuery({
    queryKey: ["watched-progress", "movies", "home-queue", [...favoriteIds].sort()],
    queryFn: async (): Promise<Record<string, boolean>> => {
      const results: Record<string, boolean> = {};
      await Promise.all(
        favoriteItems
          .filter((m) => m.mediaType === "movie")
          .map(async (m) => {
            const status = await watchedProgressRepository.getMovieStatus(m.key);
            results[m.key] = status?.watched ?? false;
          }),
      );
      return results;
    },
    enabled: favoriteIds.length > 0,
  });

  const episodeStatusQueries = useQuery({
    queryKey: ["watched-progress", "episodes", "home-queue", [...favoriteIds].sort()],
    queryFn: async () => {
      const results: Record<string, { seasonNumber: number; episodeNumber: number; watched: boolean; title?: string }[]> = {};
      await Promise.all(
        favoriteItems
          .filter((m) => m.mediaType === "series")
          .map(async (m) => {
            const episodes = await watchedProgressRepository.getEpisodeStatuses(m.key);
            results[m.key] = episodes;
          }),
      );
      return results;
    },
    enabled: favoriteIds.length > 0,
  });

  const enrichedFavoriteItems = useMemo((): EnrichedFavoriteItem[] => {
    return favoriteItems
      .filter((item): boolean => {
        if (item.mediaType === "movie") {
          return !(movieWatchStatusQuery.data?.[item.key] === true);
        }
        return true;
      })
      .map((item): EnrichedFavoriteItem => {
        const base = {
          ...item,
          watchedCount: 0,
          totalCount: 0,
          progressLabel: "",
          progressPercent: 0,
        };
        if (item.mediaType !== "series" || !episodeStatusQueries.data) {
          return base;
        }

        const seasons = item.seasons ?? seriesDetailsHydration.data?.[item.key];
        if (!seasons || seasons.length === 0) {
          return base;
        }

        const episodes = episodeStatusQueries.data[item.key] ?? [];
        const watchedKeys = new Set(
          episodes.filter((e) => e.watched).map((e) => createEpisodeWatchedKey(e.seasonNumber, e.episodeNumber))
        );

        let totalEpisodes = 0;
        let watchedEpisodes = 0;
        let firstUnwatched: { seasonNumber: number; episodeNumber: number; title?: string } | undefined;
        let nextUnwatched: { seasonNumber: number; episodeNumber: number; title?: string } | undefined;
        let foundFirst = false;

        for (const season of seasons) {
          for (const episode of season.episodes) {
            totalEpisodes++;
            const key = createEpisodeWatchedKey(season.seasonNumber, episode.episodeNumber);
            if (watchedKeys.has(key)) {
              watchedEpisodes++;
            } else {
              if (!foundFirst) {
                firstUnwatched = { seasonNumber: season.seasonNumber, episodeNumber: episode.episodeNumber, title: episode.title };
                foundFirst = true;
              } else if (!nextUnwatched) {
                nextUnwatched = { seasonNumber: season.seasonNumber, episodeNumber: episode.episodeNumber, title: episode.title };
              }
            }
          }
        }

        const currentEpisode: CurrentEpisodeInfo | undefined = firstUnwatched
          ? {
              seasonNumber: firstUnwatched.seasonNumber,
              episodeNumber: firstUnwatched.episodeNumber,
              title: firstUnwatched.title,
              label: `S${firstUnwatched.seasonNumber}E${firstUnwatched.episodeNumber}${firstUnwatched.title ? ` \u2022 ${firstUnwatched.title}` : ""}`,
            }
          : undefined;

        return {
          ...base,
          watchedCount: watchedEpisodes,
          totalCount: totalEpisodes,
          progressLabel: `${watchedEpisodes} / ${totalEpisodes} Episodes`,
          progressPercent: totalEpisodes > 0 ? Math.round((watchedEpisodes / totalEpisodes) * 100) : 0,
          currentEpisode,
          nextEpisodeLabel: nextUnwatched
            ? `S${nextUnwatched.seasonNumber}E${nextUnwatched.episodeNumber}${nextUnwatched.title ? ` \u2022 ${nextUnwatched.title}` : ""}`
            : undefined,
        };
      })
      .filter((item): boolean => {
        if (item.mediaType === "series") {
          const seasons = item.seasons ?? seriesDetailsHydration.data?.[item.key];
          if (seasons && seasons.length > 0 && item.totalCount > 0 && item.watchedCount === item.totalCount) {
            return false;
          }
        }
        return true;
      });
  }, [favoriteItems, movieWatchStatusQuery.data, episodeStatusQueries.data, seriesDetailsHydration.data]);

  const [activeFavoriteIndex, setActiveFavoriteIndex] = useState(0);

  const clampedActiveIndex = useMemo(() => {
    if (enrichedFavoriteItems.length === 0) return 0;
    return Math.min(Math.max(0, activeFavoriteIndex), enrichedFavoriteItems.length - 1);
  }, [activeFavoriteIndex, enrichedFavoriteItems.length]);

  const markMovieWatchedMutation = useMutation({
    mutationFn: (mediaId: string) => watchedProgressRepository.setMovieWatched(mediaId, true),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["watched-progress"] });
    },
    onError: (err) => {
      console.error("[HomeContainer] markMovieWatched failed:", err);
      Toast.show({ type: "error", text1: "Failed to mark as watched. Please try again." });
    },
  });

  const markEpisodeWatchedMutation = useMutation({
    mutationFn: (input: { mediaId: string; seasonNumber: number; episodeNumber: number }) =>
      watchedProgressRepository.setEpisodeWatched({
        mediaId: input.mediaId,
        seasonNumber: input.seasonNumber,
        episodeNumber: input.episodeNumber,
        watched: true,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["watched-progress"] });
    },
    onError: (err) => {
      console.error("[HomeContainer] markEpisodeWatched failed:", err);
      Toast.show({ type: "error", text1: "Failed to mark episode as watched. Please try again." });
    },
  });

  const handleOpenDetails = useCallback(
    (item: PosterQueueItem): void => {
      navigation.navigate("Details", {
        id: item.key,
        title: item.title,
        mediaType: item.mediaType || "movie",
        imageSrc: item.imageSrc,
        description: item.description,
        cast: item.cast,
        releaseDate: item.releaseDate,
        whereToWatch: item.whereToWatch,
        seasons: item.seasons,
        source: item.source || "catalog",
      });
    },
    [navigation],
  );

  const handleMarkWatchedAsync = useCallback(
    async (item: EnrichedFavoriteItem): Promise<boolean> => {
      if (item.mediaType === "series" && item.currentEpisode) {
        const { seasonNumber, episodeNumber } = item.currentEpisode;
        await markEpisodeWatchedMutation.mutateAsync({
          mediaId: item.key,
          seasonNumber,
          episodeNumber,
        });
      } else if (item.mediaType === "movie") {
        await markMovieWatchedMutation.mutateAsync(item.key);
      }
      return true;
    },
    [markEpisodeWatchedMutation, markMovieWatchedMutation],
  );

  const handleNavigateNext = useCallback((): void => {
    if (enrichedFavoriteItems.length === 0) return;
    setActiveFavoriteIndex((prev) => (prev + 1) % enrichedFavoriteItems.length);
  }, [enrichedFavoriteItems.length]);

  const handleNavigatePrev = useCallback((): void => {
    if (enrichedFavoriteItems.length === 0) return;
    setActiveFavoriteIndex((prev) => (prev - 1 + enrichedFavoriteItems.length) % enrichedFavoriteItems.length);
  }, [enrichedFavoriteItems.length]);

  const handleMarkWatchedAndAdvance = useCallback(
    async (item: PosterQueueItem): Promise<void> => {
      const enriched = item as EnrichedFavoriteItem;
      const watchedLabel = enriched.currentEpisode?.label ?? enriched.title;
      try {
        await handleMarkWatchedAsync(enriched);
        if (enriched.mediaType === "series") {
          Toast.show({
            type: "success",
            text1: `Marked: ${watchedLabel}`,
            text2: enriched.nextEpisodeLabel ? `Next: ${enriched.nextEpisodeLabel}` : "All episodes watched",
            visibilityTime: 2500,
            position: "bottom",
          });
        }
      } catch {
        // mutation error already handled in onError — do not advance
      }
    },
    [handleMarkWatchedAsync],
  );

  const isLoading = isLoadingFavorites;
  const error = errorFavorites;

  return (
    <PosterQueueView
      isLoading={isLoading}
      errorMessage={error?.message}
      items={enrichedFavoriteItems}
      currentIndex={clampedActiveIndex}
      onOpenDetails={handleOpenDetails}
      onMarkWatched={handleMarkWatchedAndAdvance}
      onNavigateNext={handleNavigateNext}
      onNavigatePrev={handleNavigatePrev}
      activeSectionLabel={undefined}
    />
  );
}
