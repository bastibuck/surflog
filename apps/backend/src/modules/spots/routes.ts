import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import { GetSpotsListResponseSchema } from "@surflog/shared/api-schema/spots/SpotSchema";

const spotsRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/",
    {
      schema: {
        tags: ["spots"],
        response: {
          200: GetSpotsListResponseSchema.describe("List of spots"),
        },
      },
    },
    async function (request, reply) {
      const result = await fastify.spotsRepository.list();

      if (result.success === false) {
        return reply.internalServerError("Failed to retrieve spots");
      }

      return result.data;
    },
  );
};

export default spotsRoutes;
