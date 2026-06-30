import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { queryOptions } from "@/constants/query";
import { useRepositories } from "@/providers/RepositoryProvider";
import { useAnalytics } from "@/providers/AnalyticsProvider";

export function useWatchedProgress() {
  const { watchedProgressRepository } = useRepositories();
  const queryClient = useQueryClient();
  const { track } = useAnalytics();

  const setMovieWatched = useMutation({
    mutationFn: ({ mediaId, watched }: { mediaId: string; watched: boolean }) =>
      watchedProgressRepository.setMovieWatched(mediaId, watched),
    onSuccess: async (_data, variables) => {
      if (variables.watched) {
        await track("first_movie_watched", { mediaId: variables.mediaId });
      }
      void queryClient.invalidateQueries(queryOptions.watchedProgress.movie(variables.mediaId));
      void queryClient.invalidateQueries({ queryKey: ["watched-progress", "summary"] });
    },
  });

  const setEpisodeWatched = useMutation({
    mutationFn: ({
      mediaId,
      seasonNumber,
      episodeNumber,
      watched,
    }: {
      mediaId: string;
      seasonNumber: number;
      episodeNumber: number;
      watched: boolean;
    }) => watchedProgressRepository.setEpisodeWatched({ mediaId, seasonNumber, episodeNumber, watched }),
    onSuccess: async (_data, variables) => {
      if (variables.watched) {
        await track("first_watched_episode", {
          mediaId: variables.mediaId,
          seasonNumber: variables.seasonNumber,
          episodeNumber: variables.episodeNumber,
        });
      }
      void queryClient.invalidateQueries(
        queryOptions.watchedProgress.episodes(variables.mediaId)
      );
      void queryClient.invalidateQueries({ queryKey: ["watched-progress", "summary"] });
    },
  });

  const toggleMovieWatched = useCallback(
    (mediaId: string, currentlyWatched: boolean) => {
      void setMovieWatched.mutateAsync({ mediaId, watched: !currentlyWatched });
    },
    [setMovieWatched]
  );

  const toggleEpisodeWatched = useCallback(
    (mediaId: string, seasonNumber: number, episodeNumber: number, currentlyWatched: boolean) => {
      void setEpisodeWatched.mutateAsync({
        mediaId,
        seasonNumber,
        episodeNumber,
        watched: !currentlyWatched,
      });
    },
    [setEpisodeWatched]
  );

  return {
    toggleMovieWatched,
    toggleEpisodeWatched,
    isTogglingMovie: setMovieWatched.isPending,
    isTogglingEpisode: setEpisodeWatched.isPending,
  };
}
