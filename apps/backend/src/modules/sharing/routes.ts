import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import { CreateSessionShareResponseSchema } from "@surflog/shared/api-schema/sharing/SessionShareSchema";
import { z } from "zod";

const sessionSharesRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    "/sessions/:sessionId/create",
    {
      schema: {
        tags: ["sharing"],
        response: {
          201: CreateSessionShareResponseSchema.describe(
            "Session share link created",
          ),
        },
        params: z.object({
          sessionId: z.uuid(),
        }),
      },
    },
    async function (request, reply) {
      const result = await fastify.sessionSharesRepository.create(
        request.params.sessionId,
      );

      if (result.success === false) {
        return reply.internalServerError("Failed to create session share link");
      }

      return reply.status(201).send(result.data);
    },
  );

  fastify.delete(
    "/sessions/:sessionId/revoke",
    {
      schema: {
        tags: ["sharing"],
        params: z.object({
          sessionId: z.uuid(),
        }),
        response: {
          204: z.undefined().describe("Session share link revoked"),
        },
      },
    },
    async function (request, reply) {
      const result = await fastify.sessionSharesRepository.delete(
        request.params.sessionId,
      );

      if (result.success === false) {
        return reply.internalServerError("Failed to revoke session share link");
      }

      return reply.status(204).send();
    },
  );
};

export default sessionSharesRoutes;
