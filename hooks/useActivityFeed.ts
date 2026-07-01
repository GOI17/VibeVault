import { useCallback, useEffect, useState } from "react";

import { useRepositories } from "@/providers/RepositoryProvider";
import type { SocialActivity } from "@/domain/entities/SocialActivity";

export function useActivityFeed() {
  const { publishingRepository } = useRepositories();
  const [activities, setActivities] = useState<SocialActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await publishingRepository.getFeed(50);
      setActivities(data);
    } catch (err) {
      setActivities([]);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [publishingRepository]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { activities, isLoading, error, refresh };
}
