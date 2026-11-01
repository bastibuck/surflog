import type { FastifyPluginAsync } from "fastify";
import spotsDashboardRoutes from "./routes.ts";
import {
  createSpotsDashboardRepository,
  type SpotsDashboardRepository,
} from "./repository.ts";

export type SpotsDashboardPluginOptions = {
  spotsDashboardRepository?: SpotsDashboardRepository;
};

declare module "fastify" {
  interface FastifyInstance {
    spotsDashboardRepository: SpotsDashboardRepository;
  }
}

const spotsDashboardPlugin: FastifyPluginAsync<
  SpotsDashboardPluginOptions
> = async (fastify, options) => {
  fastify.decorate(
    "spotsDashboardRepository",
    options.spotsDashboardRepository ??
      createSpotsDashboardRepository(fastify.db),
  );

  fastify.register(spotsDashboardRoutes);
};

export default spotsDashboardPlugin;
