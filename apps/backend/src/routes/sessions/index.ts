import {
  CreateSessionPayloadSchema,
  SessionDetailsResponseSchema,
  SessionListResponseSchema,
} from "@surflog/shared/api-schema/sessions/SessionSchema";
import { type FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

const sessionsRoute: FastifyPluginAsync = async (fastify, _opts) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    "/",
    {
      schema: {
        response: {
          200: SessionListResponseSchema,
        },
      },
    },
    async function (_request, _reply) {
      return [];
    },
  );

  app.post(
    "/",
    {
      schema: {
        body: CreateSessionPayloadSchema,
      },
    },
    async function (_request, reply) {
      return reply.status(204).send();
    },
  );

  app.get(
    "/:sessionId",
    {
      schema: {
        response: {
          200: SessionDetailsResponseSchema,
        },
        params: z.object({
          sessionId: z.uuid(),
        }),
      },
    },
    function (request, _reply) {
      return {
        id: request.params.sessionId,
        name: "Session Name",
      };
    },
  );

  app.delete(
    "/:sessionId",
    {
      schema: {
        params: z.object({
          sessionId: z.uuid(),
        }),
      },
    },
    function (request, reply) {
      return reply.status(204).send();
    },
  );
};

export default sessionsRoute;
