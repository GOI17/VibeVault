import type {
  AnalyticsEvent,
  AnalyticsEventKind,
  AnalyticsStore,
} from "@/domain/entities/Analytics";

/**
 * Repository contract for the analytics foundation (P0).
 *
 * Implementations are local-first by default. Events may later be batched and
 * sent to a backend, but the contract does not require a network.
 */
export interface IAnalyticsRepository {
  /**
   * Record a single analytics event.
   */
  track(event: AnalyticsEvent): Promise<void>;

  /**
   * Convenience method for tracking an event by kind and optional payload.
   */
  trackKind(kind: AnalyticsEventKind, payload?: Record<string, unknown>): Promise<void>;

  /**
   * Return the full store or a filtered view.
   */
  getStore(): Promise<AnalyticsStore>;

  /**
   * Export events as a plain object for dashboards, CSV, or backup.
   */
  exportEvents(): Promise<AnalyticsStore>;

  /**
   * Check whether an event of a given kind has already been recorded.
   */
  hasOccurred(kind: AnalyticsEventKind): Promise<boolean>;
}
