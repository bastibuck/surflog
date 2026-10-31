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
  });
});
