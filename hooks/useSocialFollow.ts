import { useCallback, useEffect, useState } from "react";

import { useRepositories } from "@/providers/RepositoryProvider";

export function useSocialFollow(handle: string) {
  const { publishingRepository } = useRepositories();
  const [followers, setFollowers] = useState<{ handle: string; displayName: string }[]>([]);
  const [following, setFollowing] = useState<{ handle: string; displayName: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [f1, f2] = await Promise.all([
        publishingRepository.getFollowers(handle),
        publishingRepository.getFollowing(handle),
      ]);
      setFollowers(f1);
      setFollowing(f2);
    } finally {
      setIsLoading(false);
    }
  }, [publishingRepository, handle]);

  const follow = useCallback(async () => {
    await publishingRepository.follow(handle);
    await refresh();
  }, [publishingRepository, refresh, handle]);

  const unfollow = useCallback(async () => {
    await publishingRepository.unfollow(handle);
    await refresh();
  }, [publishingRepository, refresh, handle]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { followers, following, isLoading, refresh, follow, unfollow };
}
