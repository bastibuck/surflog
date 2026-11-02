import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import {
  GetAverageSpotRating,
  GetBestSpotsFiltersSchema,
  GetBestSpotsResponseSchema,
  GetMostVisitedSpotsFiltersSchema,
  GetMostVisitedSpotsResponseSchema,
} from "@surflog/shared/api-schema/stats/StatsSchema";
import z from "zod";

const statsSpotsRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/most-visited",
    {
      schema: {
        tags: ["stats"],
        response: {
          200: GetMostVisitedSpotsResponseSchema.describe(
            "List of up to three most visited spots",
          ),
        },
        querystring: GetMostVisitedSpotsFiltersSchema,
      },
    },
    async function (request, reply) {
      const result = await fastify.spotsStatsRepository.getMostVisited(
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
    "/top-three",
    {
      schema: {
        tags: ["stats"],
        response: {
          200: GetBestSpotsResponseSchema.describe(
            "List of up to three best spots based on session ratings",
          ),
        },
        querystring: GetBestSpotsFiltersSchema,
      },
    },
    async function (request, reply) {
      const result = await fastify.spotsStatsRepository.getBestSpots(
        request.query,
      );

      if (result.success === false) {
        return reply.internalServerError("Failed to retrieve best spots");
      }

      return result.data;
    },
  );

  fastify.get(
    "/average-rating/:spotId",
    {
      schema: {
        tags: ["stats"],
        response: {
          200: GetAverageSpotRating.describe("Average rating for given spot"),
        },
        params: z.object({
          spotId: z.uuid(),
        }),
      },
    },
    async function (request, reply) {
      const result = await fastify.spotsStatsRepository.getAverageSpotRating(
        request.params.spotId,
      );

      if (result.success === false && result.error === "NOT_FOUND__spots") {
        return reply.notFound("Spot not found");
      }

      if (result.success === false) {
        return reply.internalServerError("Failed to retrieve spot rating");
      }

      return result.data;
    },
  );
};

export default statsSpotsRoutes;
