import * as assert from "node:assert";
import { afterEach, beforeEach, describe, test } from "node:test";

import { setupTestDatabase, type TestDb } from "../../helper.ts";

import { brandsTable } from "../../../src/modules/gear/models/Brand.model.ts";
import { sailsTable } from "../../../src/modules/gear/models/Sail.model.ts";
import { createSailsDashboardRepository } from "../../../src/modules/dashboard/sails/repository.ts";
import { spotsTable } from "../../../src/modules/spots/models/Spot.model.ts";
import { sessionsTable } from "../../../src/modules/sessions/models/Session.model.ts";

const BRANDS = [
  { id: "62e976d2-56df-4a23-983f-121b1344d233", name: "Gaastra" },
];

const SAILS = [
  {
    id: "5a217ca1-7d92-4403-a33f-fa3dc5f5b0e0",
    size: 9,
    brandId: BRANDS[0].id,
    alias: null,
  },
  {
    id: "f1b44c0f-6f19-4d0b-b3c2-8a8a429f5fd3",
    size: 11,
    brandId: BRANDS[0].id,
    alias: null,
  },
  {
    id: "76ec507f-d011-4781-bf71-181c40f201a9",
    size: 17,
    brandId: BRANDS[0].id,
    alias: null,
  },
  {
    id: "8b3d0e59-0507-4c86-bce5-0142ac41cafa",
    size: 13,
    brandId: BRANDS[0].id,
    alias: null,
  },
];

const SPOTS = [
  {
    id: "c862b734-626b-4029-b2bf-b600d4f7959f",
    name: "Kloster",
  },
];

let currentSessionCount = 0; // used to generate unique session names
const createSessionForSail = async (
  testDb: TestDb,
  sailId: string,
  date: string = "2026-10-12",
) => {
  await testDb.insert(sessionsTable).values([
    {
      date,
      spotId: SPOTS[0].id,
      sailId,
      name: `Session ${currentSessionCount++}`,
      rating: 10,
    },
  ]);
};

describe("Module: dashboard", () => {
  const { getTestDb } = setupTestDatabase();

  beforeEach(async () => {
    const testDb = getTestDb();

    await testDb.insert(brandsTable).values(BRANDS);
    await testDb.insert(sailsTable).values(SAILS);
    await testDb.insert(spotsTable).values(SPOTS);
  });

  afterEach(async () => {
    const testDb = getTestDb();

    await testDb.delete(sessionsTable);
    await testDb.delete(sailsTable);
    await testDb.delete(brandsTable);
    await testDb.delete(spotsTable);
  });

  describe("repository", () => {
    describe("Most used sails", () => {
      test("should return an empty array if there are no sessions", async () => {
        const testDb = getTestDb();

        const repo = createSailsDashboardRepository(testDb);

        const result = await repo.getMostUsed();

        assert.strictEqual(result.success, true);
        assert.deepStrictEqual(result.data, []);
      });

      test("should return an empty array if there are no sails", async () => {
        const testDb = getTestDb();

        await testDb.delete(sailsTable);

        const repo = createSailsDashboardRepository(testDb);

        const result = await repo.getMostUsed();

        assert.strictEqual(result.success, true);
        assert.deepStrictEqual(result.data, []);
      });

      test("should return correct top-three order", async () => {
        const testDb = getTestDb();

        await createSessionForSail(testDb, SAILS[0].id);
        await createSessionForSail(testDb, SAILS[0].id);
        await createSessionForSail(testDb, SAILS[0].id);

        await createSessionForSail(testDb, SAILS[1].id);
        await createSessionForSail(testDb, SAILS[1].id);

        await createSessionForSail(testDb, SAILS[2].id);

        await createSessionForSail(testDb, SAILS[3].id);
        await createSessionForSail(testDb, SAILS[3].id);
        await createSessionForSail(testDb, SAILS[3].id);
        await createSessionForSail(testDb, SAILS[3].id);
        await createSessionForSail(testDb, SAILS[3].id);

        const repo = createSailsDashboardRepository(testDb);

        const result = await repo.getMostUsed();

        assert.strictEqual(result.success, true);
        assert.deepStrictEqual(result.data, [
          {
            id: SAILS[3].id,
            displayName: "Gaastra 13",
            count: 5,
          },
          {
            id: SAILS[0].id,
            displayName: "Gaastra 9",
            count: 3,
          },
          {
            id: SAILS[1].id,
            displayName: "Gaastra 11",
            count: 2,
          },
        ]);
      });

      test("should ignore sails with zero sessions", async () => {
        const testDb = getTestDb();

        await createSessionForSail(testDb, SAILS[1].id);
        await createSessionForSail(testDb, SAILS[1].id);
        await createSessionForSail(testDb, SAILS[1].id);

        const repo = createSailsDashboardRepository(testDb);

        const result = await repo.getMostUsed();

        assert.strictEqual(result.success, true);
        assert.deepStrictEqual(result.data, [
          {
            id: SAILS[1].id,
            displayName: "Gaastra 11",
            count: 3,
          },
        ]);
      });

      test("should sort by size ASC as the tie-breaker", async () => {
        const testDb = getTestDb();

        await createSessionForSail(testDb, SAILS[0].id);
        await createSessionForSail(testDb, SAILS[0].id);

        await createSessionForSail(testDb, SAILS[1].id);
        await createSessionForSail(testDb, SAILS[1].id);

        await createSessionForSail(testDb, SAILS[2].id);
        await createSessionForSail(testDb, SAILS[2].id);

        await createSessionForSail(testDb, SAILS[3].id);
        await createSessionForSail(testDb, SAILS[3].id);

        const repo = createSailsDashboardRepository(testDb);

        const result = await repo.getMostUsed();

        assert.strictEqual(result.success, true);
        assert.deepStrictEqual(result.data, [
          {
            id: SAILS[0].id,
            displayName: "Gaastra 9",
            count: 2,
          },
          {
            id: SAILS[1].id,
            displayName: "Gaastra 11",
            count: 2,
          },
          {
            id: SAILS[3].id,
            displayName: "Gaastra 13",
            count: 2,
          },
        ]);
      });

      test("should filter by date correctly", async () => {
        const testDb = getTestDb();

        await createSessionForSail(testDb, SAILS[0].id, "2026-10-10");
        await createSessionForSail(testDb, SAILS[0].id, "2026-10-11");
        await createSessionForSail(testDb, SAILS[1].id, "2026-10-12");
        await createSessionForSail(testDb, SAILS[1].id, "2026-10-13");
        await createSessionForSail(testDb, SAILS[0].id, "2026-10-14");
        await createSessionForSail(testDb, SAILS[0].id, "2026-10-15");

        const repo = createSailsDashboardRepository(testDb);

        const notFiltered = await repo.getMostUsed();
        assert.strictEqual(notFiltered.success, true);
        assert.deepStrictEqual(notFiltered.data, [
          {
            id: SAILS[0].id,
            displayName: "Gaastra 9",
            count: 4,
          },
          {
            id: SAILS[1].id,
            displayName: "Gaastra 11",
            count: 2,
          },
        ]);

        const filteredFrom = await repo.getMostUsed({ from: "2026-10-13" });
        assert.strictEqual(filteredFrom.success, true);
        assert.deepStrictEqual(filteredFrom.data, [
          {
            id: SAILS[0].id,
            displayName: "Gaastra 9",
            count: 2,
          },
          {
            id: SAILS[1].id,
            displayName: "Gaastra 11",
            count: 1,
          },
        ]);

        const filteredTo = await repo.getMostUsed({ to: "2026-10-13" });
        assert.strictEqual(filteredTo.success, true);
        assert.deepStrictEqual(filteredTo.data, [
          {
            id: SAILS[0].id,
            displayName: "Gaastra 9",
            count: 2,
          },
          {
            id: SAILS[1].id,
            displayName: "Gaastra 11",
            count: 2,
          },
        ]);

        const frilteredFromAndTo = await repo.getMostUsed({
          from: "2026-10-13",
          to: "2026-10-14",
        });
        assert.strictEqual(frilteredFromAndTo.success, true);
        assert.deepStrictEqual(frilteredFromAndTo.data, [
          {
            id: SAILS[0].id,
            displayName: "Gaastra 9",
            count: 1,
          },
          {
            id: SAILS[1].id,
            displayName: "Gaastra 11",
            count: 1,
          },
        ]);
      });
    });
  });
});
