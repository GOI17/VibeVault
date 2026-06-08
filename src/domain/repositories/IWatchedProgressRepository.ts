import type {
  WatchedEpisode,
  WatchedEpisodeInput,
  WatchedMovie,
} from "@/domain/entities/WatchedProgress";

export interface IWatchedProgressRepository {
  getMovieStatus(mediaId: string): Promise<WatchedMovie | null>;

  setMovieWatched(mediaId: string, watched: boolean): Promise<WatchedMovie>;

  getEpisodeStatuses(mediaId: string): Promise<WatchedEpisode[]>;

  setEpisodeWatched(input: WatchedEpisodeInput): Promise<WatchedEpisode>;

  clearMediaProgress(mediaId: string): Promise<void>;

  getAllWatchedShows(): Promise<string[]>;
}
