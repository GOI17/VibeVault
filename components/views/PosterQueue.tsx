import type { Season } from "@/domain/entities/Movie";
import type { FavoriteSource } from "@/domain/entities/Favorite";

export interface CurrentEpisodeInfo {
  seasonNumber: number;
  episodeNumber: number;
  title?: string;
  label: string;
}

export interface PosterQueueItem {
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
  currentEpisode?: CurrentEpisodeInfo;
  nextEpisodeLabel?: string;
}

export interface PosterQueueViewModel {
  items: PosterQueueItem[];
  currentIndex: number;
}