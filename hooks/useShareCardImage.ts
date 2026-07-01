import { useCallback, useRef } from "react";
import { Share, View } from "react-native";
import { captureRef } from "react-native-view-shot";

import { useAnalytics } from "@/providers/AnalyticsProvider";

interface ShareCardPayload {
  title: string;
  year?: string;
  tagline?: string;
  imageSrc?: string;
  whereToWatch?: string[];
}

export function useShareCardImage() {
  const ref = useRef<View>(null);
  const { track } = useAnalytics();

  const captureAndShare = useCallback(
    async (payload: ShareCardPayload): Promise<void> => {
      if (!ref.current) {
        return;
      }

      try {
        const uri = await captureRef(ref.current, { format: "png", quality: 1 });
        if (typeof uri !== "string") {
          return;
        }

        await Share.share({
          title: payload.title,
          message: `Check out ${payload.title} on VibeVault`,
          url: uri,
        });

        await track("share_generated", {
          id: payload.title,
          format: "image",
        });
      } catch {
        // User cancelled or share failed; do not track.
      }
    },
    [track]
  );

  return { ref, captureAndShare };
}
