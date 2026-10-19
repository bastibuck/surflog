import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import {
  CreateSpotPayloadSchema,
  GetSpotsListResponseSchema,
} from "@surflog/shared/api-schema/spots/SpotSchema";
import z from "zod";

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

  fastify.post(
    "/",
    {
      schema: {
        tags: ["spots"],
        body: CreateSpotPayloadSchema,
        response: {
          201: z.undefined().describe("Spot created"),
        },
      },
    },
    async function (request, reply) {
      const result = await fastify.spotsRepository.create(request.body);

      if (
        result.success === false &&
        result.error === "DUPLICATE_ENTRY__spots"
      ) {
        return reply.conflict("Spot already exists");
      }

      if (result.success === false) {
        return reply.internalServerError("Failed to retrieve spots");
      }

      return reply.status(201).send();
    },
  );
};

export default spotsRoutes;
