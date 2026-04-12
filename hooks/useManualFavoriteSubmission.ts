import { useCallback } from "react";

import type { AddFavoriteFormValues } from "@/components/forms/AddFavoriteForm";
import { parseManualSeriesSeasonsPayload } from "@/domain/entities/ManualFavorite";
import { useFavoriteMutations } from "@/hooks/useFavoriteMutations";

type OnSuccess = () => void;

type SubmitManualFavorite = (values: AddFavoriteFormValues) => void;

export function useManualFavoriteSubmission(onSuccess: OnSuccess): SubmitManualFavorite {
  const { addFavorite } = useFavoriteMutations();

  return useCallback(
    (values: AddFavoriteFormValues) => {
      const cast = values.cast
        .split(",")
        .map((member) => member.trim())
        .filter(Boolean);

      const whereToWatch = values.whereToWatch
        .split(",")
        .map((platform) => platform.trim())
        .filter(Boolean);

      const seasons =
        values.mediaType === "series" && values.seasonsPayload
          ? parseManualSeriesSeasonsPayload(values.seasonsPayload)
          : undefined;

      addFavorite({
        id: `custom-${Date.now()}`,
        title: values.title,
        mediaType: values.mediaType,
        url: values.url,
        platform: values.platform,
        description: values.description,
        cast,
        releaseDate: values.releaseDate,
        whereToWatch,
        seasons,
        source: "manual",
      });

      onSuccess();
    },
    [addFavorite, onSuccess]
  );
}
