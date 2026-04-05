import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "@/providers/RepositoryProvider";
import type { FavoriteInput } from "@/domain/entities/Favorite";
import { queryOptions } from "@/constants/query";

interface UseFavoriteMutationsResult {
  addFavorite: (movie: FavoriteInput) => void;
  removeFavorite: (movieId: string) => void;
  isAdding: boolean;
  isRemoving: boolean;
}

export function useFavoriteMutations(
  onAddSuccess?: (movieId: string) => void,
  onRemoveSuccess?: (movieId: string) => void,
): UseFavoriteMutationsResult {
  const queryClient = useQueryClient();
  const { favoriteRepository } = useRepositories();

  const { mutate: markAsFavorite, isPending: isAdding } = useMutation({
    mutationFn: (movie: FavoriteInput) => favoriteRepository.add(movie),
    onSuccess: (_data, variables) => {
      onAddSuccess?.(variables.id);
      queryClient.invalidateQueries({
        queryKey: queryOptions.movies.favorites.queryKey,
      });
    },
  });

  const { mutate: removeFromFavorites, isPending: isRemoving } = useMutation({
    mutationFn: (movieId: string) => favoriteRepository.remove(movieId),
    onSuccess: (_data, variables) => {
      onRemoveSuccess?.(variables);
      queryClient.invalidateQueries({
        queryKey: queryOptions.movies.favorites.queryKey,
      });
    },
  });

  return {
    addFavorite: markAsFavorite,
    removeFavorite: removeFromFavorites,
    isAdding,
    isRemoving,
  };
}
