import { type ReactElement } from "react";
import { View, Text } from "react-native";

import MasonryList, { type MasonryItemData } from "@/components/Masonry";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";

interface SearchViewProps {
  query: string;
  isLoading: boolean;
  errorMessage?: string;
  data: MasonryItemData[];
  favoriteIds: ReadonlySet<string>;
  onAddFavorite: (item: MasonryItemData) => void;
  onRemoveFavorite: (item: MasonryItemData) => void;
  onOpenDetails: (item: MasonryItemData) => void;
}

export function SearchView({
  query,
  isLoading,
  errorMessage,
  data,
  favoriteIds,
  onAddFavorite,
  onRemoveFavorite,
  onOpenDetails,
}: SearchViewProps): ReactElement {
  const { palette } = useThemePreference();

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
        onAddFavorite={onAddFavorite}
        onRemoveFavorite={onRemoveFavorite}
        onOpenDetails={onOpenDetails}
      />
    </View>
  );
}
