import * as assert from "node:assert";
import { describe, test } from "node:test";
import { spotsTable } from "../../../src/modules/spots/models/Spot.model.ts";
import { createSpotsRepository } from "../../../src/modules/spots/repository.ts";

import { buildTestDatabase } from "../../helper.ts";

describe("Module: spots", () => {
  describe("repository", () => {
    test("should list all spots correctly", async (t) => {
      const db = await buildTestDatabase(t, {
        seed: async (db) => {
          await db
            .insert(spotsTable)
            .values([{ name: "Test Spot 2" }, { name: "Test Spot 1" }]);
        },

        reset: async (db) => {
          await db.delete(spotsTable);
        },
      });

      const repo = createSpotsRepository(db);

      const spots = await repo.list();

      assert.strictEqual(spots.success, true);
      assert.strictEqual(spots.data.length, 2);
      assert.strictEqual(spots.data[0].name, "Test Spot 1");
      assert.strictEqual(spots.data[1].name, "Test Spot 2");
    });

    test("should create spot correctly", async (t) => {
      const db = await buildTestDatabase(t, {
        reset: async (db) => {
          await db.delete(spotsTable);
        },
      });

      const repo = createSpotsRepository(db);

      const initialSpots = await repo.list();

      assert.strictEqual(initialSpots.success, true);
      assert.deepEqual(initialSpots.data, []);

      await repo.create({ name: "Test Spot" });

      const spotsAfterCreation = await repo.list();

      assert.strictEqual(spotsAfterCreation.success, true);
      assert.strictEqual(spotsAfterCreation.data.length, 1);
      assert.strictEqual(spotsAfterCreation.data[0].name, "Test Spot");
    });

    test("should reject duplicate spot creation", async (t) => {
      const db = await buildTestDatabase(t, {
        seed: async (db) => {
          await db.insert(spotsTable).values({ name: "Duplication Test Spot" });
        },
        reset: async (db) => {
          await db.delete(spotsTable);
        },
      });

      const repo = createSpotsRepository(db);

      const res = await repo.create({ name: "Duplication Test Spot" });

      assert.strictEqual(res.success, false);
      assert.strictEqual(res.error, "DUPLICATE_ENTRY__spots");
    });
  });
});
