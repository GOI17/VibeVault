import { useState, type ReactElement } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

import MasonryList from "@/components/Masonry";
import type { MasonryItemData } from "@/components/Masonry";
import { LoadingState, ErrorState } from "@/components/FeedbackStates";
import { EmptyState } from "@/components/common/EmptyState";
import { IconSymbol } from "@/components/ui/IconSymbol";
import type { MediaType } from "@/constants/query";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";

type FilterOption = MediaType | undefined;
export type FavoriteSortDirection = "newest" | "oldest";
type BottomSheetKind = "type" | "sort" | null;

const FILTER_OPTIONS: { label: string; value: FilterOption }[] = [
  { label: "All", value: undefined },
  { label: "Movies", value: "movie" },
  { label: "Series", value: "series" },
];

const SORT_OPTIONS: { label: string; value: FavoriteSortDirection }[] = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

function getFilterLabel(filter: FilterOption): string {
  return FILTER_OPTIONS.find((option) => option.value === filter)?.label ?? "All";
}

function getSortLabel(sortDirection: FavoriteSortDirection): string {
  return SORT_OPTIONS.find((option) => option.value === sortDirection)?.label ?? "Newest";
}

interface FavoritesViewProps {
  filter: FilterOption;
  onFilterChange: (value: FilterOption) => void;
  sortDirection: FavoriteSortDirection;
  onSortDirectionChange: (value: FavoriteSortDirection) => void;
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
  sortDirection,
  onSortDirectionChange,
  isLoading,
  errorMessage,
  masonryData,
  favoriteIds,
  onAddFavorite,
  onRemoveFavorite,
  onOpenDetails,
}: FavoritesViewProps): ReactElement {
  const { palette } = useThemePreference();
  const [activeSheet, setActiveSheet] = useState<BottomSheetKind>(null);

  const closeSheet = (): void => setActiveSheet(null);
  const selectFilter = (value: FilterOption): void => {
    onFilterChange(value);
    closeSheet();
  };
  const selectSortDirection = (value: FavoriteSortDirection): void => {
    onSortDirectionChange(value);
    closeSheet();
  };

  if (isLoading) return <LoadingState message="Loading favorites..." />;
  if (errorMessage) return <ErrorState message="Error loading favorites" error={new Error(errorMessage)} />;

  return (
    <View style={{ flex: 1, backgroundColor: palette.shellBackground }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <FilterBarButton
            label={getFilterLabel(filter)}
            icon="movieclapper"
            onPress={() => setActiveSheet("type")}
            accessibilityLabel="Open type filter"
          />
          <FilterBarButton
            label={getSortLabel(sortDirection)}
            icon="arrow.up.arrow.down"
            onPress={() => setActiveSheet("sort")}
            accessibilityLabel="Open sort options"
          />
        </View>
      </View>

      <Modal visible={activeSheet !== null} transparent animationType="slide" onRequestClose={closeSheet}>
        <Pressable style={{ flex: 1, justifyContent: "flex-end", backgroundColor: palette.shellOverlay }} onPress={closeSheet}>
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              margin: 16,
              borderRadius: 26,
              borderWidth: 1,
              borderColor: palette.shellBorder,
              backgroundColor: palette.shellSurface,
              padding: 18,
              gap: 16,
            }}
          >
            <View
              style={{
                alignSelf: "center",
                width: 54,
                height: 5,
                borderRadius: 999,
                backgroundColor: palette.shellMutedText,
                opacity: 0.6,
              }}
            />

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ color: palette.text, fontSize: 22, fontWeight: "800" }}>
                {activeSheet === "type" ? "Type" : "Sort by"}
              </Text>
              <TouchableOpacity
                onPress={closeSheet}
                accessibilityRole="button"
                accessibilityLabel="Close filter sheet"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: palette.shellBackground,
                }}
              >
                <IconSymbol name="xmark.circle.fill" color={palette.shellMutedText} size={28} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 8 }}>
              {activeSheet === "type"
                ? FILTER_OPTIONS.map((option) => {
                    const isSelected = filter === option.value;
                    const icon = option.value === "series" ? "tv" : "movieclapper";

                    return (
                      <SheetOption
                        key={option.label}
                        label={option.label}
                        icon={icon}
                        isSelected={isSelected}
                        onPress={() => selectFilter(option.value)}
                      />
                    );
                  })
                : SORT_OPTIONS.map((option) => (
                    <SheetOption
                      key={option.value}
                      label={option.label}
                      icon="arrow.up.arrow.down"
                      isSelected={sortDirection === option.value}
                      accessibilityLabel={`Sort favorites by date added: ${option.label.toLowerCase()} first`}
                      onPress={() => selectSortDirection(option.value)}
                    />
                  ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <View style={{ flex: 1 }}>
        {masonryData.length === 0 ? (
          <EmptyState
            icon={<IconSymbol name="heart" size={48} color={palette.shellMutedText} />}
            title="No favorites yet"
            message="Double-tap movies on the home screen or add custom entries."
          />
        ) : (
          <MasonryList
            data={masonryData}
            isFavorites
          isFavoritesLoading={isLoading}
          showLayoutToggle={false}
          forceListOnMobile
          topInset={8}
          favoriteIds={favoriteIds}
          onAddFavorite={onAddFavorite}
          onRemoveFavorite={onRemoveFavorite}
          onOpenDetails={onOpenDetails}
        />
        )}
      </View>
    </View>
  );
}

interface FilterBarButtonProps {
  label: string;
  icon: "movieclapper" | "arrow.up.arrow.down";
  onPress: () => void;
  accessibilityLabel: string;
}

function FilterBarButton({ label, icon, onPress, accessibilityLabel }: FilterBarButtonProps): ReactElement {
  const { palette } = useThemePreference();

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={{
        flex: 1,
        minHeight: 52,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: palette.shellBorder,
        backgroundColor: palette.shellSurface,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minWidth: 0 }}>
        <IconSymbol name={icon} color={palette.text} size={22} />
        <Text style={{ color: palette.text, fontSize: 16, fontWeight: "700" }} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <IconSymbol name="chevron.down" color={palette.shellMutedText} size={22} />
    </TouchableOpacity>
  );
}

interface SheetOptionProps {
  label: string;
  icon: "movieclapper" | "arrow.up.arrow.down" | "tv";
  isSelected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

function SheetOption({ label, icon, isSelected, onPress, accessibilityLabel }: SheetOptionProps): ReactElement {
  const { palette } = useThemePreference();

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={{
        minHeight: 56,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: isSelected ? palette.shellBorder : "transparent",
        backgroundColor: isSelected ? palette.shellBackground : "transparent",
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <IconSymbol name={icon} color={isSelected ? palette.shellChipActive : palette.shellMutedText} size={24} />
        <Text style={{ color: palette.text, fontSize: 17, fontWeight: "700" }}>{label}</Text>
      </View>
      <IconSymbol name={isSelected ? "checkmark" : "circle"} color={isSelected ? palette.shellChipActive : palette.shellMutedText} size={26} />
    </TouchableOpacity>
  );
}
