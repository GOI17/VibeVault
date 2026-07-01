import type { Favorite } from "@/domain/entities/Favorite";
import type { WatchedEpisode, WatchedMovie } from "@/domain/entities/WatchedProgress";

export interface DeviceRewindStats {
  year: number;
  moviesWatched: number;
  episodesWatched: number;
  seriesCount: number;
  topMovie?: Favorite;
  topSeries?: Favorite;
  topGenre?: string;
}

/**
 * Compute a device-local "year in review" from favorites and watched progress.
 *
 * No backend is involved. The result is designed to be rendered into a card,
 * image, or PDF and shared through the native share sheet.
 */
export function computeDeviceRewind(
  favorites: Favorite[],
  watchedMovies: WatchedMovie[],
  watchedEpisodes: WatchedEpisode[],
  year: number = new Date().getFullYear()
): DeviceRewindStats {
  const withinYear = (date?: string) => {
    if (!date) return false;
    return new Date(date).getFullYear() === year;
  };

  const moviesInYear = watchedMovies.filter((m) => m.watched && withinYear(m.watchedAt));
  const episodesInYear = watchedEpisodes.filter((e) => e.watched && withinYear(e.watchedAt));

  const seriesIds = new Set(episodesInYear.map((e) => e.mediaId));
  const favoriteLookup = new Map(favorites.map((f) => [f.id, f]));

  const topMovie = [...moviesInYear]
    .sort((a, b) => (b.watchedAt ?? "").localeCompare(a.watchedAt ?? ""))
    .map((m) => favoriteLookup.get(m.mediaId))
    .find(Boolean);

  const topSeries = [...seriesIds]
    .map((id) => favoriteLookup.get(id))
    .filter(Boolean)
    .sort((a, b) => (b?.addedAt ?? "").localeCompare(a?.addedAt ?? ""))[0];

  return {
    year,
    moviesWatched: moviesInYear.length,
    episodesWatched: episodesInYear.length,
    seriesCount: seriesIds.size,
    topMovie: topMovie ?? undefined,
    topSeries: topSeries ?? undefined,
  };
}
