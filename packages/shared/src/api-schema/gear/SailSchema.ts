import { z } from "zod";

const SailBaseSchema = z.object({
  id: z.uuid(),
  displayName: z.string(),
});

const GetSailListResponseSchema = SailBaseSchema.pick({
  id: true,
  displayName: true,
}).array();

export { GetSailListResponseSchema };
