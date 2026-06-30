import { z } from "zod";

/**
 * Subscription tier for the freemium model.
 *
 * The app is ad-free; revenue comes from paid premium features.
 */
export const SubscriptionTierEnum = z.enum(["free", "premium"]);
export type SubscriptionTier = z.infer<typeof SubscriptionTierEnum>;

export const SubscriptionStatusSchema = z.object({
  tier: SubscriptionTierEnum,
  isActive: z.boolean(),
  expiresAt: z.string().datetime().optional(),
});

export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

export const PREMIUM_FEATURES = [
  "notifications",
  "streaming_deep_links",
  "unlimited_history",
  "cloud_sync",
] as const;

export type PremiumFeature = (typeof PREMIUM_FEATURES)[number];

/**
 * Returns true when the user has an active premium subscription.
 */
export function isPremium(status: SubscriptionStatus | null): boolean {
  return status?.tier === "premium" && status.isActive;
}

/**
 * Returns true when the user is entitled to a given premium feature.
 *
 * All premium features currently require the same active subscription. This
 * helper keeps feature checks explicit and makes it easy to introduce
 * feature-specific entitlements later (e.g. a cheaper "notifications only" tier).
 */
export function hasFeature(
  status: SubscriptionStatus | null,
  _feature: PremiumFeature
): boolean {
  return isPremium(status);
}
