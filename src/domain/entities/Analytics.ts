import { z } from "zod";

/**
 * Event kinds tracked for the 12-month roadmap analytics foundation (P0).
 *
 * All events are local-first and can be exported for analysis. No backend is
 * required in Phase A.
 */
export const AnalyticsEventKindEnum = z.enum([
  "app_open",
  "first_favorite",
  "first_watched_episode",
  "first_movie_watched",
  "share_generated",
  "return_after_7_days",
  "return_after_30_days",
]);

export type AnalyticsEventKind = z.infer<typeof AnalyticsEventKindEnum>;

export const AnalyticsEventSchema = z.object({
  kind: AnalyticsEventKindEnum,
  occurredAt: z.string().datetime(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

export const AnalyticsStoreSchema = z.object({
  events: z.array(AnalyticsEventSchema).default([]),
  firstOpenAt: z.string().datetime().optional(),
});

export type AnalyticsStore = z.infer<typeof AnalyticsStoreSchema>;

export function createAnalyticsEvent(
  kind: AnalyticsEventKind,
  payload?: Record<string, unknown>
): AnalyticsEvent {
  return {
    kind,
    occurredAt: new Date().toISOString(),
    payload,
  };
}

export function validateAnalyticsStore(data: unknown): AnalyticsStore {
  return AnalyticsStoreSchema.parse(data);
}
