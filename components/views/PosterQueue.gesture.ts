import type { PosterQueueItem } from "./PosterQueue";

export type SwipeDirection = "left" | "right" | "up" | "down" | "none";

export const SWIPE_THRESHOLD_PX = 80;
export const VERTICAL_THRESHOLD_PX = 60;

export function classifySwipeGesture(
  dx: number,
  dy: number,
  absDx: number,
  absDy: number
): SwipeDirection {
  "worklet";
  if (absDx < 10 && absDy < 10) {
    return "none";
  }
  if (absDx > absDy) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "down" : "up";
}

export function shouldRespondToPanGesture(
  dx: number,
  dy: number,
  absDx: number,
  absDy: number
): boolean {
  "worklet";
  return absDx > 10 || absDy > 10;
}

export function createGestureState(
  dx: number,
  dy: number,
  numberActiveTouches: number
): { dx: number; dy: number; moveX: number; moveY: number; numberActiveTouches: number } {
  return { dx, dy, moveX: 0, moveY: 0, numberActiveTouches };
}

export type GestureIntent =
  | { type: "mark_watched" }
  | { type: "navigate_item"; direction: "next" | "prev" }
  | { type: "none" };

export function resolveGestureIntent(
  direction: SwipeDirection,
  _item: PosterQueueItem
): GestureIntent {
  if (direction === "right") {
    return { type: "mark_watched" };
  }
  if (direction === "up") {
    return { type: "navigate_item", direction: "next" };
  }
  if (direction === "down") {
    return { type: "navigate_item", direction: "prev" };
  }
  return { type: "none" };
}