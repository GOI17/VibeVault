import { useCallback, useEffect, useState } from "react";

import { useRepositories } from "@/providers/RepositoryProvider";
import type { PublishedRewind, PublishedRewindInput } from "@/domain/entities/PublishedRewind";

type RewindPublishInput = Omit<PublishedRewindInput, "year">;

export function usePublishedRewind(year: number) {
  const { publishingRepository } = useRepositories();
  const [rewind, setRewind] = useState<PublishedRewind | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await publishingRepository.getMyRewind(year);
      setRewind(data);
    } catch (err) {
      setRewind(null);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [publishingRepository, year]);

  const publish = useCallback(
    async (input: RewindPublishInput) => {
      await publishingRepository.publishRewind(year, { ...input, year });
      await refresh();
    },
    [publishingRepository, refresh, year]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { rewind, isLoading, error, refresh, publish };
}
