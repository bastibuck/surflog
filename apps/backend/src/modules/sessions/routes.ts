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
    function (_request, _reply) {
      return fastify.sessionsRepository.list();
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
    async function (request, reply) {
      const session = await fastify.sessionsRepository.findById(
        request.params.sessionId,
      );

      if (!session) {
        throw reply.notFound("Session not found").send();
      }

      return session;
    },
  );

  fastify.post(
    "/",
    {
      schema: {
        body: CreateSessionPayloadSchema,
      },
    },
    async function (request, reply) {
      await fastify.sessionsRepository.create(request.body);

      return reply.status(204).send();
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
    async function (request, reply) {
      await fastify.sessionsRepository.delete(request.params.sessionId);

      return reply.status(204).send();
    },
  );
};

export default sessionsRoutes;
