import { z } from "zod";

const CreateSessionShareResponseSchema = z.object({
  shareLink: z.url(),
});

export { CreateSessionShareResponseSchema };
