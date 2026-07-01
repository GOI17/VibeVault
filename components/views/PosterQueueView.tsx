import { useRef, type ReactElement } from "react";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
} from "react-native";
import type { GestureResponderEvent } from "react-native";
import { Image } from "expo-image";

import type { PosterQueueItem } from "./PosterQueue";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { EmptyState } from "@/components/common/EmptyState";
import { classifySwipeGesture, type SwipeDirection } from "./PosterQueue.gesture";

interface PosterQueueViewProps {
  items: PosterQueueItem[];
  currentIndex: number;
  isLoading?: boolean;
  errorMessage?: string;
  onOpenDetails: (item: PosterQueueItem) => void;
  onMarkWatched: (item: PosterQueueItem) => void;
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
  activeSectionLabel?: string;
}

interface GesturePoint {
  x: number;
  y: number;
}

function getGesturePoint(event: GestureResponderEvent): GesturePoint {
  return {
    x: event.nativeEvent.pageX,
    y: event.nativeEvent.pageY,
  };
}

export function PosterQueueView({
  items,
  currentIndex,
  isLoading,
  errorMessage,
  onOpenDetails,
  onMarkWatched,
  onNavigateNext,
  onNavigatePrev,
}: PosterQueueViewProps): ReactElement | null {
  const { palette } = useThemePreference();
  const gestureStartRef = useRef<GesturePoint | null>(null);
  const gestureLastRef = useRef<GesturePoint | null>(null);

  if (isLoading) {
    return (
      <View style={[styles.messageContainer, { backgroundColor: palette.shellBackground }]}>
        <Text style={{ color: palette.text, fontSize: 18 }}>Loading movies...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={[styles.messageContainer, { backgroundColor: palette.shellBackground }]}>
        <Text style={{ color: palette.text, fontSize: 18 }}>Error loading movies</Text>
        <Text style={{ color: palette.shellMutedText, fontSize: 14, marginTop: 10 }}>{errorMessage}</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={[styles.messageContainer, { backgroundColor: palette.shellBackground }]}>
        <EmptyState
          icon={<IconSymbol name="movieclapper" size={48} color={palette.shellMutedText} />}
          title="No items to explore"
          message="Search or browse to find movies and series to track."
        />
      </View>
    );
  }

  if (currentIndex < 0 || currentIndex >= items.length) {
    return null;
  }

  const item = items[currentIndex] as typeof items[number] & {
    currentEpisode?: { label: string };
    watchedCount?: number;
    totalCount?: number;
    progressLabel?: string;
    progressPercent?: number;
    nextEpisodeLabel?: string;
  };
  const fallbackImage = require("../../assets/images/logo.png");

  function getStatusColor(status: NonNullable<PosterQueueItem["watchStatus"]>, tint: string, success: string, watching: string, muted: string): string {
    switch (status) {
      case "favorite": return tint;
      case "watched": return success;
      case "watching": return watching;
      case "not-started": return muted;
    }
  }

  function getStatusIconName(status: NonNullable<PosterQueueItem["watchStatus"]>): "heart.fill" | "checkmark" | "arrow.up.right" | "circle" {
    switch (status) {
      case "favorite": return "heart.fill";
      case "watched": return "checkmark";
      case "watching": return "arrow.up.right";
      case "not-started": return "circle";
    }
  }

  function getStatusLabel(status: NonNullable<PosterQueueItem["watchStatus"]>): string {
    switch (status) {
      case "favorite": return "Favorite";
      case "watched": return "Watched";
      case "watching": return "Watching";
      case "not-started": return "Not Started";
    }
  }

  function renderStatusPill(status: NonNullable<PosterQueueItem["watchStatus"]>, pal: typeof palette): ReactElement {
    const color = getStatusColor(status, pal.tint, "#7CFF4E", "#3B82F6", pal.shellMutedText);
    return (
      <View
        style={[
          styles.statusPill,
          {
            backgroundColor: status === "not-started" ? pal.shellBackground : `${color}22`,
            borderColor: status === "not-started" ? pal.shellBorder : `${color}55`,
          },
        ]}
      >
        <IconSymbol name={getStatusIconName(status)} color={color} size={14} />
        <Text style={[styles.statusPillText, { color }]}>{getStatusLabel(status)}</Text>
      </View>
    );
  }

  function handleGestureRelease(direction: SwipeDirection): void {
    if (direction === "none") {
      onOpenDetails(item);
    } else if (direction === "right") {
      onMarkWatched(item);
    } else if (direction === "up" && onNavigateNext) {
      onNavigateNext();
    } else if (direction === "down" && onNavigatePrev) {
      onNavigatePrev();
    }
  }

  const swipePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, { dx, dy }) => Math.abs(dx) > 10 || Math.abs(dy) > 10,
    onPanResponderGrant: (event) => {
      const point = getGesturePoint(event);
      gestureStartRef.current = point;
      gestureLastRef.current = point;
    },
    onPanResponderMove: (event) => {
      gestureLastRef.current = getGesturePoint(event);
    },
    onPanResponderRelease: (event, gestureState) => {
      const startPoint = gestureStartRef.current;
      const releasePoint = getGesturePoint(event);
      const fallbackEndPoint = gestureLastRef.current ?? releasePoint;
      const manualDx = startPoint ? fallbackEndPoint.x - startPoint.x : 0;
      const manualDy = startPoint ? fallbackEndPoint.y - startPoint.y : 0;
      const dx = Math.abs(manualDx) > Math.abs(gestureState.dx) ? manualDx : gestureState.dx;
      const dy = Math.abs(manualDy) > Math.abs(gestureState.dy) ? manualDy : gestureState.dy;

      gestureStartRef.current = null;
      gestureLastRef.current = null;

      const direction = classifySwipeGesture(
        dx,
        dy,
        Math.abs(dx),
        Math.abs(dy)
      );
      handleGestureRelease(direction);
    },
    onPanResponderTerminate: () => {
      gestureStartRef.current = null;
      gestureLastRef.current = null;
    },
  });

  return (
    <View
      style={[styles.container, { backgroundColor: palette.shellBackground }]}
      {...swipePanResponder.panHandlers}
    >
      <View
        style={styles.touchable}
        accessibilityRole="button"
        accessibilityLabel={`${item.title} ${item.mediaType === "series" ? "Series" : "Movie"} Tap to view details Swipe right to mark as watched`}
      >
        <View style={styles.cardWrapper}>
          <View
            style={[styles.card, { backgroundColor: palette.shellSurface, borderRadius: 24 }]}
          >
            <Image
              placeholder={fallbackImage}
              source={{ uri: item.imageSrc }}
              style={[styles.posterImage, { borderRadius: 20 }]}
              resizeMode="cover"
            />
            <View style={[styles.overlayGradient, { borderRadius: 20 }]} />
            <View style={styles.mediaBadge}>
              <Text style={[styles.mediaBadgeText, { color: palette.text }]}>
                {item.mediaType === "series" ? "SERIES" : "MOVIE"}
              </Text>
            </View>
            {item.watchStatus && (
              <View style={styles.statusPillWrapper}>
                {renderStatusPill(item.watchStatus, palette)}
              </View>
            )}
            {item.currentEpisode ? (
              <View style={styles.seriesOverlay}>
                <View style={styles.seriesOverlayTopRow}>
                  <Text
                    style={[styles.seriesOverlayTitle, { color: "#fff" }]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text style={[styles.seriesOverlayPercent, { color: palette.tint }]}>
                    {item.progressPercent ?? 0}%
                  </Text>
                </View>
                <Text style={[styles.seriesOverlayEpisode, { color: "rgba(255,255,255,0.9)" }]}>
                  {item.currentEpisode.label}
                </Text>
                <View style={styles.seriesOverlayProgressRow}>
                  <Text style={[styles.seriesOverlayProgressLabel, { color: "rgba(255,255,255,0.7)" }]}>
                    {item.progressLabel}
                  </Text>
                </View>
                <View style={styles.seriesOverlayTrack}>
                  <View
                    style={[
                      styles.seriesOverlayFill,
                      { width: `${item.progressPercent ?? 0}%`, backgroundColor: "#3B82F6" },
                    ]}
                  />
                </View>
                <View style={styles.seriesOverlayHintRow}>
                  <Text style={[styles.seriesOverlayHint, { color: "rgba(255,255,255,0.6)" }]}>
                    Swipe Right to Mark as Watched
                  </Text>
                  <Text style={[styles.seriesOverlayHintArrow, { color: palette.tint }]}>→</Text>
                </View>
              </View>
            ) : (
              <View style={styles.basicOverlay}>
                <Text style={[styles.basicOverlayTitle, { color: "#fff" }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.seriesOverlayHintRow}>
                  <Text style={[styles.seriesOverlayHint, { color: "rgba(255,255,255,0.6)" }]}>Swipe Right to Mark as Watched</Text>
                  <Text style={[styles.seriesOverlayHintArrow, { color: palette.tint }]}>→</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  touchable: {
    flex: 1,
    alignItems: "center",
    width: "100%",
  },
  cardWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  card: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  posterImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
  },
  overlayGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "transparent",
  },
  mediaBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  mediaBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusPillWrapper: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 3,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  seriesOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 48,
    backgroundColor: "rgba(0,0,0,0.72)",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  basicOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 64,
    backgroundColor: "rgba(0,0,0,0.64)",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  basicOverlayTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  seriesOverlayTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  seriesOverlayTitle: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  seriesOverlayPercent: {
    fontSize: 13,
    fontWeight: "700",
  },
  seriesOverlayEpisode: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  seriesOverlayProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  seriesOverlayProgressLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  seriesOverlayTrack: {
    height: 4,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 8,
  },
  seriesOverlayFill: {
    height: "100%",
    borderRadius: 999,
  },
  seriesOverlayHintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  seriesOverlayHint: {
    fontSize: 11,
    fontWeight: "500",
  },
  seriesOverlayHintArrow: {
    fontSize: 13,
    fontWeight: "700",
  },
});
