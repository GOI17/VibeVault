import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createEpisodeWatchedKey,
  validateWatchedProgressStore,
  type WatchedEpisode,
  type WatchedEpisodeInput,
  type WatchedMovie,
  type WatchedProgressStore,
} from "@/domain/entities/WatchedProgress";
import type { IWatchedProgressRepository } from "@/domain/repositories/IWatchedProgressRepository";

const STORAGE_KEY = "watched_progress";

function emptyStore(): WatchedProgressStore {
  return {
    movies: [],
    episodes: [],
  };
}

function createWatchedAt(watched: boolean): string | undefined {
  return watched ? new Date().toISOString() : undefined;
}

export class AsyncStorageWatchedProgressRepository implements IWatchedProgressRepository {
  async getMovieStatus(mediaId: string): Promise<WatchedMovie | null> {
    const store = await this.readStore();
    return store.movies.find((movie) => movie.mediaId === mediaId) ?? null;
  }

  async setMovieWatched(mediaId: string, watched: boolean): Promise<WatchedMovie> {
    const store = await this.readStore();
    const record: WatchedMovie = {
      mediaId,
      mediaType: "movie",
      watched,
      watchedAt: createWatchedAt(watched),
    };

    const remainingMovies = store.movies.filter((movie) => movie.mediaId !== mediaId);
    const nextStore = validateWatchedProgressStore({
      ...store,
      movies: watched ? [...remainingMovies, record] : remainingMovies,
    });

    await this.writeStore(nextStore);
    return record;
  }

  async getEpisodeStatuses(mediaId: string): Promise<WatchedEpisode[]> {
    const store = await this.readStore();
    return store.episodes.filter((episode) => episode.mediaId === mediaId && episode.watched);
  }

  async setEpisodeWatched(input: WatchedEpisodeInput): Promise<WatchedEpisode> {
    const store = await this.readStore();
    const episodeKey = createEpisodeWatchedKey(input.seasonNumber, input.episodeNumber);
    const record: WatchedEpisode = {
      ...input,
      mediaType: "series",
      watchedAt: createWatchedAt(input.watched),
    };

    const remainingEpisodes = store.episodes.filter((episode) => {
      if (episode.mediaId !== input.mediaId) {
        return true;
      }

      return createEpisodeWatchedKey(episode.seasonNumber, episode.episodeNumber) !== episodeKey;
    });

    const nextStore = validateWatchedProgressStore({
      ...store,
      episodes: input.watched ? [...remainingEpisodes, record] : remainingEpisodes,
    });

    await this.writeStore(nextStore);
    return record;
  }

  async clearMediaProgress(mediaId: string): Promise<void> {
    const store = await this.readStore();
    const nextStore = validateWatchedProgressStore({
      movies: store.movies.filter((movie) => movie.mediaId !== mediaId),
      episodes: store.episodes.filter((episode) => episode.mediaId !== mediaId),
    });

    await this.writeStore(nextStore);
  }

  async getAllWatchedShows(): Promise<string[]> {
    const store = await this.readStore();
    const showIds = new Set(
      store.episodes
        .filter((episode) => episode.watched)
        .map((episode) => episode.mediaId)
    );
    return Array.from(showIds);
  }

  async exportStore(): Promise<WatchedProgressStore> {
    return this.readStore();
  }

  private async readStore(): Promise<WatchedProgressStore> {
    const storage = await AsyncStorage.getItem(STORAGE_KEY);

    if (!storage) {
      return emptyStore();
    }

    try {
      const parsed: unknown = JSON.parse(storage);
      return validateWatchedProgressStore(parsed);
    } catch (error) {
      console.error("Failed to parse watched progress from storage:", error);
      return emptyStore();
    }
  }

  private async writeStore(store: WatchedProgressStore): Promise<void> {
    const validatedStore = validateWatchedProgressStore(store);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(validatedStore));
  }
}
