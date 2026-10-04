import { z } from "zod";

const SessionBaseSchema = z.object({
  id: z.uuid(),
  name: z.string().max(50).nonempty(),
});

const SessionDetailsResponseSchema = SessionBaseSchema;
const SessionListResponseSchema = z.array(SessionDetailsResponseSchema);

const CreateSessionPayloadSchema = SessionDetailsResponseSchema.omit({
  id: true,
});

export {
  SessionDetailsResponseSchema,
  SessionListResponseSchema,
  CreateSessionPayloadSchema,
};
