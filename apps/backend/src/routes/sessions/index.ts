import { type FastifyPluginAsync } from "fastify";

const sessionsRoot: FastifyPluginAsync = async (fastify, _opts) => {
  fastify.get("/", async function (_request, _reply) {
    return [];
  });

  fastify.post("/", async function (_request, reply) {
    return reply.status(201).send({ message: "Session created" });
  });

  fastify.get("/:sessionId", function (request, _reply) {
    return {
      id: (request.params as any).sessionId,
    };
  });

  fastify.delete("/:sessionId", function (_request, reply) {
    return reply.status(204).send();
  });
};

export default sessionsRoot;
