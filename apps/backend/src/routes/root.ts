import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import z from "zod";

const rootRoute: FastifyPluginAsyncZod = async (fastify, _opts) => {
  fastify.get(
    "/",
    {
      schema: {
        tags: ["system"],
        response: {
          200: z
            .object({
              alive: z.boolean(),
            })
            .describe("Health check response"),
        },
      },
    },
    function (_request, _reply) {
      return { alive: true };
    },
  );
};

export default rootRoute;
