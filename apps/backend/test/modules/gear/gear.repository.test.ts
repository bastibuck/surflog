import * as assert from "node:assert";
import { afterEach, describe, test } from "node:test";

import { setupTestDatabase } from "../../helper.ts";

import { brandsTable } from "../../../src/modules/gear/models/Brand.model.ts";
import { sailsTable } from "../../../src/modules/gear/models/Sail.model.ts";
import { createGearRepository } from "../../../src/modules/gear/repository.ts";

describe("Module: gear", () => {
  const { getTestDb } = setupTestDatabase();

  afterEach(async () => {
    const testDb = getTestDb();

    await testDb.delete(sailsTable);
    await testDb.delete(brandsTable);
  });

  describe("repository", () => {
    test("should list all brands correctly", async () => {
      const testDb = getTestDb();

      await testDb
        .insert(brandsTable)
        .values([{ name: "Gaastra" }, { name: "Duotone" }]);

      const repo = createGearRepository(testDb);

      const brands = await repo.listBrands();

      assert.strictEqual(brands.success, true);
      assert.strictEqual(brands.data.length, 2);
      assert.strictEqual(brands.data[0].name, "Duotone");
      assert.strictEqual(brands.data[1].name, "Gaastra");
    });

    test("should list all sails correctly", async () => {
      const testDb = getTestDb();

      const gaastraBrand = await testDb
        .insert(brandsTable)
        .values({ name: "Gaastra" })
        .returning({ id: brandsTable.id });

      const duotoneBrand = await testDb
        .insert(brandsTable)
        .values({ name: "Duotone" })
        .returning({ id: brandsTable.id });

      await testDb.insert(sailsTable).values([
        { brandId: gaastraBrand[0].id, size: 9, alias: "Gaastra 9" },
        { brandId: gaastraBrand[0].id, size: 7, alias: "Gaastra 7" },
        { brandId: duotoneBrand[0].id, size: 9, alias: "Duotone 9" },
      ]);

      const repo = createGearRepository(testDb);

      const sails = await repo.listSails();

      assert.strictEqual(sails.success, true);
      assert.strictEqual(sails.data.length, 3);
      assert.strictEqual(sails.data[0].size, 7);
      assert.strictEqual(sails.data[0].brand, "Gaastra");
      assert.strictEqual(sails.data[0].alias, "Gaastra 7");

      assert.strictEqual(sails.data[1].size, 9);
      assert.strictEqual(sails.data[1].brand, "Duotone");
      assert.strictEqual(sails.data[1].alias, "Duotone 9");

      assert.strictEqual(sails.data[2].size, 9);
      assert.strictEqual(sails.data[2].brand, "Gaastra");
      assert.strictEqual(sails.data[2].alias, "Gaastra 9");
    });
  });
});
