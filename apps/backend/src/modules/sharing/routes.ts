import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import {
  CreateSessionShareResponseSchema,
  GetSharedSessionResponseSchema,
} from "@surflog/shared/api-schema/sharing/SessionShareSchema";
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

      const shareLink = new URL(
        `/sharing/sessions/${result.data}`,
        fastify.env.FRONTEND_URL,
      );

      return reply.status(201).send({
        shareLink: shareLink.toString(),
      });
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

  fastify.get(
    "/sessions/:shareId",
    {
      schema: {
        tags: ["sharing"],
        params: z.object({
          shareId: z.uuid(),
        }),
        response: {
          200: GetSharedSessionResponseSchema.describe(
            "Shared session response",
          ),
        },
      },
    },
    async function (request, reply) {
      const result = await fastify.sessionSharesRepository.viewSharedSession(
        request.params.shareId,
      );

      if (
        result.success === false &&
        result.error === "NOT_FOUND__session_shares"
      ) {
        return reply.notFound("Session not found or expired");
      }

      if (result.success === false) {
        return reply.internalServerError("Failed to view shared session");
      }

      if (
        result.data.success === false &&
        result.data.error === "NOT_FOUND__sessions"
      ) {
        return reply.notFound("Session not found or expired");
      }

      if (result.data.success === false) {
        return reply.internalServerError("Failed to view shared session");
      }

      return reply.status(200).send(result.data.data);
    },
  );
};

export default sessionSharesRoutes;
