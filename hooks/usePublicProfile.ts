import { useCallback, useEffect, useState } from "react";

import { useRepositories } from "@/providers/RepositoryProvider";
import type { PublicProfile } from "@/domain/entities/PublicProfile";

export function usePublicProfile(handle: string) {
  const { publishingRepository } = useRepositories();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await publishingRepository.getPublicProfile(handle);
      setProfile(data);
    } catch (err) {
      setProfile(null);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [publishingRepository, handle]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { profile, isLoading, error, refresh };
}
