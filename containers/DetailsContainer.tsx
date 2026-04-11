import { useQuery } from "@tanstack/react-query";
import type { ReactElement } from "react";
import { z } from "zod";

import { DetailsView } from "@/components/views/DetailsView";
import type { RootStackParamList } from "@/app/navigation/types";
import { useRepositories } from "@/providers/RepositoryProvider";
import { SeasonSchema } from "@/domain/entities/Movie";

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
    ? (parsedSeasons.data as RootStackParamList["Details"]["seasons"])
    : undefined;
}

export function DetailsContainer({ params }: DetailsContainerProps): ReactElement {
  const { movieRepository, favoriteRepository } = useRepositories();
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

  const missingDetails = !isManualFavorite && !isLoading && !error && data === null;

  const resolvedType = data?.type?.toLowerCase();
  const mediaType = resolvedType
    ? resolvedType.includes("tv") || resolvedType.includes("series")
      ? "series"
      : "movie"
    : params.mediaType || "movie";

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
  const seasons = normalizeSeasons(
    data?.seasons ?? manualDetails?.seasons ?? (params as { seasons?: unknown }).seasons
  );
  const imageSrc = data?.primaryImage?.url || manualDetails?.url || params.imageSrc;

  const hasRenderableDetails = Boolean(title && title.trim().length > 0);

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

  return (
    <DetailsView
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
    />
  );
}
