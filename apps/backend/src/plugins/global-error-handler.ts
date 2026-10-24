import fp from "fastify-plugin";

export default fp(function setupGlobalErrorHandler(fastify, options, done) {
  fastify.setErrorHandler(function (error: any, request, reply) {
    if (error.validation || error instanceof fastify.httpErrors.HttpError) {
      return reply.send(error);
    }

    fastify.log.error({ err: error }, "unhandled error");

    reply.internalServerError("Internal Server Error").send();
  });

  done();
});
