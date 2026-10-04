import type { FastifyPluginAsync } from "fastify";
import sessionsRoutes from "./routes.ts";

const sessionsPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.register(sessionsRoutes, { prefix: "/sessions" });
};

export default sessionsPlugin;
