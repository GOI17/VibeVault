import type { SubscriptionStatus } from "@/domain/entities/Subscription";

/**
 * Repository contract for subscription entitlements.
 *
 * Implementations may use RevenueCat, Expo In-App Purchases, Stripe, or a
 * simple local mock for development. The rest of the app only depends on this
 * contract to decide whether premium features are available.
 */
export interface ISubscriptionRepository {
  /**
   * Get the current subscription status, or null if unknown.
   */
  getStatus(): Promise<SubscriptionStatus | null>;

  /**
   * Refresh the status from the underlying store.
   */
  refreshStatus(): Promise<SubscriptionStatus | null>;

  /**
   * Purchase a premium subscription.
   *
   * Returns the updated status when the purchase completes. Throws on failure
   * so callers can surface the error.
   */
  purchasePremium(): Promise<SubscriptionStatus>;

  /**
   * Restore an existing subscription (e.g. after reinstall or on a new device).
   */
  restorePurchases(): Promise<SubscriptionStatus | null>;
}
