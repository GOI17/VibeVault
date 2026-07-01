import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

import { useRepositories } from "./RepositoryProvider";
import type { PublicProfile, PublicProfileUpdate } from "@/domain/entities/PublicProfile";



interface PublishingContextType {
  isAuthenticated: boolean | null;
  profile: PublicProfile | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  signIn: (idToken: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (update: PublicProfileUpdate) => Promise<void>;
}

const PublishingContext = createContext<PublishingContextType | undefined>(undefined);

interface PublishingProviderProps {
  children: ReactNode;
}

export function PublishingProvider({ children }: PublishingProviderProps): ReactElement {
  const { publishingRepository } = useRepositories();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkAuth = useCallback(async () => {
    const token = await publishingRepository.getAuthToken();
    setIsAuthenticated(Boolean(token));
  }, [publishingRepository]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await publishingRepository.getAuthToken();
      if (!token) {
        setProfile(null);
        setIsAuthenticated(false);
        return;
      }
      const p = await publishingRepository.getMyProfile();
      setProfile(p);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setProfile(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [publishingRepository]);

  const signIn = useCallback(
    async (idToken: string, displayName?: string) => {
      await publishingRepository.linkGoogleAccount(idToken, displayName);
      await refresh();
    },
    [publishingRepository, refresh]
  );

  const signOut = useCallback(async () => {
    await publishingRepository.clearAuthToken();
    setProfile(null);
    setIsAuthenticated(false);
  }, [publishingRepository]);

  const updateProfile = useCallback(
    async (update: PublicProfileUpdate) => {
      await publishingRepository.updateMyProfile(update);
      await refresh();
    },
    [publishingRepository, refresh]
  );

  useEffect(() => {
    void checkAuth();
    void refresh();
  }, [checkAuth, refresh]);

  return (
    <PublishingContext.Provider
      value={{
        isAuthenticated,
        profile,
        isLoading,
        error,
        refresh,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </PublishingContext.Provider>
  );
}

export function usePublishing(): PublishingContextType {
  const context = useContext(PublishingContext);
  if (context === undefined) {
    throw new Error("usePublishing must be used within a PublishingProvider");
  }
  return context;
}
