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
        { brandId: gaastraBrand[0].id, size: 9 },
        { brandId: gaastraBrand[0].id, size: 7, alias: "My alias" },
        { brandId: duotoneBrand[0].id, size: 9 },
        { brandId: gaastraBrand[0].id, size: 7, alias: "Custom alias" },
      ]);

      const repo = createGearRepository(testDb);

      const sails = await repo.listSails();

      assert.strictEqual(sails.success, true);
      assert.strictEqual(sails.data.length, 4);
      assert.strictEqual(sails.data[0].displayName, "Duotone 9");
      assert.strictEqual(sails.data[1].displayName, "Gaastra 7 | Custom alias");
      assert.strictEqual(sails.data[2].displayName, "Gaastra 7 | My alias");
      assert.strictEqual(sails.data[3].displayName, "Gaastra 9");
    });
  });
});
