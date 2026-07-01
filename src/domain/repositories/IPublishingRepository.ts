import type { PublicProfile, PublicProfileUpdate } from "@/domain/entities/PublicProfile";
import type { PublishedList, PublishedListInput, PublishedListUpdate } from "@/domain/entities/PublishedList";
import type { PublishedRewind, PublishedRewindInput } from "@/domain/entities/PublishedRewind";
import type { SocialActivity } from "@/domain/entities/SocialActivity";

/**
 * Repository for publication (P4) and social (P5) backend operations.
 */
export interface IPublishingRepository {
  // Auth
  linkGoogleAccount(idToken: string, displayName?: string): Promise<{ token: string; handle: string }>;
  setAuthToken(token: string): Promise<void>;
  getAuthToken(): Promise<string | null>;
  clearAuthToken(): Promise<void>;

  // Profiles
  getMyProfile(): Promise<PublicProfile>;
  updateMyProfile(update: PublicProfileUpdate): Promise<void>;
  getPublicProfile(handle: string): Promise<PublicProfile>;

  // Lists
  getMyLists(): Promise<PublishedList[]>;
  getList(id: string): Promise<PublishedList>;
  createList(input: PublishedListInput): Promise<{ id: string; slug: string }>;
  updateList(id: string, update: PublishedListUpdate): Promise<void>;
  deleteList(id: string): Promise<void>;
  getPublicLists(handle: string): Promise<PublishedList[]>;

  // Rewinds
  getMyRewind(year: number): Promise<PublishedRewind>;
  publishRewind(year: number, input: PublishedRewindInput): Promise<void>;
  getPublicRewind(handle: string, year: number): Promise<PublishedRewind>;

  // Social (P5)
  follow(handle: string): Promise<void>;
  unfollow(handle: string): Promise<void>;
  getFollowers(handle: string): Promise<{ handle: string; displayName: string }[]>;
  getFollowing(handle: string): Promise<{ handle: string; displayName: string }[]>;
  getFeed(limit?: number, before?: string): Promise<SocialActivity[]>;
}
