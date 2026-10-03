import { type FastifyPluginAsync } from "fastify";

const root: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get("/", async function (_request, _reply) {
    return "Marketing Site for Surflog - The ultimate surf tracking app!";
  });
};

export default root;
