import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import {
  CreateSessionPayloadSchema,
  GetSessionResponseSchema,
  GetSessionsListResponseSchema,
} from "@surflog/shared/api-schema/sessions/SessionSchema";
import { z } from "zod";

const sessionsRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/",
    {
      schema: {
        tags: ["sessions"],
        response: {
          200: GetSessionsListResponseSchema,
        },
      },
    },
    async function (request, reply) {
      const result = await fastify.sessionsRepository.list();

      if (result.success === false) {
        throw reply.internalServerError("Failed to retrieve sessions").send();
      }

      return result.data;
    },
  );

  fastify.get(
    "/:sessionId",
    {
      schema: {
        tags: ["sessions"],
        response: {
          200: GetSessionResponseSchema,
        },
        params: z.object({
          sessionId: z.uuid(),
        }),
      },
    },
    async function (request, reply) {
      const result = await fastify.sessionsRepository.findById(
        request.params.sessionId,
      );

      if (result.success === false && result.error === "NOT_FOUND") {
        throw reply.notFound("Session not found").send();
      }

      if (result.success === false) {
        throw reply.internalServerError("Failed to retrieve session").send();
      }

      return result.data;
    },
  );

  fastify.post(
    "/",
    {
      schema: {
        tags: ["sessions"],
        body: CreateSessionPayloadSchema,
      },
    },
    async function (request, reply) {
      const result = await fastify.sessionsRepository.create(request.body);

      if (result.success === false && result.error === "DUPLICATE_ENTRY") {
        throw reply
          .conflict("Session with the same name on that day already exists")
          .send();
      }

      return reply.status(204).send();
    },
  );

  fastify.delete(
    "/:sessionId",
    {
      schema: {
        tags: ["sessions"],
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
