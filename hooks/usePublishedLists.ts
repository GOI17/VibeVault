import { useCallback, useEffect, useState } from "react";

import { useRepositories } from "@/providers/RepositoryProvider";
import type { PublishedList, PublishedListInput, PublishedListUpdate } from "@/domain/entities/PublishedList";

export function usePublishedLists() {
  const { publishingRepository } = useRepositories();
  const [lists, setLists] = useState<PublishedList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await publishingRepository.getMyLists();
      setLists(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [publishingRepository]);

  const createList = useCallback(
    async (input: PublishedListInput) => {
      const result = await publishingRepository.createList(input);
      await refresh();
      return result;
    },
    [publishingRepository, refresh]
  );

  const updateList = useCallback(
    async (id: string, update: PublishedListUpdate) => {
      await publishingRepository.updateList(id, update);
      await refresh();
    },
    [publishingRepository, refresh]
  );

  const deleteList = useCallback(
    async (id: string) => {
      await publishingRepository.deleteList(id);
      await refresh();
    },
    [publishingRepository, refresh]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { lists, isLoading, error, refresh, createList, updateList, deleteList };
}
