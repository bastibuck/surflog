import type { FastifyPluginAsync } from "fastify";
import sessionsStatsRoutes from "./routes.ts";
import {
  createSessionsStatsRepository,
  type SessionsStatsRepository,
} from "./repository.ts";

export type SessionsStatsPluginOptions = {
  sessionsStatsRepository?: SessionsStatsRepository;
};

declare module "fastify" {
  interface FastifyInstance {
    sessionsStatsRepository: SessionsStatsRepository;
  }
}

const sessionsStatsPlugin: FastifyPluginAsync<
  SessionsStatsPluginOptions
> = async (fastify, options) => {
  fastify.decorate(
    "sessionsStatsRepository",
    options.sessionsStatsRepository ??
      createSessionsStatsRepository(fastify.db),
  );

  fastify.register(sessionsStatsRoutes);
};

export default sessionsStatsPlugin;
