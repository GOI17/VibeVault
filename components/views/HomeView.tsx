import type { ReactElement } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MasonryList, { type MasonryItemData } from "@/components/Masonry";
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
          <Text style={{ color: palette.text, fontSize: 18 }}>Loading movies...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.shellBackground }} edges={["left", "right"]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ color: palette.text, fontSize: 18 }}>Error loading movies</Text>
          <Text style={{ color: palette.homeMutedText, fontSize: 14, marginTop: 10 }}>{errorMessage}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.shellBackground }} edges={["left", "right"]}>
      <View style={{ flex: 1 }}>
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
      </View>
    </SafeAreaView>
  );
}
