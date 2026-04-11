import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import { useRepositories } from "@/providers/RepositoryProvider";
import type { Favorite, FavoriteInput, MediaType } from "@/domain/entities/Favorite";
import { queryOptions } from "@/constants/query";

interface UseFavoriteMutationsResult {
  addFavorite: (movie: FavoriteInput) => void;
  removeFavorite: (movieId: string) => void;
  isAdding: boolean;
  isRemoving: boolean;
}

type FavoriteQuerySnapshot = [QueryKey, Favorite[] | undefined];

function matchesMediaType(
  favorite: Pick<FavoriteInput, "mediaType">,
  mediaType: MediaType | "all"
): boolean {
  return mediaType === "all" || favorite.mediaType === mediaType;
}

export function useFavoriteMutations(
  onAddSuccess?: (movieId: string) => void,
  onRemoveSuccess?: (movieId: string) => void,
): UseFavoriteMutationsResult {
  const queryClient = useQueryClient();
  const { favoriteRepository } = useRepositories();

  const getFavoriteSnapshots = (): FavoriteQuerySnapshot[] =>
    queryClient.getQueriesData<Favorite[]>({
      queryKey: queryOptions.movies.favorites.queryKey,
    });

  const restoreFavoriteSnapshots = (snapshots: FavoriteQuerySnapshot[]): void => {
    snapshots.forEach(([queryKey, data]) => {
      queryClient.setQueryData(queryKey, data);
    });
  };

  const updateFavoriteQueries = (
    updater: (favorites: Favorite[], mediaType: MediaType | "all") => Favorite[]
  ): void => {
    getFavoriteSnapshots().forEach(([queryKey, data]) => {
      if (!data) {
        return;
      }

      const mediaType =
        queryKey.length >= 3 &&
        (queryKey[2] === "movie" || queryKey[2] === "series" || queryKey[2] === "all")
          ? queryKey[2]
          : "all";

      queryClient.setQueryData<Favorite[]>(queryKey, updater(data, mediaType));
    });
  };

  const { mutate: markAsFavorite, isPending: isAdding } = useMutation({
    mutationFn: (movie: FavoriteInput) => favoriteRepository.add(movie),
    onMutate: async (favorite) => {
      await queryClient.cancelQueries({
        queryKey: queryOptions.movies.favorites.queryKey,
      });

      const snapshots = getFavoriteSnapshots();

      updateFavoriteQueries((favorites, mediaType) => {
        if (!matchesMediaType(favorite, mediaType)) {
          return favorites;
        }

        if (favorites.some((item) => item.id === favorite.id)) {
          return favorites;
        }

        return [
          ...favorites,
          {
            ...favorite,
            source: favorite.source || "catalog",
            addedAt: new Date().toISOString(),
          },
        ];
      });

      return { snapshots };
    },
    onSuccess: (_data, variables) => {
      onAddSuccess?.(variables.id);
      queryClient.invalidateQueries({
        queryKey: queryOptions.movies.favorites.queryKey,
      });
    },
    onError: (_error, _variables, context) => {
      if (context?.snapshots) {
        restoreFavoriteSnapshots(context.snapshots);
      }
    },
  });

  const { mutate: removeFromFavorites, isPending: isRemoving } = useMutation({
    mutationFn: (movieId: string) => favoriteRepository.remove(movieId),
    onMutate: async (movieId) => {
      await queryClient.cancelQueries({
        queryKey: queryOptions.movies.favorites.queryKey,
      });

      const snapshots = getFavoriteSnapshots();

      updateFavoriteQueries((favorites) =>
        favorites.filter((favorite) => favorite.id !== movieId)
      );

      return { snapshots };
    },
    onSuccess: (_data, variables) => {
      onRemoveSuccess?.(variables);
      queryClient.invalidateQueries({
        queryKey: queryOptions.movies.favorites.queryKey,
      });
    },
    onError: (_error, _variables, context) => {
      if (context?.snapshots) {
        restoreFavoriteSnapshots(context.snapshots);
      }
    },
  });

  return {
    addFavorite: markAsFavorite,
    removeFavorite: removeFromFavorites,
    isAdding,
    isRemoving,
  };
}
