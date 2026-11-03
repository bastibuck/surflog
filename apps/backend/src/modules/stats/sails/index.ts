import type { FastifyPluginAsync } from "fastify";
import sailsStatsRoutes from "./routes.ts";
import {
  createSailsStatsRepository,
  type SailsStatsRepository,
} from "./repository.ts";

export type SailsStatsPluginOptions = {
  sailsStatsRepository?: SailsStatsRepository;
};

declare module "fastify" {
  interface FastifyInstance {
    sailsStatsRepository: SailsStatsRepository;
  }
}

const sailsStatsPlugin: FastifyPluginAsync<SailsStatsPluginOptions> = async (
  fastify,
  options,
) => {
  fastify.decorate(
    "sailsStatsRepository",
    options.sailsStatsRepository ?? createSailsStatsRepository(fastify.db),
  );

  fastify.register(sailsStatsRoutes);
};

export default sailsStatsPlugin;
