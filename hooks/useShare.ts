import { Share } from "react-native";
import { useCallback } from "react";

import { useAnalytics } from "@/providers/AnalyticsProvider";
import { createMediaShareUrl } from "@/domain/utils/shareMedia";
import type { Season } from "@/domain/entities/Movie";

interface ShareTitlePayload {
  id: string;
  mediaType: "movie" | "series";
  title: string;
  description?: string;
  cast?: string[];
  releaseDate?: string;
  whereToWatch?: string[];
  seasons?: Season[];
  imageSrc?: string;
}

export function useShare() {
  const { track } = useAnalytics();

  return useCallback(
    async (payload: ShareTitlePayload) => {
      const url = createMediaShareUrl(payload);
      try {
        await Share.share({ title: payload.title, message: url });
        await track("share_generated", {
          id: payload.id,
          mediaType: payload.mediaType,
        });
      } catch {
        // User cancelled or share failed; do not track.
      }
    },
    [track]
  );
}
