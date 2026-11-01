import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import {
  GetMostUsedSailsFiltersSchema,
  GetMostUsedSailsResponseSchema,
} from "@surflog/shared/api-schema/dashboard/DashboardSchema";

const gearRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/most-used",
    {
      schema: {
        tags: ["dashboard", "sails"],
        response: {
          200: GetMostUsedSailsResponseSchema.describe(
            "List of up to three most used sails",
          ),
        },
        querystring: GetMostUsedSailsFiltersSchema,
      },
    },
    async function (request, reply) {
      const result = await fastify.sailsDashboardRepository.getMostUsed(
        request.query,
      );

      if (result.success === false) {
        return reply.internalServerError("Failed to retrieve most used sails");
      }

      return result.data;
    },
  );
};

export default gearRoutes;
