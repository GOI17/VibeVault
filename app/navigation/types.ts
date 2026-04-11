import type { Season } from "@/domain/entities/Movie";
import type { FavoriteSource } from "@/domain/entities/Favorite";
import type { NavigatorScreenParams } from "@react-navigation/native";

export type TabParamList = {
  Home: undefined;
  Favorites: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  Search: { query?: string } | undefined;
  Details: {
    id: string;
    title?: string;
    mediaType?: "movie" | "series";
    imageSrc?: string;
    description?: string;
    cast?: string[];
    releaseDate?: string;
    whereToWatch?: string[];
    seasons?: Season[];
    source?: FavoriteSource;
  };
  NotFound: undefined;
};
