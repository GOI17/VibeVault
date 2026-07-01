import { createContext, useContext, useMemo, type ReactElement, type ReactNode } from "react";
import type { IFavoriteRepository } from "@/domain/repositories/IFavoriteRepository";
import type { IMovieRepository } from "@/domain/repositories/IMovieRepository";
import type { IBackupRepository } from "@/domain/repositories/IBackupRepository";
import type { IWatchedProgressRepository } from "@/domain/repositories/IWatchedProgressRepository";
import type { IStreamingLinkRepository } from "@/domain/repositories/IStreamingLinkRepository";
import type { ISubscriptionRepository } from "@/domain/repositories/ISubscriptionRepository";
import type { Favorite } from "@/domain/entities/Favorite";
import { AsyncStorageFavoriteRepository } from "@/repositories/AsyncStorageFavoriteRepository";
import { APIMovieRepository } from "@/repositories/APIMovieRepository";
import { GoogleDriveBackupRepository } from "@/repositories/GoogleDriveBackupRepository";
import { AsyncStorageWatchedProgressRepository } from "@/repositories/AsyncStorageWatchedProgressRepository";
import { StaticStreamingLinkRepository } from "@/repositories/StaticStreamingLinkRepository";
import { LocalSubscriptionRepository } from "@/repositories/LocalSubscriptionRepository";
import type { IAnalyticsRepository } from "@/domain/repositories/IAnalyticsRepository";
import { AsyncStorageAnalyticsRepository } from "@/repositories/AsyncStorageAnalyticsRepository";
import type { IExportRepository } from "@/domain/repositories/IExportRepository";
import type { IPublishingRepository } from "@/domain/repositories/IPublishingRepository";
import { ExpoExportRepository } from "@/repositories/ExpoExportRepository";
import { NetworkPublishingRepository } from "@/repositories/NetworkPublishingRepository";
import { getStoredToken, signInWithGoogle } from "@/repositories/googleAuth";

interface RepositoryContextType {
  favoriteRepository: IFavoriteRepository;
  movieRepository: IMovieRepository;
  backupRepository: IBackupRepository<Favorite>;
  watchedProgressRepository: IWatchedProgressRepository;
  streamingLinkRepository: IStreamingLinkRepository;
  subscriptionRepository: ISubscriptionRepository;
  analyticsRepository: IAnalyticsRepository;
  exportRepository: IExportRepository;
  publishingRepository: IPublishingRepository;
}

const RepositoryContext = createContext<RepositoryContextType | undefined>(
  undefined
);

interface RepositoryProviderProps {
  children: ReactNode;
}

export function RepositoryProvider({ children }: RepositoryProviderProps): ReactElement {
  const repositories = useMemo(() => {
    return {
      favoriteRepository: new AsyncStorageFavoriteRepository(),
      movieRepository: new APIMovieRepository(),
      backupRepository: new GoogleDriveBackupRepository({
        signInWithGoogle,
        getStoredToken,
      }),
      watchedProgressRepository: new AsyncStorageWatchedProgressRepository(),
      streamingLinkRepository: new StaticStreamingLinkRepository(),
      subscriptionRepository: new LocalSubscriptionRepository(),
      analyticsRepository: new AsyncStorageAnalyticsRepository(),
      exportRepository: new ExpoExportRepository(),
      publishingRepository: new NetworkPublishingRepository(),
    };
  }, []);

  return (
    <RepositoryContext.Provider value={repositories}>
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepositories(): RepositoryContextType {
  const context = useContext(RepositoryContext);
  if (context === undefined) {
    throw new Error(
      "useRepositories must be used within a RepositoryProvider"
    );
  }
  return context;
}
