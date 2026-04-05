import { useState, type ReactElement } from "react";
import { useWindowDimensions } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { FavoritesView } from "@/components/views/FavoritesView";
import type { AddFavoriteFormValues } from "@/components/forms/AddFavoriteForm";
import { queryOptions } from "@/constants/query";
import { useFavoriteMutations } from "@/hooks/useFavoriteMutations";
import { useBackupMutations } from "@/hooks/useBackupMutations";
import { useRepositories } from "@/providers/RepositoryProvider";

type FilterOption = "movie" | "series" | undefined;

export function FavoritesContainer(): ReactElement {
  const { favoriteRepository } = useRepositories();
  const [filter, setFilter] = useState<FilterOption>(undefined);
  const { data, isLoading, error } = useQuery({
    ...queryOptions.movies.favoritesByMediaType(filter),
    queryFn: () => favoriteRepository.getByMediaType(filter),
  });
  const { addFavorite, removeFavorite } = useFavoriteMutations();
  const { backupFavorites, restoreFavorites, isBackingUp, isRestoring } = useBackupMutations();
  const [showFormModal, setShowFormModal] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 720;

  const handleAddFavorite = (values: AddFavoriteFormValues) => {
    addFavorite({
      id: Date.now().toString(),
      title: values.title,
      mediaType: values.mediaType,
      url: values.url,
      platform: values.platform,
    });
  };

  const favoriteIds = new Set(data?.map((item) => item.id) ?? []);

  const masonryData =
    data?.map((item) => ({
      key: item.id,
      imageSrc: item.url,
      title: item.title,
      mediaType: item.mediaType,
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
        })
      }
      onRemoveFavorite={(item) => removeFavorite(item.key)}
      onSubmitFavorite={handleAddFavorite}
      onBackup={() => data && backupFavorites(data)}
      onRestore={restoreFavorites}
      isBackingUp={isBackingUp}
      isRestoring={isRestoring}
      showFormModal={showFormModal}
      setShowFormModal={setShowFormModal}
      isDesktop={isDesktop}
    />
  );
}
