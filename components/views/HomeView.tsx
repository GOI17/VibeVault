import type { ReactElement } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MasonryList, { type MasonryItemData } from "@/components/Masonry";
import { EmptyState } from "@/components/common/EmptyState";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";

interface HomeViewProps {
  isLoading: boolean;
  errorMessage?: string;
  movies: MasonryItemData[];
  favoriteIds: ReadonlySet<string>;
  onAddFavorite: (item: MasonryItemData) => void;
  onRemoveFavorite: (item: MasonryItemData) => void;
  onOpenDetails: (item: MasonryItemData) => void;
}

export function HomeView({
  isLoading,
  errorMessage,
  movies,
  favoriteIds,
  onAddFavorite,
  onRemoveFavorite,
  onOpenDetails,
}: HomeViewProps): ReactElement {
  const { palette } = useThemePreference();

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.shellBackground }} edges={["left", "right"]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <EmptyState title="Loading movies..." />
        </View>
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.shellBackground }} edges={["left", "right"]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <EmptyState
            title="Error loading movies"
            message={errorMessage}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.shellBackground }} edges={["left", "right"]}>
      <View style={{ flex: 1 }}>
        {movies.length === 0 ? (
          <EmptyState
            icon={<IconSymbol name="movieclapper" size={48} color={palette.shellMutedText} />}
            title="No movies to show"
            message="Pull to refresh or search for something to watch."
          />
        ) : (
          <MasonryList
            data={movies}
            isFavorites={false}
            showLayoutToggle={false}
            topInset={16}
            favoriteIds={favoriteIds}
            onAddFavorite={onAddFavorite}
            onRemoveFavorite={onRemoveFavorite}
            onOpenDetails={onOpenDetails}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
