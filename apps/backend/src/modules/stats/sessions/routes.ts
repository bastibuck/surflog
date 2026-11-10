import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import {
  GetBestSessionFilterSchema,
  GetBestSessionResponseSchema,
  GetDaysSinceLastSessionResponseSchema,
  GetSessionsAverageRatingFilterSchema,
  GetSessionsAverageRatingResponseSchema,
  GetSessionsCountFilterSchema,
  GetSessionsCountResponseSchema,
} from "@surflog/shared/api-schema/stats/StatsSchema";

const statsSessionsRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/count",
    {
      schema: {
        tags: ["stats"],
        response: {
          200: GetSessionsCountResponseSchema.describe(
            "Total number of sessions",
          ),
        },
        querystring: GetSessionsCountFilterSchema,
      },
    },
    async function (request, reply) {
      const result = await fastify.sessionsStatsRepository.getCount(
        request.query,
      );

      if (result.success === false) {
        return reply.internalServerError("Failed to retrieve session count");
      }

      return result.data;
    },
  );

  fastify.get(
    "/average-rating",
    {
      schema: {
        tags: ["stats"],
        response: {
          200: GetSessionsAverageRatingResponseSchema.describe(
            "Average rating across sessions",
          ),
        },
        querystring: GetSessionsAverageRatingFilterSchema,
      },
    },
    async function (request, reply) {
      const result = await fastify.sessionsStatsRepository.getAverageRating(
        request.query,
      );

      if (result.success === false) {
        return reply.internalServerError(
          "Failed to retrieve average session rating",
        );
      }

      return result.data;
    },
  );

  fastify.get(
    "/best",
    {
      schema: {
        tags: ["stats"],
        response: {
          200: GetBestSessionResponseSchema.describe("Best-rated session"),
        },
        querystring: GetBestSessionFilterSchema,
      },
    },
    async function (request, reply) {
      const result = await fastify.sessionsStatsRepository.getBestSession(
        request.query,
      );

      if (result.success === false) {
        return reply.internalServerError("Failed to retrieve best session");
      }

      return result.data;
    },
  );

  fastify.get(
    "/days-since-last",
    {
      schema: {
        tags: ["stats"],
        response: {
          200: GetDaysSinceLastSessionResponseSchema.describe(
            "Days since last session",
          ),
        },
      },
    },
    async function (request, reply) {
      const result =
        await fastify.sessionsStatsRepository.getDaysSinceLastSession();

      if (result.success === false) {
        return reply.internalServerError(
          "Failed to retrieve days since last session",
        );
      }

      return result.data;
    },
  );
};

export default statsSessionsRoutes;
