import { z } from "zod";

export const SocialActivitySchema = z.object({
  id: z.string(),
  actorId: z.string(),
  handle: z.string(),
  displayName: z.string(),
  kind: z.enum(["published_list", "published_rewind", "follow", "deleted_list"]),
  targetId: z.string().nullable(),
  payload: z.record(z.string(), z.unknown()),
  createdAt: z.string().datetime(),
});

export type SocialActivity = z.infer<typeof SocialActivitySchema>;
