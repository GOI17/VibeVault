import { useQuery } from "@tanstack/react-query";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { useMemo, type ReactElement } from "react";

import type { RootStackParamList } from "@/app/navigation/types";
import { HomeView } from "@/components/views/HomeView";
import { queryOptions } from "@/constants/query";
import { inferMovieMediaType } from "@/domain/entities/Movie";
import { useFavoriteMutations } from "@/hooks/useFavoriteMutations";
import { useRepositories } from "@/providers/RepositoryProvider";
import { getWatchStatusByMediaId } from "./watchStatusViewModel";

export function HomeContainer(): ReactElement {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { movieRepository, favoriteRepository, watchedProgressRepository } = useRepositories();
  const { data, isLoading, error } = useQuery({
    ...queryOptions.movies.random,
    queryFn: () => movieRepository.getRandom(),
  });

  const { data: favorites } = useQuery({
    ...queryOptions.movies.favorites,
    queryFn: () => favoriteRepository.getAll(),
  });

  const { addFavorite, removeFavorite } = useFavoriteMutations();

  const movies = useMemo(
    () =>
      data?.titles?.map((item) => ({
        key: item.id,
        imageSrc: item.primaryImage?.url,
        title: item.primaryTitle,
        mediaType: inferMovieMediaType(item.type),
        description: item.plot,
        cast: item.cast,
        releaseDate: item.releaseDate || item.startYear?.toString(),
        whereToWatch: item.whereToWatch,
        seasons: item.seasons,
      })) || [],
    [data?.titles],
  );

  const favoriteIds = useMemo(() => new Set(favorites?.map((item) => item.id) ?? []), [favorites]);
  const { data: watchStatusByMediaId = {} } = useQuery({
    queryKey: ["watched-progress", "summary", movies.map((item) => item.key).sort()],
    queryFn: () => getWatchStatusByMediaId(movies, watchedProgressRepository),
    enabled: movies.length > 0,
  });
  const moviesWithWatchStatus = movies.map((item) => ({
    ...item,
    ...watchStatusByMediaId[item.key],
  }));

  return (
    <HomeView
      isLoading={isLoading}
      errorMessage={error?.message}
      movies={moviesWithWatchStatus}
      favoriteIds={favoriteIds}
      onAddFavorite={(item) =>
        addFavorite({
          id: item.key,
          title: item.title,
          mediaType: item.mediaType || "movie",
          url: item.imageSrc,
          description: item.description || "No disponible",
          cast: item.cast && item.cast.length > 0 ? item.cast : ["No disponible"],
          releaseDate: item.releaseDate || "No disponible",
          whereToWatch:
            item.whereToWatch && item.whereToWatch.length > 0
              ? item.whereToWatch
              : ["No disponible"],
          seasons: item.seasons,
          source: "catalog",
        })
      }
      onRemoveFavorite={(item) => removeFavorite(item.key)}
      onOpenDetails={(item) =>
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
          source: "catalog",
        })
      }
    />
  );
}
