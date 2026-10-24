import { z } from "zod";

const SailBaseSchema = z.object({
  id: z.uuid(),
  size: z.number().int().positive(),
  alias: z.string().max(30).nullable(),
  brand: z.string().max(100).nonempty(),
});

const GetSailListResponseSchema = SailBaseSchema.pick({
  id: true,
  size: true,
  alias: true,
  brand: true,
}).array();

export { GetSailListResponseSchema };
