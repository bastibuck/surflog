import type { FastifyPluginAsync } from "fastify";
import spotsStatsRoutes from "./routes.ts";
import {
  createSpotsStatsRepository,
  type SpotsStatsRepository,
} from "./repository.ts";

export type SpotsStatsPluginOptions = {
  spotsStatsRepository?: SpotsStatsRepository;
};

declare module "fastify" {
  interface FastifyInstance {
    spotsStatsRepository: SpotsStatsRepository;
  }
}

const spotsStatsPlugin: FastifyPluginAsync<SpotsStatsPluginOptions> = async (
  fastify,
  options,
) => {
  fastify.decorate(
    "spotsStatsRepository",
    options.spotsStatsRepository ?? createSpotsStatsRepository(fastify.db),
  );

  fastify.register(spotsStatsRoutes);
};

export default spotsStatsPlugin;
