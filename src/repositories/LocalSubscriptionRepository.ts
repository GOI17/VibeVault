import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  SubscriptionStatusSchema,
  type SubscriptionStatus,
} from "@/domain/entities/Subscription";
import type { ISubscriptionRepository } from "@/domain/repositories/ISubscriptionRepository";

const STORAGE_KEY = "subscription_status";

/**
 * Local-only subscription repository for development and testing.
 *
 * In production this should be replaced by a store-backed implementation
 * (RevenueCat / Expo In-App Purchases / Stripe). Until then, it persists the
 * subscription state locally so premium feature gates can be built and tested.
 */
export class LocalSubscriptionRepository implements ISubscriptionRepository {
  async getStatus(): Promise<SubscriptionStatus | null> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { tier: "free", isActive: true };
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      return SubscriptionStatusSchema.parse(parsed);
    } catch (error) {
      console.error("Failed to parse subscription status:", error);
      return { tier: "free", isActive: true };
    }
  }

  async refreshStatus(): Promise<SubscriptionStatus | null> {
    return this.getStatus();
  }

  async purchasePremium(): Promise<SubscriptionStatus> {
    const nextStatus: SubscriptionStatus = {
      tier: "premium",
      isActive: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextStatus));
    return nextStatus;
  }

  async restorePurchases(): Promise<SubscriptionStatus | null> {
    return this.getStatus();
  }
}
