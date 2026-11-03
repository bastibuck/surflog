import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import {
  GetBestSailsFiltersSchema,
  GetBestSailsResponseSchema,
  GetMostUsedSailsFiltersSchema,
  GetMostUsedSailsResponseSchema,
} from "@surflog/shared/api-schema/stats/StatsSchema";

const statsSailsRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/most-used",
    {
      schema: {
        tags: ["stats"],
        response: {
          200: GetMostUsedSailsResponseSchema.describe(
            "List of up to three most used sails",
          ),
        },
        querystring: GetMostUsedSailsFiltersSchema,
      },
    },
    async function (request, reply) {
      const result = await fastify.sailsStatsRepository.getMostUsed(
        request.query,
      );

      if (result.success === false) {
        return reply.internalServerError("Failed to retrieve most used sails");
      }

      return result.data;
    },
  );

  fastify.get(
    "/top-three",
    {
      schema: {
        tags: ["stats"],
        response: {
          200: GetBestSailsResponseSchema.describe(
            "List of up to three best sails based on session ratings",
          ),
        },
        querystring: GetBestSailsFiltersSchema,
      },
    },
    async function (request, reply) {
      const result = await fastify.sailsStatsRepository.getBestSails(
        request.query,
      );

      if (result.success === false) {
        return reply.internalServerError("Failed to retrieve best sails");
      }

      return result.data;
    },
  );
};

export default statsSailsRoutes;
