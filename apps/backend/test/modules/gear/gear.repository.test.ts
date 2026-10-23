import * as assert from "node:assert";
import { describe, test } from "node:test";

import { brandsTable } from "../../../src/modules/gear/models/Brand.model.ts";
import { createGearRepository } from "../../../src/modules/gear/repository.ts";
import { buildTestDatabase } from "../../helper.ts";
import { sailsTable } from "../../../src/modules/gear/models/Sail.model.ts";

describe("Module: gear", () => {
  describe("repository", () => {
    test("should list all brands correctly", async (t) => {
      const db = await buildTestDatabase(t, {
        seed: async (db) => {
          await db
            .insert(brandsTable)
            .values([{ name: "Gaastra" }, { name: "Duotone" }]);
        },

        reset: async (db) => {
          await db.delete(sailsTable);
          await db.delete(brandsTable);
        },
      });

      const repo = createGearRepository(db);

      const brands = await repo.listBrands();

      assert.strictEqual(brands.success, true);
      assert.strictEqual(brands.data.length, 2);
      assert.strictEqual(brands.data[0].name, "Duotone");
      assert.strictEqual(brands.data[1].name, "Gaastra");
    });

    test("should list all sails correctly", async (t) => {
      const db = await buildTestDatabase(t, {
        seed: async (db) => {
          const gaastraBrand = await db
            .insert(brandsTable)
            .values({ name: "Gaastra" })
            .returning({ id: brandsTable.id });

          const duotoneBrand = await db
            .insert(brandsTable)
            .values({ name: "Duotone" })
            .returning({ id: brandsTable.id });

          await db.insert(sailsTable).values([
            { brandId: gaastraBrand[0].id, size: 9, alias: "Gaastra 9" },
            { brandId: gaastraBrand[0].id, size: 7, alias: "Gaastra 7" },
            { brandId: duotoneBrand[0].id, size: 9, alias: "Duotone 9" },
          ]);
        },

        reset: async (db) => {
          await db.delete(sailsTable);
          await db.delete(brandsTable);
        },
      });

      const repo = createGearRepository(db);

      const brands = await repo.listSails();

      assert.strictEqual(brands.success, true);
      assert.strictEqual(brands.data.length, 3);
      assert.strictEqual(brands.data[0].size, 7);
      assert.strictEqual(brands.data[0].brand, "Gaastra");
      assert.strictEqual(brands.data[0].alias, "Gaastra 7");

      assert.strictEqual(brands.data[1].size, 9);
      assert.strictEqual(brands.data[1].brand, "Duotone");
      assert.strictEqual(brands.data[1].alias, "Duotone 9");

      assert.strictEqual(brands.data[2].size, 9);
      assert.strictEqual(brands.data[2].brand, "Gaastra");
      assert.strictEqual(brands.data[2].alias, "Gaastra 9");
    });
  });
});
