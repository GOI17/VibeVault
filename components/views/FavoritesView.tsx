import type { ReactElement } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import MasonryList from "@/components/Masonry";
import type { MasonryItemData } from "@/components/Masonry";
import { LoadingState, ErrorState } from "@/components/FeedbackStates";
import type { MediaType } from "@/constants/query";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";

type FilterOption = MediaType | undefined;

const FILTER_OPTIONS: { label: string; value: FilterOption }[] = [
  { label: "All", value: undefined },
  { label: "Movies", value: "movie" },
  { label: "Series", value: "series" },
];

interface FavoritesViewProps {
  filter: FilterOption;
  onFilterChange: (value: FilterOption) => void;
  onGoHome: () => void;
  isLoading: boolean;
  errorMessage?: string;
  masonryData: MasonryItemData[];
  favoriteIds: ReadonlySet<string>;
  onAddFavorite: (item: MasonryItemData) => void;
  onRemoveFavorite: (item: MasonryItemData) => void;
  onOpenDetails: (item: MasonryItemData) => void;
}

export function FavoritesView({
  filter,
  onFilterChange,
  onGoHome,
  isLoading,
  errorMessage,
  masonryData,
  favoriteIds,
  onAddFavorite,
  onRemoveFavorite,
  onOpenDetails,
}: FavoritesViewProps): ReactElement {
  const { palette } = useThemePreference();

  if (isLoading) return <LoadingState message="Loading favorites..." />;
  if (errorMessage) return <ErrorState message="Error loading favorites" error={new Error(errorMessage)} />;

  return (
    <View style={{ flex: 1, backgroundColor: palette.shellBackground }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, gap: 10 }}>
        <Text style={{ color: palette.text, fontSize: 30, lineHeight: 34, fontWeight: "800", letterSpacing: -0.6 }}>
          My Favorites
        </Text>
        <TouchableOpacity
          onPress={onGoHome}
          accessibilityRole="button"
          accessibilityLabel="Go back to Home"
          style={{
            alignSelf: "flex-start",
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 16,
            backgroundColor: palette.shellSurface,
            borderWidth: 1,
            borderColor: palette.shellBorder,
          }}
        >
          <Text style={{ color: palette.text, fontWeight: "600" }}>Go to Home</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {FILTER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.label}
              onPress={() => onFilterChange(option.value)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: filter === option.value ? palette.shellChipActive : palette.shellSurface,
                borderWidth: 1,
                borderColor: filter === option.value ? palette.shellChipActive : palette.shellBorder,
              }}
            >
              <Text
                style={{
                  color: filter === option.value ? palette.shellChipTextActive : palette.shellChipTextIdle,
                  fontWeight: filter === option.value ? "bold" : "normal",
                }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <MasonryList
          data={masonryData}
          isFavorites
          isFavoritesLoading={isLoading}
          showLayoutToggle={false}
          topInset={0}
          favoriteIds={favoriteIds}
          onAddFavorite={onAddFavorite}
          onRemoveFavorite={onRemoveFavorite}
          onOpenDetails={onOpenDetails}
        />
      </View>

    </View>
  );
}
