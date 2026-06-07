import { useState, type ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { Modal, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";

import type { RootStackParamList } from "@/app/navigation/types";
import { AddFavoriteForm } from "@/components/forms/AddFavoriteForm";
import { FavoritesView, type FavoriteSortDirection } from "@/components/views/FavoritesView";
import { queryOptions } from "@/constants/query";
import type { Favorite } from "@/domain/entities/Favorite";
import { useFavoriteMutations } from "@/hooks/useFavoriteMutations";
import { useRepositories } from "@/providers/RepositoryProvider";
import { useManualFavoriteSubmission } from "@/hooks/useManualFavoriteSubmission";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";

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
  const { palette } = useThemePreference();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 720;
  const [showFormModal, setShowFormModal] = useState(false);
  const { favoriteRepository } = useRepositories();
  const [filter, setFilter] = useState<FilterOption>(undefined);
  const [sortDirection, setSortDirection] = useState<FavoriteSortDirection>("newest");
  const { data, isLoading, error } = useQuery({
    ...queryOptions.movies.favoritesByMediaType(filter),
    queryFn: () => favoriteRepository.getByMediaType(filter),
  });
  const { addFavorite, removeFavorite } = useFavoriteMutations();
  const handleAddFavorite = useManualFavoriteSubmission(() => setShowFormModal(false));

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
    <View style={{ flex: 1 }}>
      <FavoritesView
        filter={filter}
        onFilterChange={setFilter}
        sortDirection={sortDirection}
        onSortDirectionChange={setSortDirection}
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
            description: item.description || "Not available",
            cast: item.cast && item.cast.length > 0 ? item.cast : ["Not available"],
            releaseDate: item.releaseDate || "Not available",
            whereToWatch:
              item.whereToWatch && item.whereToWatch.length > 0
                ? item.whereToWatch
                : ["Not available"],
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
      <TouchableOpacity
        onPress={() => setShowFormModal(true)}
        style={{
          position: "absolute",
          bottom: 88,
          right: 20,
          backgroundColor: palette.shellFabBackground,
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: "center",
          alignItems: "center",
          elevation: 5,
        }}
        accessibilityRole="button"
        accessibilityLabel="Add favorite"
      >
        <Text style={{ color: palette.shellFabForeground, fontSize: 24 }}>+</Text>
      </TouchableOpacity>
      <Modal visible={showFormModal} transparent animationType="fade" onRequestClose={() => setShowFormModal(false)}>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: palette.shellOverlay,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              width: isDesktop ? 560 : "100%",
              maxWidth: 560,
              backgroundColor: palette.shellSurface,
              padding: 20,
              borderRadius: 24,
              borderColor: palette.shellBorder,
              borderWidth: 1,
              shadowColor: "#000000",
              shadowOpacity: 0.1,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 12 },
              elevation: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowFormModal(false)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: palette.shellSurfaceAlt,
                padding: 5,
                borderRadius: 5,
                zIndex: 1,
              }}
              accessibilityRole="button"
              accessibilityLabel="Close add favorite modal"
            >
              <Text style={{ color: palette.text, fontSize: 16 }}>×</Text>
            </TouchableOpacity>
            <Text style={{ color: palette.text, fontSize: 18, marginBottom: 10 }}>Add Custom Movie</Text>
            <AddFavoriteForm onSubmit={handleAddFavorite} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
