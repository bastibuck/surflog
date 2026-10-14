import { z } from "zod";

// TODO: replace with fastify.swagger() and build openAPI specs to consume by FE
const SessionBaseSchema = z.object({
  id: z.uuid(),
  name: z.string().max(50).nonempty(),
  date: z.iso.date(),
  rating: z.number().int().min(1).max(10),
});

const SessionDetailsResponseSchema = SessionBaseSchema;
const SessionListResponseSchema = z.array(SessionDetailsResponseSchema);

const CreateSessionPayloadSchema = SessionDetailsResponseSchema.omit({
  id: true,
}).extend({
  spotId: z.uuid(),
  sailId: z.uuid(),
});

export {
  SessionDetailsResponseSchema,
  SessionListResponseSchema,
  CreateSessionPayloadSchema,
};
