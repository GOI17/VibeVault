import { z } from "zod";

/**
 * Streaming video platforms supported by VibeVault deep links.
 * Music-only providers (Spotify, Deezer, Tidal) were removed because the app
 * focuses on movies and series; legacy values are dropped during migration.
 */
export const StreamingPlatformEnum = z.enum([
  "Netflix",
  "Prime Video",
  "Disney+",
  "Apple TV+",
  "Max",
  "Hulu",
  "Paramount+",
  "YouTube",
]);

export type StreamingPlatform = z.infer<typeof StreamingPlatformEnum>;

/**
 * Human-readable label for each platform.
 */
export function getStreamingPlatformLabel(platform: StreamingPlatform): string {
  const labels: Record<StreamingPlatform, string> = {
    Netflix: "Netflix",
    "Prime Video": "Prime Video",
    "Disney+": "Disney+",
    "Apple TV+": "Apple TV+",
    Max: "Max",
    Hulu: "Hulu",
    "Paramount+": "Paramount+",
    YouTube: "YouTube / Google Play",
  };

  return labels[platform];
}

/**
 * Deep-link / universal-link targets for a title on each platform.
 *
 * These links open the provider's own app or website. VibeVault does not
 * embed, redistribute, or scrape copyrighted content; it only stores the
 * minimum platform ID required to build the link.
 *
 * Platform schemes are subject to each provider's terms and may change over
 * time. The web fallback is always returned so the link remains useful even if
 * the native scheme is not installed.
 */
export interface StreamingLink {
  platform: StreamingPlatform;
  platformId: string;
  webUrl: string;
  nativeUrl?: string;
}

export type StreamingLinkInput = Pick<StreamingLink, "platform" | "platformId">;

/**
 * Build a streaming link from a platform and provider-specific ID.
 */
export function buildStreamingLink(input: StreamingLinkInput): StreamingLink {
  const { platform, platformId } = input;

  const encodedId = encodeURIComponent(platformId);

  switch (platform) {
    case "Netflix":
      return {
        platform,
        platformId,
        webUrl: `https://www.netflix.com/title/${encodedId}`,
        nativeUrl: `nflx://title/${encodedId}`,
      };
    case "Prime Video":
      return {
        platform,
        platformId,
        webUrl: `https://www.primevideo.com/detail/${encodedId}`,
        nativeUrl: `primevideo://detail?asin=${encodedId}`,
      };
    case "Disney+":
      return {
        platform,
        platformId,
        webUrl: `https://www.disneyplus.com/browse/entity-${encodedId}`,
      };
    case "Apple TV+":
      return {
        platform,
        platformId,
        webUrl: `https://tv.apple.com/us/movie/${encodedId}`,
        nativeUrl: `com.apple.tv://media?mt=6&id=${encodedId}`,
      };
    case "Max":
      return {
        platform,
        platformId,
        webUrl: `https://www.max.com/mx/es/movies/${encodedId}`,
      };
    case "Hulu":
      return {
        platform,
        platformId,
        webUrl: `https://www.hulu.com/movie/${encodedId}`,
        nativeUrl: `hulu://movie/${encodedId}`,
      };
    case "Paramount+":
      return {
        platform,
        platformId,
        webUrl: `https://www.paramountplus.com/movies/${encodedId}/`,
      };
    case "YouTube":
      return {
        platform,
        platformId,
        webUrl: `https://www.youtube.com/watch?v=${encodedId}`,
        nativeUrl: `vnd.youtube://${platformId}`,
      };
  }
}

/**
 * Normalize a free-text provider name to a known StreamingPlatform, if possible.
 * Used when importing availability data from external sources.
 */
export function normalizeProviderName(name: string): StreamingPlatform | undefined {
  const normalized = name.trim().toLowerCase();

  if (normalized.includes("netflix")) return "Netflix";
  if (normalized.includes("prime") || normalized.includes("amazon")) return "Prime Video";
  if (normalized.includes("disney")) return "Disney+";
  if (normalized.includes("apple tv") || normalized.includes("appletv")) return "Apple TV+";
  if (normalized.includes("max") || normalized.includes("hbo max")) return "Max";
  if (normalized.includes("hulu")) return "Hulu";
  if (normalized.includes("paramount")) return "Paramount+";
  if (normalized.includes("youtube") || normalized.includes("google play")) return "YouTube";

  return undefined;
}

/**
 * Parse a candidate value into a StreamingPlatform, dropping invalid/legacy values.
 */
export function safeParseStreamingPlatform(value: unknown): StreamingPlatform | undefined {
  const result = StreamingPlatformEnum.safeParse(value);
  return result.success ? result.data : undefined;
}
