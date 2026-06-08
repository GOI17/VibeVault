import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, type ReactElement } from "react";
import { z } from "zod";

import type { RootStackParamList } from "@/app/navigation/types";
import { EpisodeListView, type EpisodeListSeasonViewModel } from "@/components/views/EpisodeListView";
import { queryOptions } from "@/constants/query";
import { SeasonSchema } from "@/domain/entities/Movie";
import { createEpisodeWatchedKey, type WatchedEpisodeInput } from "@/domain/entities/WatchedProgress";
import { useRepositories } from "@/providers/RepositoryProvider";
import { useFavoriteMutations } from "@/hooks/useFavoriteMutations";

interface EpisodeListContainerProps {
  params: RootStackParamList["EpisodeList"];
}

interface EpisodeToggleInput {
  seasonNumber: number;
  episodeNumber: number;
  watched: boolean;
}

function normalizeSeasons(value: unknown): RootStackParamList["EpisodeList"]["seasons"] {
  const parsedValue =
    typeof value === "string"
      ? (() => {
          try {
            return JSON.parse(value) as unknown;
          } catch {
            return undefined;
          }
        })()
      : value;

  const parsedSeasons = z.array(SeasonSchema).safeParse(parsedValue);
  return parsedSeasons.success ? parsedSeasons.data : undefined;
}

function getSeasonLabel(season: NonNullable<RootStackParamList["EpisodeList"]["seasons"]>[number]): string {
  return season.title || `Season ${season.seasonNumber}`;
}

export function EpisodeListContainer({ params }: EpisodeListContainerProps): ReactElement {
  const { movieRepository, watchedProgressRepository, favoriteRepository } = useRepositories();
  const queryClient = useQueryClient();
  const { addFavorite } = useFavoriteMutations();
  const needsDetailsFallback = !params.title || !params.seasons || params.seasons.length === 0;
  const { data: details } = useQuery({
    queryKey: ["movies", "details", params.id],
    queryFn: () => movieRepository.getById(params.id),
    enabled: Boolean(params.id) && needsDetailsFallback,
  });
  const seasonsSource = params.seasons && params.seasons.length > 0 ? params.seasons : details?.seasons;
  const seasons = useMemo(() => normalizeSeasons(seasonsSource) ?? [], [seasonsSource]);
  const title = details?.primaryTitle || params.title || "Episodes";

  const { data: watchedEpisodeStatuses = [] } = useQuery({
    ...queryOptions.watchedProgress.episodes(params.id),
    queryFn: () => watchedProgressRepository.getEpisodeStatuses(params.id),
    enabled: Boolean(params.id),
  });

  const toggleEpisodeWatchedMutation = useMutation({
    mutationFn: async (input: EpisodeToggleInput) => {
      const watchedInput: WatchedEpisodeInput = {
        mediaId: params.id,
        ...input,
      };

      return watchedProgressRepository.setEpisodeWatched(watchedInput);
    },
    onSuccess: (_data, input) => {
      void queryClient.invalidateQueries(queryOptions.watchedProgress.episodes(params.id));
      void queryClient.invalidateQueries({ queryKey: ["watched-progress", "summary"] });
      if (input.watched) {
        void favoriteRepository.exists(params.id).then((exists) => {
          if (!exists) {
            addFavorite({
              id: params.id,
              title: title,
              mediaType: "series",
              url: details?.primaryImage?.url,
              description: details?.plot || "Not available",
              cast: details?.cast ?? ["Not available"],
              releaseDate: details?.releaseDate || details?.startYear?.toString() || "Not available",
              whereToWatch: details?.whereToWatch ?? ["Not available"],
              seasons: seasons,
              source: "catalog",
            });
          }
        });
      }
    },
  });

  const watchedEpisodeKeys = useMemo(
    () =>
      new Set(
        watchedEpisodeStatuses
          .filter((episode) => episode.watched)
          .map((episode) => createEpisodeWatchedKey(episode.seasonNumber, episode.episodeNumber))
      ),
    [watchedEpisodeStatuses]
  );

  const seasonViewModels = useMemo<EpisodeListSeasonViewModel[]>(
    () =>
      seasons.map((season) => {
        const firstUnwatchedEpisode = season.episodes.find(
          (episode) => !watchedEpisodeKeys.has(createEpisodeWatchedKey(season.seasonNumber, episode.episodeNumber))
        );
        const firstUnwatchedKey = firstUnwatchedEpisode
          ? createEpisodeWatchedKey(season.seasonNumber, firstUnwatchedEpisode.episodeNumber)
          : null;
        const watchedCount = season.episodes.filter((episode) =>
          watchedEpisodeKeys.has(createEpisodeWatchedKey(season.seasonNumber, episode.episodeNumber))
        ).length;

        return {
          seasonNumber: season.seasonNumber,
          label: getSeasonLabel(season),
          watchedCount,
          progressPercent: season.episodes.length > 0 ? Math.round((watchedCount / season.episodes.length) * 100) : 0,
          episodes: season.episodes.map((episode) => {
            const episodeKey = createEpisodeWatchedKey(season.seasonNumber, episode.episodeNumber);
            const isWatched = watchedEpisodeKeys.has(episodeKey);

            return {
              key: episodeKey,
              episodeNumber: episode.episodeNumber,
              title: episode.title,
              releaseDate: episode.releaseDate,
              isWatched,
              isCurrent: !isWatched && episodeKey === firstUnwatchedKey,
            };
          }),
        };
      }),
    [seasons, watchedEpisodeKeys]
  );

  const initialSeasonNumber = useMemo<number>(() => {
    if (seasons.length === 0) {
      return 0;
    }
    const currentOrNextSeason = seasons.find((season) => {
      const firstUnwatchedEpisode = season.episodes.find(
        (episode) => !watchedEpisodeKeys.has(createEpisodeWatchedKey(season.seasonNumber, episode.episodeNumber))
      );
      return firstUnwatchedEpisode !== undefined;
    });
    return currentOrNextSeason?.seasonNumber ?? seasons[seasons.length - 1].seasonNumber;
  }, [seasons, watchedEpisodeKeys]);

  return (
    <EpisodeListView
      title={title}
      seasons={seasonViewModels}
      initialSeasonNumber={initialSeasonNumber}
      isUpdatingEpisodeWatched={toggleEpisodeWatchedMutation.isPending}
      onToggleEpisodeWatched={(seasonNumber, episodeNumber, watched) =>
        toggleEpisodeWatchedMutation.mutate({ seasonNumber, episodeNumber, watched })
      }
    />
  );
}
