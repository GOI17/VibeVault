import { useEffect, useState, type ReactElement } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

import MasonryList, { type MasonryItemData } from "@/components/Masonry";
import { Colors } from "@/constants/Colors";

interface SearchViewProps {
  query: string;
  isLoading: boolean;
  errorMessage?: string;
  data: MasonryItemData[];
  favoriteIds: ReadonlySet<string>;
  onSearchQuery: (query: string) => void;
  onAddFavorite: (item: MasonryItemData) => void;
  onRemoveFavorite: (item: MasonryItemData) => void;
  onOpenDetails: (item: MasonryItemData) => void;
}

const palette = Colors.light;

export function SearchView({
  query,
  isLoading,
  errorMessage,
  data,
  favoriteIds,
  onSearchQuery,
  onAddFavorite,
  onRemoveFavorite,
  onOpenDetails,
}: SearchViewProps): ReactElement {
  const [searchDraft, setSearchDraft] = useState(query);

  useEffect(() => {
    setSearchDraft(query);
  }, [query]);

  const submitSearch = (): void => {
    const nextQuery = searchDraft.trim();
    if (!nextQuery || nextQuery === query) {
      return;
    }

    onSearchQuery(nextQuery);
  };

  if (isLoading) {
    return (
      <View style={{ backgroundColor: palette.shellBackground, flex: 1 }}>
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 14,
            marginBottom: 6,
            minHeight: 44,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: palette.shellBorder,
            backgroundColor: palette.shellSurface,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 10,
            gap: 8,
          }}
        >
          <TextInput
            value={searchDraft}
            onChangeText={setSearchDraft}
            style={{ flex: 1, color: palette.text, fontSize: 15 }}
            placeholder="Search titles"
            placeholderTextColor={palette.shellMutedText}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={submitSearch}
          />
          <TouchableOpacity
            onPress={submitSearch}
            accessibilityRole="button"
            accessibilityLabel="Submit search"
          >
            <Text style={{ color: palette.shellMutedText, fontWeight: "600" }}>Search</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ color: palette.text, fontSize: 18 }}>Searching for &quot;{query}&quot;...</Text>
        </View>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={{ backgroundColor: palette.shellBackground, flex: 1 }}>
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 14,
            marginBottom: 6,
            minHeight: 44,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: palette.shellBorder,
            backgroundColor: palette.shellSurface,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 10,
            gap: 8,
          }}
        >
          <TextInput
            value={searchDraft}
            onChangeText={setSearchDraft}
            style={{ flex: 1, color: palette.text, fontSize: 15 }}
            placeholder="Search titles"
            placeholderTextColor={palette.shellMutedText}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={submitSearch}
          />
          <TouchableOpacity
            onPress={submitSearch}
            accessibilityRole="button"
            accessibilityLabel="Submit search"
          >
            <Text style={{ color: palette.shellMutedText, fontWeight: "600" }}>Search</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ color: palette.text, fontSize: 18 }}>Error searching for &quot;{query}&quot;</Text>
          <Text style={{ color: palette.shellMutedText, fontSize: 14, marginTop: 10 }}>{errorMessage}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: palette.shellBackground, flex: 1 }}>
      <View
        style={{
          marginHorizontal: 16,
          marginTop: 14,
          marginBottom: 6,
          minHeight: 44,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: palette.shellBorder,
          backgroundColor: palette.shellSurface,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          gap: 8,
        }}
      >
        <TextInput
          value={searchDraft}
          onChangeText={setSearchDraft}
          style={{ flex: 1, color: palette.text, fontSize: 15 }}
          placeholder="Search titles"
          placeholderTextColor={palette.shellMutedText}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={submitSearch}
        />
        <TouchableOpacity
          onPress={submitSearch}
          accessibilityRole="button"
          accessibilityLabel="Submit search"
        >
          <Text style={{ color: palette.shellMutedText, fontWeight: "600" }}>Search</Text>
        </TouchableOpacity>
      </View>
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
