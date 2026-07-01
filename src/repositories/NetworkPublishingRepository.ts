import * as SecureStore from "expo-secure-store";

import type { IPublishingRepository } from "@/domain/repositories/IPublishingRepository";
import type { PublicProfile, PublicProfileUpdate } from "@/domain/entities/PublicProfile";
import type { PublishedList, PublishedListInput, PublishedListUpdate } from "@/domain/entities/PublishedList";
import type { PublishedRewind, PublishedRewindInput } from "@/domain/entities/PublishedRewind";
import type { SocialActivity } from "@/domain/entities/SocialActivity";

const AUTH_TOKEN_KEY = "vibevault_backend_token";

function getBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_VIBEVAULT_API_URL || "http://localhost:3000/api";
  return url.replace(/\/$/, "");
}

async function api(
  method: string,
  path: string,
  options: { body?: unknown; token?: string | null; query?: Record<string, string | number | undefined> } = {}
): Promise<unknown> {
  const { body, token, query } = options;
  const baseUrl = getBaseUrl();
  const queryString = query
    ? "?" +
      new URLSearchParams(
        Object.entries(query)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${baseUrl}${path}${queryString}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  if (res.status === 204) {
    return undefined;
  }
  return res.json();
}

export class NetworkPublishingRepository implements IPublishingRepository {
  async linkGoogleAccount(idToken: string, displayName?: string): Promise<{ token: string; handle: string }> {
    const data = (await api("POST", "/auth/google", {
      body: { idToken, displayName },
    })) as { token: string; user: { handle: string } };
    await this.setAuthToken(data.token);
    return { token: data.token, handle: data.user.handle };
  }

  async setAuthToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  }

  async getAuthToken(): Promise<string | null> {
    return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  }

  async clearAuthToken(): Promise<void> {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  }

  private async authCall(method: string, path: string, body?: unknown): Promise<unknown> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error("Not authenticated");
    }
    return api(method, path, { body, token });
  }

  async getMyProfile(): Promise<PublicProfile> {
    return (await this.authCall("GET", "/me/profile")) as PublicProfile;
  }

  async updateMyProfile(update: PublicProfileUpdate): Promise<void> {
    await this.authCall("PUT", "/me/profile", update);
  }

  async getPublicProfile(handle: string): Promise<PublicProfile> {
    return (await api("GET", `/u/${encodeURIComponent(handle)}`)) as PublicProfile;
  }

  async getMyLists(): Promise<PublishedList[]> {
    const data = (await this.authCall("GET", "/me/lists")) as { lists: PublishedList[] };
    return data.lists;
  }

  async getList(id: string): Promise<PublishedList> {
    return (await this.authCall("GET", `/me/lists/${encodeURIComponent(id)}`)) as PublishedList;
  }

  async createList(input: PublishedListInput): Promise<{ id: string; slug: string }> {
    const items = input.items?.map((item) => ({
      mediaId: item.mediaId,
      title: item.title,
      mediaType: item.mediaType,
    }));
    return (await this.authCall("POST", "/me/lists", {
      slug: input.slug,
      title: input.title,
      description: input.description,
      isPublic: input.isPublic,
      items,
    })) as { id: string; slug: string };
  }

  async updateList(id: string, update: PublishedListUpdate): Promise<void> {
    await this.authCall("PUT", `/me/lists/${encodeURIComponent(id)}`, update);
  }

  async deleteList(id: string): Promise<void> {
    await this.authCall("DELETE", `/me/lists/${encodeURIComponent(id)}`);
  }

  async getPublicLists(handle: string): Promise<PublishedList[]> {
    const data = (await api("GET", `/u/${encodeURIComponent(handle)}/lists`)) as {
      lists: PublishedList[];
    };
    return data.lists;
  }

  async getMyRewind(year: number): Promise<PublishedRewind> {
    return (await this.authCall("GET", `/me/rewinds/${year}`)) as PublishedRewind;
  }

  async publishRewind(year: number, input: PublishedRewindInput): Promise<void> {
    await this.authCall("POST", `/me/rewinds/${year}`, input);
  }

  async getPublicRewind(handle: string, year: number): Promise<PublishedRewind> {
    return (await api(
      "GET",
      `/rewind/${encodeURIComponent(handle)}/${year}`
    )) as PublishedRewind;
  }

  async follow(handle: string): Promise<void> {
    await this.authCall("POST", `/me/follows/${encodeURIComponent(handle)}`);
  }

  async unfollow(handle: string): Promise<void> {
    await this.authCall("DELETE", `/me/follows/${encodeURIComponent(handle)}`);
  }

  async getFollowers(handle: string): Promise<{ handle: string; displayName: string }[]> {
    const data = (await api("GET", `/u/${encodeURIComponent(handle)}/followers`)) as {
      followers: { handle: string; displayName: string }[];
    };
    return data.followers;
  }

  async getFollowing(handle: string): Promise<{ handle: string; displayName: string }[]> {
    const data = (await api("GET", `/u/${encodeURIComponent(handle)}/following`)) as {
      following: { handle: string; displayName: string }[];
    };
    return data.following;
  }

  async getFeed(limit?: number, before?: string): Promise<SocialActivity[]> {
    const data = (await this.authCall("GET", "/me/feed", {
      limit,
      before,
    })) as { activities: SocialActivity[] };
    return data.activities;
  }
}
