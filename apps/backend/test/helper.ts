import { dirname, join } from "node:path";
import * as test from "node:test";
import { fileURLToPath } from "node:url";
import helper from "fastify-cli/helper.js";

import dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });

import type { AppOptions } from "../src/app.ts";
import { drizzle } from "drizzle-orm/postgres-js";
import { relations } from "../src/plugins/database/schema.ts";

export type TestContext = {
  after: typeof test.after;
};

const AppPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "app.ts",
);

// Fill in this config with all the configurations
// needed for testing the application
function config() {
  return {
    skipOverride: true, // Register our application with fastify-plugin
  };
}

// Automatically build and tear down our instance
async function build(t: TestContext, options: AppOptions = {}) {
  // you can set all the options supported by the fastify CLI command
  const argv = [AppPath];

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  const app = await helper.build(argv, {
    ...config(),
    ...options,
  });

  // Tear down our app after we are done
  // eslint-disable-next-line no-void
  t.after(async () => {
    await app.close();
  });

  return app;
}

const createTestDatabase = () => {
  return drizzle(process.env.DATABASE_URL!, { relations });
};

export type TestDB = ReturnType<typeof createTestDatabase>;

type DatabaseTestOptions = {
  seed?: (db: TestDB) => Promise<void> | void;
  reset?: (db: TestDB) => Promise<void> | void;
};

async function buildTestDatabase(
  t: TestContext,
  options: DatabaseTestOptions = {},
): Promise<TestDB> {
  const db = createTestDatabase();

  const seed = options.seed ?? (async () => {});
  const reset = options.reset ?? (async () => {});

  t.after(async () => {
    try {
      await reset(db);
    } finally {
      await db.$client.end();
    }
  });

  await reset(db); // reset the database before seeding to ensure a clean state
  await seed(db);

  return db;
}

export { config, build, buildTestDatabase };
