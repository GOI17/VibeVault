import type { AnalyticsStore } from "@/domain/entities/Analytics";

export function analyticsStoreToCsv(store: AnalyticsStore): string {
  const header = "kind,occurredAt,payload\n";
  const rows = store.events
    .map((event) =>
      [
        event.kind,
        event.occurredAt,
        JSON.stringify(event.payload ?? {}),
      ].join(",")
    )
    .join("\n");

  return header + rows;
}

export function analyticsStoreToJson(store: AnalyticsStore): string {
  return JSON.stringify(store, null, 2);
}
