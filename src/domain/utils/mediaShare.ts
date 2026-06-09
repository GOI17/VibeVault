import { z } from "zod";
import { SeasonSchema } from "@/domain/entities/Movie";
import { MediaTypeEnum } from "@/domain/entities/Favorite";

export const SharedMediaPayloadSchema = z.object({
  id: z.string().min(1),
  mediaType: MediaTypeEnum,
  title: z.string().trim().min(1).optional(),
  imageSrc: z.string().optional(),
  description: z.string().optional(),
  cast: z.array(z.string()).optional(),
  releaseDate: z.string().optional(),
  whereToWatch: z.array(z.string()).optional(),
  seasons: z.array(SeasonSchema).optional(),
});

export type SharedMediaPayload = z.infer<typeof SharedMediaPayloadSchema>;

export function safeParseSharedMediaPayload(data: unknown): SharedMediaPayload | null {
  const result = SharedMediaPayloadSchema.safeParse(data);
  return result.success ? result.data : null;
}