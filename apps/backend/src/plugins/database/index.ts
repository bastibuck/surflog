import fp from "fastify-plugin";
import postgres from "postgres";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { relations } from "./schema.ts";

declare module "fastify" {
  interface FastifyInstance {
    db: PostgresJsDatabase<typeof relations>;
  }
}

export default fp(function databasePlugin(fastify, options, done) {
  if (!fastify.db) {
    const client = postgres(fastify.env.DATABASE_URL, {
      ssl: fastify.env.DATABASE_SSL === "disable" ? false : "require",
      max: 1,
    });

    const db = drizzle({ client, relations });

    fastify.decorate("db", db);
    fastify.addHook("onClose", async () => {
      await db.$client.end();
    });
  }

  done();
});
