import { type FastifyPluginCallback } from "fastify";

const rootRoute: FastifyPluginCallback = (fastify, _opts) => {
  fastify.get("/", function (_request, _reply) {
    return { alive: true };
  });
};

export default rootRoute;
