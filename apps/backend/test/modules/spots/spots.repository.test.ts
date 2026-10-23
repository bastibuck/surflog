import { drizzle } from "drizzle-orm/postgres-js";
import * as assert from "node:assert";
import { after, afterEach, before, describe, test } from "node:test";
import { relations } from "../../../src/plugins/database/schema.ts";
import { spotsTable } from "../../../src/modules/spots/models/Spot.model.ts";
import {
  createSpotsRepository,
  type SpotsRepository,
} from "../../../src/modules/spots/repository.ts";

import dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });

const createTestDatabase = () => {
  return drizzle(process.env.DATABASE_URL!, { relations });
};

type TestDB = ReturnType<typeof createTestDatabase>;

describe("Module: spots", () => {
  let db: TestDB | undefined;
  let repo: SpotsRepository | undefined;

  before(() => {
    db = createTestDatabase();
    repo = createSpotsRepository(db);
  });

  afterEach(async () => {
    await db?.delete(spotsTable);
  });

  after(async () => {
    await db?.$client.end();
  });

  describe("repository", () => {
    test("should list all spots correctly", async (_t) => {
      await db?.insert(spotsTable).values({ name: "Test Spot 1" });
      await db?.insert(spotsTable).values({ name: "Test Spot 2" });

      const spots = await repo!.list();

      assert.strictEqual(spots.success, true);
      assert.strictEqual(spots.data.length, 2);
      assert.strictEqual(spots.data[0].name, "Test Spot 1");
      assert.strictEqual(spots.data[1].name, "Test Spot 2");
    });

    test.only("should create spot correctly", async (_t) => {
      const repo = createSpotsRepository(db!);

      const initialSpots = await repo.list();

      assert.strictEqual(initialSpots.success, true);
      assert.deepEqual(initialSpots.data, []);

      await repo.create({ name: "Test Spot" });

      const spotsAfterCreation = await repo.list();

      assert.strictEqual(spotsAfterCreation.success, true);
      assert.strictEqual(spotsAfterCreation.data.length, 1);
      assert.strictEqual(spotsAfterCreation.data[0].name, "Test Spot");
    });

    test("should reject duplicate spot creation", async (_t) => {
      const repo = createSpotsRepository(db!);

      await repo.create({ name: "Test Spot" });
      const res = await repo.create({ name: "Test Spot" });

      assert.strictEqual(res.success, false);
      assert.strictEqual(res.error, "DUPLICATE_ENTRY__spots");
    });
  });
});
