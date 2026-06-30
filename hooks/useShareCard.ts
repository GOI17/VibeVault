import { captureRef } from "react-native-view-shot";
import { useCallback, useRef } from "react";
import type { View } from "react-native";

interface UseShareCardResult {
  ref: React.RefObject<View | null>;
  capture: () => Promise<string | null>;
}

export function useShareCard(): UseShareCardResult {
  const ref = useRef<View>(null);

  const capture = useCallback(async (): Promise<string | null> => {
    if (!ref.current) {
      return null;
    }

    try {
      const uri = await captureRef(ref.current, { format: "png", quality: 1 });
      return typeof uri === "string" ? uri : null;
    } catch (error) {
      console.error("Failed to capture share card:", error);
      return null;
    }
  }, []);

  return { ref, capture };
}
