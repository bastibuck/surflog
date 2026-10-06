import fp from "fastify-plugin";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";

declare module "fastify" {
  interface FastifyInstance {
    db: PostgresJsDatabase;
  }
}

export default fp(function drizzlePlugin(fastify, options, done) {
  if (!fastify.db) {
    const db = drizzle(fastify.env.DATABASE_URL);

    fastify.decorate("db", db);
  }

  done();
});
