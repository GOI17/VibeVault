import type { ReactElement } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MasonryList, { type MasonryItemData } from "@/components/Masonry";
import { Colors } from "@/constants/Colors";

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
  const palette = Colors.light;
  const categories = ["Movies", "TV", "Music", "Books"];

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
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {categories.map((category) => {
            const active = category === "Movies";
            return (
              <View
                key={category}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: active ? palette.shellSurface : palette.shellSurfaceAlt,
                  borderWidth: 1,
                  borderColor: active ? palette.shellBorder : "transparent",
                }}
              >
                <Text
                  style={{
                    color: active ? palette.text : palette.shellMutedText,
                    fontWeight: active ? "700" : "500",
                  }}
                >
                  {category}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ flex: 1 }}>
        <MasonryList
          data={movies}
          isFavorites={false}
          showLayoutToggle={false}
          topInset={0}
          favoriteIds={favoriteIds}
          onAddFavorite={onAddFavorite}
          onRemoveFavorite={onRemoveFavorite}
          onOpenDetails={onOpenDetails}
        />
      </View>
    </SafeAreaView>
  );
}
