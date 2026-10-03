import { type FastifyPluginAsync } from "fastify";

const sessionsRoute: FastifyPluginAsync = async (fastify, _opts) => {
  fastify.get("/", async function (_request, _reply) {
    return [];
  });

  fastify.post("/", async function (_request, reply) {
    return reply.status(201).send({ message: "Session created" });
  });

  fastify.get<{
    Params: {
      sessionId: string;
    };
  }>("/:sessionId", function (request, _reply) {
    return {
      id: request.params.sessionId,
    };
  });

  fastify.delete<{
    Params: {
      sessionId: string;
    };
  }>("/:sessionId", function (request, reply) {
    return reply.status(204).send();
  });
};

export default sessionsRoute;
