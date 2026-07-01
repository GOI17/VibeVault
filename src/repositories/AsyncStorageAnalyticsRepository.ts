import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createAnalyticsEvent,
  validateAnalyticsStore,
  type AnalyticsEvent,
  type AnalyticsEventKind,
  type AnalyticsStore,
} from "@/domain/entities/Analytics";
import type { IAnalyticsRepository } from "@/domain/repositories/IAnalyticsRepository";

const STORAGE_KEY = "analytics_events";

function emptyStore(): AnalyticsStore {
  return { events: [] };
}

export class AsyncStorageAnalyticsRepository implements IAnalyticsRepository {
  async track(event: AnalyticsEvent): Promise<void> {
    const store = await this.readStore();
    const nextStore = validateAnalyticsStore({
      ...store,
      events: [...store.events, event],
    });
    await this.writeStore(nextStore);
  }

  async trackKind(
    kind: AnalyticsEventKind,
    payload?: Record<string, unknown>
  ): Promise<void> {
    if (kind !== "app_open" && (await this.hasOccurred(kind))) {
      return;
    }

    await this.track(createAnalyticsEvent(kind, payload));
  }

  async getStore(): Promise<AnalyticsStore> {
    return this.readStore();
  }

  async exportEvents(): Promise<AnalyticsStore> {
    return this.readStore();
  }

  async hasOccurred(kind: AnalyticsEventKind): Promise<boolean> {
    const store = await this.readStore();
    return store.events.some((event) => event.kind === kind);
  }

  private async readStore(): Promise<AnalyticsStore> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptyStore();
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      return validateAnalyticsStore(parsed);
    } catch (error) {
      console.error("Failed to parse analytics store:", error);
      return emptyStore();
    }
  }

  private async writeStore(store: AnalyticsStore): Promise<void> {
    const validated = validateAnalyticsStore(store);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
  }
}
