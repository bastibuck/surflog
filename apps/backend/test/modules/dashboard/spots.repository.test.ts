import * as assert from "node:assert";
import { afterEach, beforeEach, describe, test } from "node:test";

import { setupTestDatabase, type TestDb } from "../../helper.ts";

import { brandsTable } from "../../../src/modules/gear/models/Brand.model.ts";
import { sailsTable } from "../../../src/modules/gear/models/Sail.model.ts";
import { createSpotsDashboardRepository } from "../../../src/modules/dashboard/spots/repository.ts";
import { sessionsTable } from "../../../src/modules/sessions/models/Session.model.ts";
import { spotsTable } from "../../../src/modules/spots/models/Spot.model.ts";

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
];

const SPOTS = [
  { id: "c862b734-626b-4029-b2bf-b600d4f7959f", name: "Kloster" },
  { id: "b5611ef0-9783-4f20-9e99-79096ee474ac", name: "Hanstholm" },
  { id: "362d6516-08bc-4fa9-8be3-7d0f0fb4dc73", name: "Tarifa" },
  { id: "3d20e5f8-f05c-4405-a61c-442be8824dd3", name: "Zandvoort" },
];

let currentSessionCount = 0; // used to generate unique session names
const createSessionForSpot = async (
  testDb: TestDb,
  spotId: string,
  date: string = "2026-10-12",
) => {
  await testDb.insert(sessionsTable).values([
    {
      date,
      spotId,
      sailId: SAILS[0].id,
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
    describe("Most visited spots", () => {
      test("should return an empty array if there are no sessions", async () => {
        const testDb = getTestDb();

        const repo = createSpotsDashboardRepository(testDb);

        const result = await repo.getMostVisited();

        assert.strictEqual(result.success, true);
        assert.deepStrictEqual(result.data, []);
      });

      test("should return an empty array if there are no spots", async () => {
        const testDb = getTestDb();

        await testDb.delete(spotsTable);

        const repo = createSpotsDashboardRepository(testDb);

        const result = await repo.getMostVisited();

        assert.strictEqual(result.success, true);
        assert.deepStrictEqual(result.data, []);
      });

      test("should return correct top-three order", async () => {
        const testDb = getTestDb();

        await createSessionForSpot(testDb, SPOTS[0].id);
        await createSessionForSpot(testDb, SPOTS[0].id);
        await createSessionForSpot(testDb, SPOTS[0].id);

        await createSessionForSpot(testDb, SPOTS[1].id);
        await createSessionForSpot(testDb, SPOTS[1].id);

        await createSessionForSpot(testDb, SPOTS[2].id);

        await createSessionForSpot(testDb, SPOTS[3].id);
        await createSessionForSpot(testDb, SPOTS[3].id);
        await createSessionForSpot(testDb, SPOTS[3].id);
        await createSessionForSpot(testDb, SPOTS[3].id);
        await createSessionForSpot(testDb, SPOTS[3].id);

        const repo = createSpotsDashboardRepository(testDb);

        const result = await repo.getMostVisited();

        assert.strictEqual(result.success, true);
        assert.deepStrictEqual(result.data, [
          {
            id: SPOTS[3].id,
            name: "Zandvoort",
            count: 5,
          },
          {
            id: SPOTS[0].id,
            name: "Kloster",
            count: 3,
          },
          {
            id: SPOTS[1].id,
            name: "Hanstholm",
            count: 2,
          },
        ]);
      });

      test("should ignore spots with zero sessions", async () => {
        const testDb = getTestDb();

        await createSessionForSpot(testDb, SPOTS[1].id);
        await createSessionForSpot(testDb, SPOTS[1].id);
        await createSessionForSpot(testDb, SPOTS[1].id);

        const repo = createSpotsDashboardRepository(testDb);

        const result = await repo.getMostVisited();

        assert.strictEqual(result.success, true);
        assert.deepStrictEqual(result.data, [
          {
            id: SPOTS[1].id,
            name: "Hanstholm",
            count: 3,
          },
        ]);
      });

      test("should sort by name ASC as the tie-breaker", async () => {
        const testDb = getTestDb();

        await createSessionForSpot(testDb, SPOTS[0].id);
        await createSessionForSpot(testDb, SPOTS[0].id);

        await createSessionForSpot(testDb, SPOTS[1].id);
        await createSessionForSpot(testDb, SPOTS[1].id);

        await createSessionForSpot(testDb, SPOTS[2].id);
        await createSessionForSpot(testDb, SPOTS[2].id);

        await createSessionForSpot(testDb, SPOTS[3].id);
        await createSessionForSpot(testDb, SPOTS[3].id);

        const repo = createSpotsDashboardRepository(testDb);

        const result = await repo.getMostVisited();

        assert.strictEqual(result.success, true);
        assert.deepStrictEqual(result.data, [
          {
            id: SPOTS[1].id,
            name: "Hanstholm",
            count: 2,
          },
          {
            id: SPOTS[0].id,
            name: "Kloster",
            count: 2,
          },
          {
            id: SPOTS[2].id,
            name: "Tarifa",
            count: 2,
          },
        ]);
      });

      test("should filter by date correctly", async () => {
        const testDb = getTestDb();

        await createSessionForSpot(testDb, SPOTS[1].id, "2026-10-10");
        await createSessionForSpot(testDb, SPOTS[1].id, "2026-10-11");
        await createSessionForSpot(testDb, SPOTS[0].id, "2026-10-12");
        await createSessionForSpot(testDb, SPOTS[0].id, "2026-10-13");
        await createSessionForSpot(testDb, SPOTS[1].id, "2026-10-14");
        await createSessionForSpot(testDb, SPOTS[1].id, "2026-10-15");

        const repo = createSpotsDashboardRepository(testDb);

        const notFiltered = await repo.getMostVisited();
        assert.strictEqual(notFiltered.success, true);
        assert.deepStrictEqual(notFiltered.data, [
          {
            id: SPOTS[1].id,
            name: "Hanstholm",
            count: 4,
          },
          {
            id: SPOTS[0].id,
            name: "Kloster",
            count: 2,
          },
        ]);

        const filteredFrom = await repo.getMostVisited({ from: "2026-10-13" });
        assert.strictEqual(filteredFrom.success, true);
        assert.deepStrictEqual(filteredFrom.data, [
          {
            id: SPOTS[1].id,
            name: "Hanstholm",
            count: 2,
          },
          {
            id: SPOTS[0].id,
            name: "Kloster",
            count: 1,
          },
        ]);

        const filteredTo = await repo.getMostVisited({ to: "2026-10-13" });
        assert.strictEqual(filteredTo.success, true);
        assert.deepStrictEqual(filteredTo.data, [
          {
            id: SPOTS[1].id,
            name: "Hanstholm",
            count: 2,
          },
          {
            id: SPOTS[0].id,
            name: "Kloster",
            count: 2,
          },
        ]);

        const filteredFromAndTo = await repo.getMostVisited({
          from: "2026-10-13",
          to: "2026-10-14",
        });
        assert.strictEqual(filteredFromAndTo.success, true);
        assert.deepStrictEqual(filteredFromAndTo.data, [
          {
            id: SPOTS[1].id,
            name: "Hanstholm",
            count: 1,
          },
          {
            id: SPOTS[0].id,
            name: "Kloster",
            count: 1,
          },
        ]);
      });
    });
  });
});
