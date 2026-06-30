import type { IStreamingLinkRepository } from "@/domain/repositories/IStreamingLinkRepository";
import {
  buildStreamingLink,
  normalizeProviderName,
  type StreamingLink,
  type StreamingLinkInput,
  type StreamingPlatform,
} from "@/domain/entities/StreamingPlatform";

/**
 * Static repository that builds streaming links from URL templates.
 *
 * This is the first adapter for the streaming-link contract. It does not need a
 * network or paid key, but it requires the caller to supply the provider-specific
 * ID for each title. Later adapters can call TMDB/JustWatch APIs to discover IDs.
 */
export class StaticStreamingLinkRepository implements IStreamingLinkRepository {
  resolve(input: StreamingLinkInput): StreamingLink {
    return buildStreamingLink(input);
  }

  resolveAll(availability: Record<StreamingPlatform, string>): StreamingLink[] {
    const entries = Object.entries(availability) as [StreamingPlatform, string][];
    return entries.map(([platform, platformId]) => this.resolve({ platform, platformId }));
  }

  resolveFromText(
    text: string,
    resolver: (platform: StreamingPlatform) => string | undefined
  ): StreamingLink | null {
    const platform = normalizeProviderName(text);
    if (!platform) {
      return null;
    }

    const platformId = resolver(platform);
    if (!platformId) {
      return null;
    }

    return this.resolve({ platform, platformId });
  }
}
