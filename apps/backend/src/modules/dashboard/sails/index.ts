import type { FastifyPluginAsync } from "fastify";
import sailsDashboardRoutes from "./routes.ts";
import {
  createSailsDashboardRepository,
  type SailsDashboardRepository,
} from "./repository.ts";

export type SailsDashboardPluginOptions = {
  sailsDashboardRepository?: SailsDashboardRepository;
};

declare module "fastify" {
  interface FastifyInstance {
    sailsDashboardRepository: SailsDashboardRepository;
  }
}

const sailsDashboardPlugin: FastifyPluginAsync<
  SailsDashboardPluginOptions
> = async (fastify, options) => {
  fastify.decorate(
    "sailsDashboardRepository",
    options.sailsDashboardRepository ??
      createSailsDashboardRepository(fastify.db),
  );

  fastify.register(sailsDashboardRoutes);
};

export default sailsDashboardPlugin;
