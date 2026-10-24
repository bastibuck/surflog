import { z } from "zod";

const SpotBaseSchema = z.object({
  id: z.uuid(),
  name: z.string().max(50).nonempty(),
});

const GetSpotsListResponseSchema = SpotBaseSchema.pick({
  id: true,
  name: true,
}).array();

const CreateSpotPayloadSchema = SpotBaseSchema.pick({
  name: true,
});

export { GetSpotsListResponseSchema, CreateSpotPayloadSchema };

export type CreateSpotPayload = z.infer<typeof CreateSpotPayloadSchema>;
