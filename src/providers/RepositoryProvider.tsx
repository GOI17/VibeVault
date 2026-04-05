import { createContext, useContext, useMemo, type ReactElement, type ReactNode } from "react";
import type { IFavoriteRepository } from "@/domain/repositories/IFavoriteRepository";
import type { IMovieRepository } from "@/domain/repositories/IMovieRepository";
import type { IBackupRepository } from "@/domain/repositories/IBackupRepository";
import type { Favorite } from "@/domain/entities/Favorite";
import { AsyncStorageFavoriteRepository } from "@/repositories/AsyncStorageFavoriteRepository";
import { APIMovieRepository } from "@/repositories/APIMovieRepository";
import { GoogleDriveBackupRepository } from "@/repositories/GoogleDriveBackupRepository";
import { getStoredToken, signInWithGoogle } from "@/repositories/googleAuth";

interface RepositoryContextType {
  favoriteRepository: IFavoriteRepository;
  movieRepository: IMovieRepository;
  backupRepository: IBackupRepository<Favorite>;
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
