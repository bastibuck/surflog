import type { FastifyPluginAsync } from "fastify";
import spotsRoutes from "./routes.ts";
import { createSpotsRepository, type SpotsRepository } from "./repository.ts";

export type SpotsPluginOptions = {
  spotsRepository?: SpotsRepository;
};

declare module "fastify" {
  interface FastifyInstance {
    spotsRepository: SpotsRepository;
  }
}

const spotsPlugin: FastifyPluginAsync<SpotsPluginOptions> = async (
  fastify,
  options,
) => {
  fastify.decorate(
    "spotsRepository",
    options.spotsRepository ?? createSpotsRepository(fastify.db),
  );

  fastify.register(spotsRoutes);
};

export default spotsPlugin;
