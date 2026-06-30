import type {
  StreamingLink,
  StreamingLinkInput,
  StreamingPlatform,
} from "@/domain/entities/StreamingPlatform";

/**
 * Repository contract for resolving streaming-provider deep links.
 *
 * Implementations may be static (hard-coded URL templates), provider-backed
 * (JustWatch/TMDB), or a hybrid. The UI only depends on this contract; it does
 * not know how provider IDs are discovered or how URLs are built.
 */
export interface IStreamingLinkRepository {
  /**
   * Resolve a deep link for a specific title on a specific platform.
   *
   * @param input.platform The streaming platform.
   * @param input.platformId The provider-specific identifier (e.g. Netflix title ID).
   * @returns A StreamingLink with web and optional native URLs.
   */
  resolve(input: StreamingLinkInput): StreamingLink;

  /**
   * Build links for every platform where a title is available.
   *
   * @param availability Map of platform → provider ID, typically from TMDB/JustWatch.
   * @returns Normalized deep links in display order.
   */
  resolveAll(availability: Record<StreamingPlatform, string>): StreamingLink[];

  /**
   * Given a free-text "where to watch" entry, attempt to match it to a known
   * platform and synthesize a link. This is a fallback for the legacy free-text
   * data until structured availability is available.
   *
   * @param text Free-text provider name (e.g. "on Netflix").
   * @param resolver Optional function that returns a platform ID for a matched platform.
   * @returns A link if a known platform was recognized and an ID could be resolved.
   */
  resolveFromText(
    text: string,
    resolver: (platform: StreamingPlatform) => string | undefined
  ): StreamingLink | null;
}
