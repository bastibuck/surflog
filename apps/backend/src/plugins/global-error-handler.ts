import { hasZodFastifySchemaValidationErrors } from "@fastify/type-provider-zod";
import fp from "fastify-plugin";

export default fp(function setupGlobalErrorHandler(fastify, options, done) {
  fastify.setErrorHandler(function (error: any, request, reply) {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: `Invalid ${error.validationContext}; see details.`,
        details: {
          issues: error.validation.map(({ instancePath, message }) => ({
            path: instancePath || "/",
            message,
          })),
        },
      });
    }

    if (error instanceof fastify.httpErrors.HttpError) {
      return reply.send(error);
    }

    fastify.log.error({ err: error }, "unhandled error");

    reply.internalServerError("Internal Server Error").send();
  });

  done();
});
