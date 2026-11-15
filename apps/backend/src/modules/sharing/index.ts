import type { FastifyPluginAsync } from "fastify";
import sessionSharesRoutes from "./routes.ts";
import {
  createSessionSharesRepository,
  type SessionSharesRepository,
} from "./repository.ts";

export type SharingPluginOptions = {
  sessionSharesRepository?: SessionSharesRepository;
};

declare module "fastify" {
  interface FastifyInstance {
    sessionSharesRepository: SessionSharesRepository;
  }
}

const sharingPlugin: FastifyPluginAsync<SharingPluginOptions> = async (
  fastify,
  options,
) => {
  fastify.decorate(
    "sessionSharesRepository",
    options.sessionSharesRepository ??
      createSessionSharesRepository(fastify.db),
  );

  fastify.register(sessionSharesRoutes);
};

export default sharingPlugin;
