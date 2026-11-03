import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import {
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
};

export default statsSessionsRoutes;
