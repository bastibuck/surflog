import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import {
  CreateSessionPayloadSchema,
  GetSessionResponseSchema,
  GetSessionsListResponseSchema,
} from "@surflog/shared/api-schema/sessions/SessionSchema";
import { z } from "zod";

// TODOs
// - [ ] generate named migration
// - [ ] add tests for the sessions routes and DB

const sessionsRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/",
    {
      schema: {
        tags: ["sessions"],
        response: {
          200: GetSessionsListResponseSchema.describe("List of sessions"),
        },
      },
    },
    async function (request, reply) {
      const result = await fastify.sessionsRepository.list();

      if (result.success === false) {
        return reply.internalServerError("Failed to retrieve sessions").send();
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
          200: GetSessionResponseSchema.describe("Session details"),
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

      if (result.success === false && result.error === "NOT_FOUND__sessions") {
        return reply.notFound("Session not found");
      }

      if (result.success === false) {
        return reply.internalServerError("Failed to retrieve session");
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
        response: {
          201: z.undefined().describe("Session created"),
        },
      },
    },
    async function (request, reply) {
      const result = await fastify.sessionsRepository.create(request.body);

      if (result.success === false && result.error === "NOT_FOUND__brands") {
        return reply.notFound("Brand not found");
      }

      if (
        result.success === false &&
        result.error === "DUPLICATE_ENTRY__brands"
      ) {
        return reply.conflict("Brand already exists");
      }

      if (result.success === false && result.error === "NOT_FOUND__sails") {
        return reply.notFound("Sail not found");
      }

      if (
        result.success === false &&
        result.error === "DUPLICATE_ENTRY__sails"
      ) {
        return reply.conflict("Sail already exists");
      }

      if (result.success === false && result.error === "NOT_FOUND__spots") {
        return reply.notFound("Spot not found");
      }

      if (
        result.success === false &&
        result.error === "DUPLICATE_ENTRY__spots"
      ) {
        return reply.conflict("Spot already exists");
      }

      if (
        result.success === false &&
        result.error === "DUPLICATE_ENTRY__sessions"
      ) {
        return reply.conflict(
          "Session with the same name on that day already exists",
        );
      }

      if (result.success === false) {
        return reply.internalServerError("Failed to retrieve session");
      }

      return reply.status(201).send();
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
        response: {
          204: z.undefined().describe("Session deleted"),
        },
      },
    },
    async function (request, reply) {
      await fastify.sessionsRepository.delete(request.params.sessionId);

      return reply.status(204).send();
    },
  );
};

export default sessionsRoutes;
