import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { useMemo, type ReactElement } from "react";
import { z } from "zod";

import { DetailsView } from "@/components/views/DetailsView";
import type { RootStackParamList } from "@/app/navigation/types";
import { useRepositories } from "@/providers/RepositoryProvider";
import { inferMovieMediaType, SeasonSchema } from "@/domain/entities/Movie";
import { createEpisodeWatchedKey } from "@/domain/entities/WatchedProgress";
import { queryOptions } from "@/constants/query";
import { useFavoriteMutations } from "@/hooks/useFavoriteMutations";

interface DetailsContainerProps {
  params: RootStackParamList["Details"];
}

function normalizeStringList(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const normalized = value
      .map((entry) => (typeof entry === "string" ? entry : String(entry ?? "")).trim())
      .filter(Boolean);

    return normalized.length > 0 ? normalized : undefined;
  }

  if (typeof value === "string") {
    const normalized = value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);

    return normalized.length > 0 ? normalized : undefined;
  }

  return undefined;
}

function normalizeSeasons(
  value: unknown
): RootStackParamList["Details"]["seasons"] | undefined {
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

  return parsedSeasons.success && parsedSeasons.data.length > 0
    ? parsedSeasons.data
    : undefined;
}

export function DetailsContainer({ params }: DetailsContainerProps): ReactElement {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { movieRepository, favoriteRepository, watchedProgressRepository } = useRepositories();
  const isManualFavorite = params.source === "manual" || params.id.startsWith("custom-");

  const { data, isLoading, error } = useQuery({
    queryKey: ["movies", "details", params.id],
    queryFn: () => movieRepository.getById(params.id),
    enabled: !isManualFavorite,
  });

  const { data: manualDetails, isLoading: isManualLoading } = useQuery({
    queryKey: ["favorites", "details", params.id],
    queryFn: () => favoriteRepository.getById(params.id),
    enabled: isManualFavorite,
  });

  const { data: watchedEpisodeStatuses = [] } = useQuery({
    ...queryOptions.watchedProgress.episodes(params.id),
    queryFn: () => watchedProgressRepository.getEpisodeStatuses(params.id),
    enabled: Boolean(params.id),
  });

  const { data: favorites } = useQuery({
    ...queryOptions.movies.favorites,
    queryFn: () => favoriteRepository.getAll(),
  });

  const { addFavorite, removeFavorite, isAdding, isRemoving } = useFavoriteMutations();

  const isFavorite = useMemo(
    () => Boolean(favorites?.some((item) => item.id === params.id)),
    [favorites, params.id],
  );

  const missingDetails = !isManualFavorite && !isLoading && !error && data === null;

  const mediaType = data?.type ? inferMovieMediaType(data.type) : manualDetails?.mediaType || params.mediaType || "movie";

  const title = data?.primaryTitle || manualDetails?.title || params.title || "Título no disponible";
  const description = data?.plot || manualDetails?.description || params.description;
  const cast = normalizeStringList(data?.cast ?? manualDetails?.cast ?? params.cast);
  const releaseDate =
    data?.releaseDate ||
    data?.startYear?.toString() ||
    manualDetails?.releaseDate ||
    params.releaseDate;
  const whereToWatch = normalizeStringList(
    data?.whereToWatch ?? manualDetails?.whereToWatch ?? params.whereToWatch
  );
  const seasons = normalizeSeasons(data?.seasons ?? manualDetails?.seasons ?? params.seasons);
  const imageSrc = data?.primaryImage?.url || manualDetails?.url || params.imageSrc;

  const { data: watchedMovieStatus } = useQuery({
    ...queryOptions.watchedProgress.movie(params.id),
    queryFn: () => watchedProgressRepository.getMovieStatus(params.id),
    enabled: Boolean(params.id) && mediaType === "movie",
  });

  const queryClient = useQueryClient();

  const toggleWatchedMutation = useMutation({
    mutationFn: (watched: boolean) => watchedProgressRepository.setMovieWatched(params.id, watched),
    onSuccess: () => {
      void queryClient.invalidateQueries(queryOptions.watchedProgress.movie(params.id));
      void queryClient.invalidateQueries({ queryKey: ["watched-progress", "summary"] });
    },
  });

  const watchedEpisodeKeys = useMemo(() => {
    return new Set(
      watchedEpisodeStatuses
        .filter((episode) => episode.watched)
        .map((episode) => createEpisodeWatchedKey(episode.seasonNumber, episode.episodeNumber))
    );
  }, [watchedEpisodeStatuses]);

  const lastWatchedEpisodeLabel = useMemo(() => {
    const watchedEpisodesByKey = new Map(
      watchedEpisodeStatuses
        .filter((episode) => episode.watched && episode.watchedAt)
        .map((episode) => [createEpisodeWatchedKey(episode.seasonNumber, episode.episodeNumber), episode.watchedAt])
    );

    const watchedEpisodes =
      seasons?.flatMap((season) =>
        season.episodes.flatMap((episode) => {
          const watchedAt = watchedEpisodesByKey.get(
            createEpisodeWatchedKey(season.seasonNumber, episode.episodeNumber)
          );

          return watchedAt ? [{ seasonNumber: season.seasonNumber, episode, watchedAt }] : [];
        })
      ) ?? [];

    const lastWatched = watchedEpisodes.sort((left, right) => left.watchedAt.localeCompare(right.watchedAt)).at(-1);
    return lastWatched
      ? `S${lastWatched.seasonNumber}E${lastWatched.episode.episodeNumber} · ${lastWatched.episode.title}`
      : undefined;
  }, [seasons, watchedEpisodeStatuses]);

  const seriesProgress = useMemo(() => {
    let watched = 0;
    let total = 0;

    seasons?.forEach((season) => {
      season.episodes.forEach((episode) => {
        total += 1;
        if (watchedEpisodeKeys.has(createEpisodeWatchedKey(season.seasonNumber, episode.episodeNumber))) {
          watched += 1;
        }
      });
    });

    return {
      watched,
      total,
    };
  }, [seasons, watchedEpisodeKeys]);

  const hasRequiredBaseFields = Boolean(
    title &&
      title.trim().length > 0 &&
      description &&
      description.trim().length > 0 &&
      releaseDate &&
      releaseDate.trim().length > 0 &&
      cast &&
      cast.length > 0 &&
      whereToWatch &&
      whereToWatch.length > 0
  );

  const hasRequiredSeriesFields = Boolean(
    mediaType !== "series" ||
      (seasons &&
        seasons.length > 0 &&
        seasons.every(
          (season) =>
            season.episodes.length > 0 &&
            season.episodes.every((episode) => Boolean(episode.releaseDate?.trim()))
        ))
  );

  const hasRequiredDetails = hasRequiredBaseFields && hasRequiredSeriesFields;
  const shouldBlockOnError = Boolean(error) && !hasRequiredDetails;

  const blockingErrorMessage = shouldBlockOnError
    ? error instanceof Error
      ? error.message
      : "No pudimos cargar los detalles de este título."
    : !hasRequiredDetails
    ? error instanceof Error
      ? error.message
      : missingDetails
        ? "No pudimos encontrar los detalles de este título."
        : "Los detalles disponibles están incompletos para este título."
    : undefined;

  const showBlockingLoading = (isLoading || isManualLoading) && !hasRequiredDetails;

  const handleToggleFavorite = (): void => {
    if (isFavorite) {
      removeFavorite(params.id);
    } else {
      addFavorite({
        id: params.id,
        title,
        mediaType,
        url: imageSrc,
        description: description || "Not available",
        cast: cast && cast.length > 0 ? cast : ["Not available"],
        releaseDate: releaseDate || "Not available",
        whereToWatch: whereToWatch && whereToWatch.length > 0 ? whereToWatch : ["Not available"],
        seasons: seasons,
        source: "catalog",
      });
    }
  };

  const handleToggleWatched = (): void => {
    if (watchedMovieStatus?.watched) {
      void toggleWatchedMutation.mutateAsync(false);
    } else {
      void toggleWatchedMutation.mutateAsync(true).then(() => {
        if (mediaType === "movie" && !isFavorite) {
          addFavorite({
            id: params.id,
            title,
            mediaType,
            url: imageSrc,
            description: description || "Not available",
            cast: cast && cast.length > 0 ? cast : ["Not available"],
            releaseDate: releaseDate || "Not available",
            whereToWatch: whereToWatch && whereToWatch.length > 0 ? whereToWatch : ["Not available"],
            seasons: seasons,
            source: "catalog",
          });
        }
      });
    }
  };

  return (
    <DetailsView
      id={params.id}
      isLoading={showBlockingLoading}
      errorMessage={blockingErrorMessage}
      title={title}
      description={description}
      cast={cast}
      releaseDate={releaseDate}
      whereToWatch={whereToWatch}
      seasons={seasons}
      imageSrc={imageSrc}
      mediaType={mediaType}
      isFavorite={isFavorite}
      isUpdatingFavorite={isAdding || isRemoving}
      onToggleFavorite={handleToggleFavorite}
      isWatched={watchedMovieStatus?.watched}
      isUpdatingWatched={toggleWatchedMutation.isPending}
      onToggleWatched={handleToggleWatched}
      lastWatchedEpisodeLabel={lastWatchedEpisodeLabel}
      seriesProgress={seriesProgress}
      onOpenEpisodeList={() =>
        navigation.navigate("EpisodeList", {
          id: params.id,
          title,
          ...(seasons ? { seasons } : {}),
        })
      }
    />
  );
}
