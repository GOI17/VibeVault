import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "@/providers/RepositoryProvider";
import { queryOptions } from "@/constants/query";
import { validateBackupFavorites } from "@/domain/entities/Favorite";
import type { Favorite } from "@/domain/entities/Favorite";

interface UseBackupMutationsResult {
  backupFavorites: (data: Favorite[]) => void;
  restoreFavorites: () => void;
  isBackingUp: boolean;
  isRestoring: boolean;
  backupError: Error | null;
  restoreError: Error | null;
}

export function useBackupMutations(): UseBackupMutationsResult {
  const queryClient = useQueryClient();
  const { backupRepository, favoriteRepository } = useRepositories();

  const {
    mutate: backupFavorites,
    isPending: isBackingUp,
    error: backupError,
  } = useMutation({
    mutationFn: async (data: Favorite[]) => {
      await backupRepository.upload(data);
    },
  });

  const {
    mutate: restoreFavorites,
    isPending: isRestoring,
    error: restoreError,
  } = useMutation({
    mutationFn: async () => {
      const downloadedData: unknown = await backupRepository.download();
      const restoredData = validateBackupFavorites(downloadedData);

      for (const movie of restoredData) {
        await favoriteRepository.add(movie);
      }
      return restoredData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryOptions.movies.favorites.queryKey,
      });
    },
  });

  return {
    backupFavorites,
    restoreFavorites,
    isBackingUp,
    isRestoring,
    backupError,
    restoreError,
  };
}
