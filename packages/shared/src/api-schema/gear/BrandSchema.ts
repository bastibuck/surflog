import { z } from "zod";

const BrandBaseSchema = z.object({
  id: z.uuid(),
  name: z.string().max(100).nonempty(),
});

const GetBrandListResponseSchema = BrandBaseSchema.pick({
  id: true,
  name: true,
}).array();

export { GetBrandListResponseSchema };
