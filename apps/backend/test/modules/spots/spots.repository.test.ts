import * as assert from "node:assert";
import { afterEach, describe, test } from "node:test";
import { createSpotsRepository } from "../../../src/modules/spots/repository.ts";

import { spotsTable } from "../../../src/modules/spots/models/Spot.model.ts";
import { setupTestDatabase } from "../../helper.ts";

describe("Module: spots", () => {
  const { getTestDb } = setupTestDatabase();

  describe("repository", () => {
    afterEach(async () => {
      const testDb = getTestDb();

      await testDb.delete(spotsTable);
    });

    test("should list all spots correctly", async () => {
      const testDb = getTestDb();

      await testDb
        .insert(spotsTable)
        .values([{ name: "Test Spot 2" }, { name: "Test Spot 1" }]);

      const repo = createSpotsRepository(testDb);

      const spots = await repo.list();

      assert.strictEqual(spots.success, true);
      assert.strictEqual(spots.data.length, 2);
      assert.strictEqual(spots.data[0].name, "Test Spot 1");
      assert.strictEqual(spots.data[1].name, "Test Spot 2");
    });

    test("should create spot correctly", async () => {
      const testDb = getTestDb();

      const repo = createSpotsRepository(testDb);

      const initialSpots = await repo.list();

      assert.strictEqual(initialSpots.success, true);
      assert.deepEqual(initialSpots.data, []);

      await repo.create({ name: "Test Spot" });

      const spotsAfterCreation = await repo.list();

      assert.strictEqual(spotsAfterCreation.success, true);
      assert.strictEqual(spotsAfterCreation.data.length, 1);
      assert.strictEqual(spotsAfterCreation.data[0].name, "Test Spot");
    });

    test("should reject duplicate spot creation", async () => {
      const testDb = getTestDb();

      await testDb.insert(spotsTable).values({ name: "Duplication Test Spot" });

      const repo = createSpotsRepository(testDb);

      const res = await repo.create({ name: "Duplication Test Spot" });

      assert.strictEqual(res.success, false);
      assert.strictEqual(res.error, "DUPLICATE_ENTRY__spots");
    });
  });
});
