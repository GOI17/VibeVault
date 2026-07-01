import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import type { ReactElement } from "react";
import { View, Pressable, Text, StyleSheet, useWindowDimensions } from "react-native";

import type { FavoriteSource } from "@/domain/entities/Favorite";
import type { Season } from "@/domain/entities/Movie";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";
import { EmptyState } from "@/components/common/EmptyState";
import { MasonryItem } from "./MasonryItem";

export interface MasonryItemData {
  key: string;
  title: string;
  imageSrc?: string;
  mediaType?: "movie" | "series";
  description?: string;
  cast?: string[];
  releaseDate?: string;
  whereToWatch?: string[];
  seasons?: Season[];
  source?: FavoriteSource;
  watchStatus?: "favorite" | "watched" | "watching" | "not-started";
  progressLabel?: string;
  progressPercent?: number;
}

interface MasonryListProps {
  data: MasonryItemData[];
  isFavorites?: boolean;
  isFavoritesLoading?: boolean;
  showLayoutToggle?: boolean;
  forceListOnMobile?: boolean;
  mobileBreakpoint?: number;
  topInset?: number;
  offsetTop?: number;
  favoriteIds?: ReadonlySet<string>;
  recentlyAddedIds?: ReadonlySet<string>;
  onAddFavorite?: (item: MasonryItemData) => void;
  onRemoveFavorite?: (item: MasonryItemData) => void;
  onOpenDetails?: (item: MasonryItemData) => void;
}

export default function MasonryList({
  data,
  isFavorites = false,
  isFavoritesLoading = false,
  showLayoutToggle = true,
  forceListOnMobile = false,
  mobileBreakpoint = 768,
  topInset = 0,
  offsetTop = 0,
  favoriteIds,
  recentlyAddedIds,
  onAddFavorite,
  onRemoveFavorite,
  onOpenDetails,
}: MasonryListProps): ReactElement {
  const [view, setView] = useState<"grid" | "list">("grid");
  const { width } = useWindowDimensions();
  const { palette } = useThemePreference();
  const fallbackImage = require("../assets/images/logo.png");
  const isListForcedOnMobile = forceListOnMobile && width < mobileBreakpoint;
  const effectiveView = isListForcedOnMobile ? "list" : view;

  const numColumns =
    effectiveView === "list"
      ? 1
      : width >= 1100
        ? 4
        : width >= 760
          ? 3
          : 2;

  if (!data.length && !isFavoritesLoading && isFavorites) {
    return <EmptyState
              icon={<IconSymbol name="heart" size={48} color={palette.shellMutedText} />}
              title="No favorites yet"
              message="Double-tap items to add them here."
            />;
  }

  const favoriteMembershipKey = JSON.stringify({
    favoriteIds: favoriteIds ? Array.from(favoriteIds).sort() : [],
    recentlyAddedIds: recentlyAddedIds ? Array.from(recentlyAddedIds).sort() : [],
    view: effectiveView,
  });

  return (
    <View style={{ flex: 1, minHeight: 0, marginTop: offsetTop }}>
      {showLayoutToggle && width < mobileBreakpoint && !isListForcedOnMobile && (
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
      <FlashList<MasonryItemData>
        key={`${effectiveView}-${numColumns}`}
        numColumns={numColumns}
        style={{ flex: 1, minHeight: 0 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 96,
          paddingTop: topInset,
          paddingHorizontal: 16,
        }}
        keyExtractor={(item: MasonryItemData) => item.key}
        data={data}
        extraData={favoriteMembershipKey}
        renderItem={({ item, index }: { item: MasonryItemData; index: number }) => {
          const isFavorite = favoriteIds?.has(item.key) || recentlyAddedIds?.has(item.key) || false;

          return (
            <MasonryItem
              item={item}
              isFavorite={isFavorite}
              view={effectiveView}
              onAddFavorite={() => onAddFavorite?.(item)}
              onRemoveFavorite={() => onRemoveFavorite?.(item)}
              onOpenDetails={() => onOpenDetails?.(item)}
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
