import type { FastifyPluginAsync } from "fastify";
import sessionsRoutes from "./routes.ts";
import {
  createSessionsRepository,
  type SessionsRepository,
} from "./repository.ts";

export type SessionsPluginOptions = {
  sessionsRepository?: SessionsRepository;
};

const sessionsPlugin: FastifyPluginAsync<SessionsPluginOptions> = async (
  fastify,
  options,
) => {
  fastify.decorate(
    "sessionsRepository",
    options.sessionsRepository ?? createSessionsRepository(fastify.db),
  );

  fastify.register(sessionsRoutes);
};

export default sessionsPlugin;
