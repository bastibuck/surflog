import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { jsonSchemaTransform } from "@fastify/type-provider-zod";
import fp from "fastify-plugin";

export default fp(function docsPlugin(fastify, options, done) {
  fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: "SurfLog Backend API",
        version: "1.0.0",
      },
      openapi: "3.1.0",
    },
    transform: jsonSchemaTransform,
  });

  fastify.register(fastifySwaggerUi, {
    routePrefix: "/docs",
  });

  done();
});
