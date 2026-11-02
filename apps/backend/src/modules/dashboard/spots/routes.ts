import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import {
  GetBestSpotFiltersSchema,
  GetBestSpotResponseSchema,
  GetMostVisitedSpotsFiltersSchema,
  GetMostVisitedSpotsResponseSchema,
} from "@surflog/shared/api-schema/dashboard/DashboardSchema";

const dashboardSpotsRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/most-visited",
    {
      schema: {
        tags: ["dashboard"],
        response: {
          200: GetMostVisitedSpotsResponseSchema.describe(
            "List of up to three most visited spots",
          ),
        },
        querystring: GetMostVisitedSpotsFiltersSchema,
      },
    },
    async function (request, reply) {
      const result = await fastify.spotsDashboardRepository.getMostVisited(
        request.query,
      );

      if (result.success === false) {
        return reply.internalServerError(
          "Failed to retrieve most visited spots",
        );
      }

      return result.data;
    },
  );

  fastify.get(
    "/best-spot",
    {
      schema: {
        tags: ["dashboard"],
        response: {
          200: GetBestSpotResponseSchema.describe("Spot with highest ranking"),
        },
        querystring: GetBestSpotFiltersSchema,
      },
    },
    async function (request, reply) {
      const result = await fastify.spotsDashboardRepository.getBestSpot(
        request.query,
      );

      if (result.success === false) {
        return reply.internalServerError("Failed to retrieve best spot");
      }

      return result.data;
    },
  );
};

export default dashboardSpotsRoutes;
