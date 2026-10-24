import type { FastifyPluginAsync } from "fastify";
import gearRoutes from "./routes.ts";
import { createGearRepository, type GearRepository } from "./repository.ts";

export type GearPluginOptions = {
  gearRepository?: GearRepository;
};

declare module "fastify" {
  interface FastifyInstance {
    gearRepository: GearRepository;
  }
}

const gearPlugin: FastifyPluginAsync<GearPluginOptions> = async (
  fastify,
  options,
) => {
  fastify.decorate(
    "gearRepository",
    options.gearRepository ?? createGearRepository(fastify.db),
  );

  fastify.register(gearRoutes);
};

export default gearPlugin;
