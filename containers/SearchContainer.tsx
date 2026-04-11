import { useQuery } from "@tanstack/react-query";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { useEffect, useMemo, useState, type ReactElement } from "react";

import type { RootStackParamList } from "@/app/navigation/types";
import { SearchView } from "@/components/views/SearchView";
import { queryOptions } from "@/constants/query";
import { useFavoriteMutations } from "@/hooks/useFavoriteMutations";
import { useRepositories } from "@/providers/RepositoryProvider";

interface SearchContainerProps {
  query: string;
}

export function SearchContainer({ query }: SearchContainerProps): ReactElement {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { movieRepository, favoriteRepository } = useRepositories();
  const { addFavorite, removeFavorite } = useFavoriteMutations();
  const [activeQuery, setActiveQuery] = useState(query);

  useEffect(() => {
    setActiveQuery(query);
  }, [query]);

  const { data, isLoading, error } = useQuery({
    ...queryOptions.movies.all(activeQuery),
    queryFn: () => movieRepository.search(activeQuery),
  });

  const { data: favorites } = useQuery({
    ...queryOptions.movies.favorites,
    queryFn: () => favoriteRepository.getAll(),
  });

  const favoriteIds = useMemo(() => new Set(favorites?.map((item) => item.id) ?? []), [favorites]);
  const mappedData =
    data?.titles?.map((item) => ({
        key: item.id,
        imageSrc: item.primaryImage?.url,
        title: item.primaryTitle,
        mediaType: (item.type?.toLowerCase().includes("tv") ? "series" : "movie") as "movie" | "series",
        description: item.plot,
        cast: item.cast,
        releaseDate: item.releaseDate || item.startYear?.toString(),
        whereToWatch: item.whereToWatch,
        seasons: item.seasons,
      })) || [];

  return (
    <SearchView
      query={activeQuery}
      isLoading={isLoading}
      errorMessage={error?.message}
      data={mappedData}
      favoriteIds={favoriteIds}
      onSearchQuery={setActiveQuery}
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
