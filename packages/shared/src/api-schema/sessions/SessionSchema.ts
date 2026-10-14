import { z } from "zod";

const SessionBaseSchema = z.object({
  id: z.uuid(),
  name: z.string().max(50).nonempty(),
  date: z.iso.date(),
  rating: z.number().int().min(1).max(10),
});

const GetSessionsListResponseSchema = SessionBaseSchema.array();
const GetSessionResponseSchema = SessionBaseSchema;

const CreateSessionPayloadSchema = SessionBaseSchema.omit({
  id: true,
}).extend({
  spotId: z.uuid(),
  sailId: z.uuid(),
});

export {
  GetSessionsListResponseSchema,
  GetSessionResponseSchema,
  CreateSessionPayloadSchema,
};
