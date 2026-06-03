import { type ReactElement } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import MasonryList, { type MasonryItemData } from "@/components/Masonry";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";

interface SearchViewProps {
  query: string;
  isLoading: boolean;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  isRetrying: boolean;
  data: MasonryItemData[];
  favoriteIds: ReadonlySet<string>;
  onRetrySearch: () => void;
  onGoHome: () => void;
  onAddFavorite: (item: MasonryItemData) => void;
  onRemoveFavorite: (item: MasonryItemData) => void;
  onOpenDetails: (item: MasonryItemData) => void;
}

export function SearchView({
  query,
  isLoading,
  errorMessage,
  retryCount,
  maxRetries,
  isRetrying,
  data,
  favoriteIds,
  onRetrySearch,
  onGoHome,
  onAddFavorite,
  onRemoveFavorite,
  onOpenDetails,
}: SearchViewProps): ReactElement {
  const { palette } = useThemePreference();
  const hasReachedMaxRetries = retryCount >= maxRetries;

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
          <TouchableOpacity
            onPress={hasReachedMaxRetries ? onGoHome : onRetrySearch}
            disabled={!hasReachedMaxRetries && isRetrying}
            accessibilityRole="button"
            accessibilityLabel={hasReachedMaxRetries ? "Go back to Home" : "Retry search"}
            style={{
              marginTop: 18,
              paddingHorizontal: 18,
              paddingVertical: 10,
              borderRadius: 18,
              backgroundColor: hasReachedMaxRetries ? palette.shellSurface : palette.shellChipActive,
              borderWidth: 1,
              borderColor: hasReachedMaxRetries ? palette.shellBorder : palette.shellChipActive,
              opacity: !hasReachedMaxRetries && isRetrying ? 0.7 : 1,
            }}
          >
            <Text
              style={{
                color: hasReachedMaxRetries ? palette.text : palette.shellChipTextActive,
                fontWeight: "700",
              }}
            >
              {hasReachedMaxRetries ? "Go to Home" : isRetrying ? "Retrying..." : `Retry (${retryCount}/${maxRetries})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, minHeight: 0, backgroundColor: palette.shellBackground }}>
      <View style={{ flex: 1, minHeight: 0 }}>
        <MasonryList
          data={data}
          isFavorites={false}
          showLayoutToggle={false}
          forceListOnMobile
          topInset={16}
          favoriteIds={favoriteIds}
          onAddFavorite={onAddFavorite}
          onRemoveFavorite={onRemoveFavorite}
          onOpenDetails={onOpenDetails}
        />
      </View>
    </View>
  );
}
