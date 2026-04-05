import type { ReactElement } from "react";
import { View, Text } from "react-native";

import MasonryList, { type MasonryItemData } from "@/components/Masonry";
import { Colors } from "@/constants/Colors";

interface SearchViewProps {
  query: string;
  isLoading: boolean;
  errorMessage?: string;
  data: MasonryItemData[];
  favoriteIds: ReadonlySet<string>;
  recentlyAddedIds: ReadonlySet<string>;
  onAddFavorite: (item: MasonryItemData) => void;
  onRemoveFavorite: (item: MasonryItemData) => void;
}

const palette = Colors.light;

export function SearchView({
  query,
  isLoading,
  errorMessage,
  data,
  favoriteIds,
  recentlyAddedIds,
  onAddFavorite,
  onRemoveFavorite,
}: SearchViewProps): ReactElement {
  if (isLoading) {
    return (
      <View style={{ backgroundColor: palette.shellBackground, flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ color: palette.text, fontSize: 18 }}>Searching for &quot;{query}&quot;...</Text>
        </View>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={{ backgroundColor: palette.shellBackground, flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ color: palette.text, fontSize: 18 }}>Error searching for &quot;{query}&quot;</Text>
          <Text style={{ color: palette.shellMutedText, fontSize: 14, marginTop: 10 }}>{errorMessage}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: palette.shellBackground, flex: 1 }}>
      <MasonryList
        data={data}
        isFavorites={false}
        favoriteIds={favoriteIds}
        recentlyAddedIds={recentlyAddedIds}
        onAddFavorite={onAddFavorite}
        onRemoveFavorite={onRemoveFavorite}
      />
    </View>
  );
}
