import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import { GetBrandListResponseSchema } from "@surflog/shared/api-schema/gear/BrandSchema";
import { GetSailListResponseSchema } from "@surflog/shared/api-schema/gear/SailSchema";

const gearRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/sails",
    {
      schema: {
        tags: ["gear"],
        response: {
          200: GetSailListResponseSchema.describe("List of sails"),
        },
      },
    },
    async function (request, reply) {
      const result = await fastify.gearRepository.listSails();

      if (result.success === false) {
        return reply.internalServerError("Failed to retrieve sails");
      }

      return result.data;
    },
  );

  fastify.get(
    "/brands",
    {
      schema: {
        tags: ["gear"],
        response: {
          200: GetBrandListResponseSchema.describe("List of brands"),
        },
      },
    },
    async function (request, reply) {
      const result = await fastify.gearRepository.listBrands();

      if (result.success === false) {
        return reply.internalServerError("Failed to retrieve brands");
      }

      return result.data;
    },
  );
};

export default gearRoutes;
