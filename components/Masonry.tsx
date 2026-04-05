import { MasonryFlashList } from "@shopify/flash-list";
import { useState } from "react";
import type { ReactElement } from "react";
import { View, Pressable, Text, StyleSheet, useWindowDimensions } from "react-native";

import { Colors } from "@/constants/Colors";
import { EmptyState } from "./EmptyState";
import { MasonryItem } from "./MasonryItem";

export interface MasonryItemData {
  key: string;
  title: string;
  imageSrc?: string;
  mediaType?: "movie" | "series";
}

interface MasonryListProps {
  data: MasonryItemData[];
  isFavorites?: boolean;
  isFavoritesLoading?: boolean;
  showLayoutToggle?: boolean;
  topInset?: number;
  offsetTop?: number;
  favoriteIds?: ReadonlySet<string>;
  recentlyAddedIds?: ReadonlySet<string>;
  onAddFavorite?: (item: MasonryItemData) => void;
  onRemoveFavorite?: (item: MasonryItemData) => void;
}

export default function MasonryList({
  data,
  isFavorites = false,
  isFavoritesLoading = false,
  showLayoutToggle = true,
  topInset = 0,
  offsetTop = 0,
  favoriteIds,
  recentlyAddedIds,
  onAddFavorite,
  onRemoveFavorite,
}: MasonryListProps): ReactElement {
  const [view, setView] = useState<"grid" | "list">("grid");
  const { width } = useWindowDimensions();
  const palette = Colors.light;
  const fallbackImage = require("../assets/images/logo.png");

  const numColumns =
    view === "list"
      ? 1
      : width >= 1100
        ? 4
        : width >= 760
          ? 3
          : 2;

  if (!data.length && !isFavoritesLoading && isFavorites) {
    return <EmptyState />;
  }

  return (
    <View style={{ flex: 1, marginTop: offsetTop }}>
      {showLayoutToggle && width < 768 && (
        <Pressable
          onPress={() => setView((prev) => (prev === "grid" ? "list" : "grid"))}
          style={[
            styles.layoutToggle,
            {
              backgroundColor: palette.shellSurface,
              borderColor: palette.shellBorder,
            },
          ]}
        >
          <Text style={{ color: palette.shellMutedText, fontWeight: "600" }}>
            Switch to {view === "grid" ? "list" : "grid"}
          </Text>
        </Pressable>
      )}
      <MasonryFlashList
        numColumns={numColumns}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 96,
          paddingTop: topInset,
          paddingHorizontal: 12,
        }}
        estimatedItemSize={view === "grid" ? 320 : 132}
        keyExtractor={(item) => item.key}
        data={data}
        renderItem={({ item, index }) => {
          const isFavorite = favoriteIds?.has(item.key) || recentlyAddedIds?.has(item.key) || false;

          return (
            <MasonryItem
              item={item}
              isFavorite={isFavorite}
              view={view}
              onAddFavorite={() => onAddFavorite?.(item)}
              onRemoveFavorite={() => onRemoveFavorite?.(item)}
              fallbackImage={fallbackImage}
              index={index}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  layoutToggle: {
    alignSelf: "flex-start",
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
});
