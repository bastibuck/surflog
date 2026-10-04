import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

import {
  CreateSessionPayloadSchema,
  SessionDetailsResponseSchema,
  SessionListResponseSchema,
} from "@surflog/shared/api-schema/sessions/SessionSchema";

const sessionsRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
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

  fastify.post(
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

  fastify.get(
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

  fastify.delete(
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

export default sessionsRoutes;
