import helper from "fastify-cli/helper.js";
import path from "node:path";
import * as test from "node:test";
import { fileURLToPath } from "node:url";

import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/postgres-js";
import { readdir, readFile } from "node:fs/promises";
import type { AppOptions } from "../src/app.ts";
import { relations } from "../src/plugins/database/schema.ts";

export type TestContext = {
  after: typeof test.after;
};

const AppPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
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

const createTestDbClient = (connectionUri: string) => {
  return drizzle(connectionUri, { relations });
};

export type TestDb = ReturnType<typeof createTestDbClient>;

function setupTestDatabase() {
  let postgresContainer: StartedPostgreSqlContainer;
  let testDb: TestDb;

  test.before(async () => {
    postgresContainer = await new PostgreSqlContainer(
      "postgres:latest",
    ).start();

    testDb = createTestDbClient(postgresContainer.getConnectionUri());

    // setup roles required for migrations to work (this is a manual step because the used supabase DB would need it and set it up automatically)
    const roles = [
      "anon",
      "authenticated",
      "postgres",
      "service_role",
    ] as const;

    for (const role of roles) {
      await testDb.execute(`CREATE ROLE ${role}`);
    }

    // apply migrations
    const migrationDirectory = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
      "supabase",
      "migrations",
    );
    const migrationFiles = await readdir(migrationDirectory);

    for (const migrationFile of migrationFiles) {
      const migration = await readFile(
        path.join(migrationDirectory, migrationFile),
      );
      await testDb.execute(migration.toString());
    }

    return testDb;
  });

  test.after(async () => {
    await testDb.$client.end();
    await postgresContainer.stop();
  });

  return {
    getTestDb: () => testDb,
  };
}

export { build, config, setupTestDatabase };
