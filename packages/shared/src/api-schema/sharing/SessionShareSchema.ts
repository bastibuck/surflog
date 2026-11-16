import { z } from "zod";
import { GetSessionResponseSchema } from "../sessions/SessionSchema.ts";

const CreateSessionShareResponseSchema = z.object({
  shareLink: z.url(),
});

const GetSharedSessionResponseSchema = GetSessionResponseSchema.omit({
  shareTokenPreview: true,
});

export { CreateSessionShareResponseSchema, GetSharedSessionResponseSchema };
