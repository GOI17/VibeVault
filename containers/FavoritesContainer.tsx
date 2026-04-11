import { useState, type ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigation, type NavigationProp } from "@react-navigation/native";

import type { RootStackParamList } from "@/app/navigation/types";
import { FavoritesView } from "@/components/views/FavoritesView";
import { queryOptions } from "@/constants/query";
import { useFavoriteMutations } from "@/hooks/useFavoriteMutations";
import { useRepositories } from "@/providers/RepositoryProvider";

type FilterOption = "movie" | "series" | undefined;

export function FavoritesContainer(): ReactElement {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { favoriteRepository } = useRepositories();
  const [filter, setFilter] = useState<FilterOption>(undefined);
  const { data, isLoading, error } = useQuery({
    ...queryOptions.movies.favoritesByMediaType(filter),
    queryFn: () => favoriteRepository.getByMediaType(filter),
  });
  const { addFavorite, removeFavorite } = useFavoriteMutations();

  const favoriteIds = new Set(data?.map((item) => item.id) ?? []);

  const masonryData =
    data?.map((item) => ({
        key: item.id,
        imageSrc: item.url,
        title: item.title,
        mediaType: item.mediaType,
        description: item.description,
        cast: item.cast,
        releaseDate: item.releaseDate,
        whereToWatch: item.whereToWatch || (item.platform ? [item.platform] : undefined),
        seasons: item.seasons,
        source: item.source,
      })) || [];

  return (
    <FavoritesView
      filter={filter}
      onFilterChange={setFilter}
      isLoading={isLoading}
      errorMessage={error?.message}
      masonryData={masonryData}
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
          source: item.source,
        })
      }
    />
  );
}
