import * as Linking from "expo-linking";
import { safeParseSharedMediaPayload } from "./mediaShare";
import type { SharedMediaPayload } from "./mediaShare";

const SCHEME = "vibevault";

export function createMediaShareUrl(payload: SharedMediaPayload): string {
  const base: SharedMediaPayload = {
    id: payload.id,
    mediaType: payload.mediaType,
    title: payload.title,
    imageSrc: payload.imageSrc,
    description: payload.description,
    cast: payload.cast,
    releaseDate: payload.releaseDate,
    whereToWatch: payload.whereToWatch,
    seasons: payload.seasons,
  };

  const encoded = encodeURIComponent(JSON.stringify(base));
  const path = `details/${encodeURIComponent(payload.id)}`;

  return Linking.createURL(path, {
    scheme: SCHEME,
    queryParams: { shared: encoded },
  });
}

export function parseIncomingShareUrl(url: string): SharedMediaPayload | null {
  try {
    const parsed = Linking.parse(url);

    if (!parsed.path?.startsWith("details/")) {
      return null;
    }

    const sharedParam = parsed.queryParams?.shared;
    if (!sharedParam || typeof sharedParam !== "string") {
      return null;
    }

    const decoded = decodeURIComponent(sharedParam);
    const parsed2 = JSON.parse(decoded);

    return safeParseSharedMediaPayload(parsed2);
  } catch {
    return null;
  }
}