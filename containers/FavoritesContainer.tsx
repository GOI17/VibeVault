import { useState, type ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigation, type NavigationProp } from "@react-navigation/native";

import type { RootStackParamList } from "@/app/navigation/types";
import { FavoritesView, type FavoriteSortDirection } from "@/components/views/FavoritesView";
import { queryOptions } from "@/constants/query";
import type { Favorite } from "@/domain/entities/Favorite";
import { useFavoriteMutations } from "@/hooks/useFavoriteMutations";
import { useRepositories } from "@/providers/RepositoryProvider";

type FilterOption = "movie" | "series" | undefined;

function getFavoriteAddedAtTime(favorite: Favorite): number {
  if (!favorite.addedAt) {
    return Number.NEGATIVE_INFINITY;
  }

  const addedAtTime = Date.parse(favorite.addedAt);

  return Number.isNaN(addedAtTime) ? Number.NEGATIVE_INFINITY : addedAtTime;
}

function sortFavoritesByAddedAt(favorites: Favorite[], direction: FavoriteSortDirection): Favorite[] {
  return [...favorites].sort((first, second) => {
    const firstAddedAt = getFavoriteAddedAtTime(first);
    const secondAddedAt = getFavoriteAddedAtTime(second);

    return direction === "newest"
      ? secondAddedAt - firstAddedAt
      : firstAddedAt - secondAddedAt;
  });
}

export function FavoritesContainer(): ReactElement {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { favoriteRepository } = useRepositories();
  const [filter, setFilter] = useState<FilterOption>(undefined);
  const [sortDirection, setSortDirection] = useState<FavoriteSortDirection>("newest");
  const { data, isLoading, error } = useQuery({
    ...queryOptions.movies.favoritesByMediaType(filter),
    queryFn: () => favoriteRepository.getByMediaType(filter),
  });
  const { addFavorite, removeFavorite } = useFavoriteMutations();

  const favoriteIds = new Set(data?.map((item) => item.id) ?? []);
  const sortedFavorites = sortFavoritesByAddedAt(data ?? [], sortDirection);

  const masonryData = sortedFavorites.map((item) => ({
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
  }));

  return (
    <FavoritesView
      filter={filter}
      onFilterChange={setFilter}
      sortDirection={sortDirection}
      onSortDirectionChange={setSortDirection}
      onGoHome={() => navigation.navigate("Tabs", { screen: "Home" })}
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
