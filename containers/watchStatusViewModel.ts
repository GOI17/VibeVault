import type { MasonryItemData } from "@/components/Masonry";
import type { IWatchedProgressRepository } from "@/domain/repositories/IWatchedProgressRepository";

export type WatchStatusByMediaId = Record<string, Pick<MasonryItemData, "watchStatus" | "progressLabel" | "progressPercent">>;

function getSeriesEpisodeTotal(item: MasonryItemData): number {
  return item.seasons?.reduce((total, season) => total + season.episodes.length, 0) ?? 0;
}

function createSeriesWatchStatus(watchedCount: number, totalCount: number): Pick<MasonryItemData, "watchStatus" | "progressLabel" | "progressPercent"> {
  if (totalCount <= 0) {
    return { watchStatus: watchedCount > 0 ? "watching" : "not-started" };
  }

  if (watchedCount <= 0) {
    return { watchStatus: "not-started", progressLabel: `0 / ${totalCount} Episodes`, progressPercent: 0 };
  }

  const progressPercent = Math.min(100, Math.round((watchedCount / totalCount) * 100));

  return {
    watchStatus: watchedCount >= totalCount ? "watched" : "watching",
    progressLabel: `${watchedCount} / ${totalCount} Episodes`,
    progressPercent,
  };
}

export async function getWatchStatusByMediaId(
  items: MasonryItemData[],
  watchedProgressRepository: IWatchedProgressRepository
): Promise<WatchStatusByMediaId> {
  const entries = await Promise.all(
    items.map(async (item): Promise<[string, WatchStatusByMediaId[string]]> => {
      if (item.mediaType === "series") {
        const watchedEpisodes = await watchedProgressRepository.getEpisodeStatuses(item.key);
        return [item.key, createSeriesWatchStatus(watchedEpisodes.filter((episode) => episode.watched).length, getSeriesEpisodeTotal(item))];
      }

      const movieStatus = await watchedProgressRepository.getMovieStatus(item.key);
      return [item.key, { watchStatus: movieStatus?.watched ? "watched" : "not-started" }];
    })
  );

  return Object.fromEntries(entries);
}
