import Fastify from "fastify";
import app from "./fastify-app.ts";

const fastify = Fastify({ logger: true });

fastify.register(app);

fastify.listen({ port: 3000 });
