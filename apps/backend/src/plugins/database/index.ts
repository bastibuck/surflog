import fp from "fastify-plugin";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { relations } from "./schema.ts";

declare module "fastify" {
  interface FastifyInstance {
    db: PostgresJsDatabase<typeof relations>;
  }
}

export default fp(function databasePlugin(fastify, options, done) {
  if (!fastify.db) {
    const db = drizzle(fastify.env.DATABASE_URL, { relations });

    fastify.decorate("db", db);
    fastify.addHook("onClose", async () => {
      await db.$client.end();
    });
  }

  done();
});
