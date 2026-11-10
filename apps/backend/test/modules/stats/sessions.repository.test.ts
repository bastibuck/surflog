import * as assert from "node:assert";
import { afterEach, beforeEach, describe, test } from "node:test";

import { setupTestDatabase, type TestDb } from "../../helper.ts";

import { brandsTable } from "../../../src/modules/gear/models/Brand.model.ts";
import { sailsTable } from "../../../src/modules/gear/models/Sail.model.ts";
import { sessionsTable } from "../../../src/modules/sessions/models/Session.model.ts";
import { createSessionsStatsRepository } from "../../../src/modules/stats/sessions/repository.ts";
import { spotsTable } from "../../../src/modules/spots/models/Spot.model.ts";

const BRAND = {
  id: "62e976d2-56df-4a23-983f-121b1344d233",
  name: "Gaastra",
};
const SAIL = {
  id: "5a217ca1-7d92-4403-a33f-fa3dc5f5b0e0",
  size: 9,
  brandId: BRAND.id,
  alias: null,
};
const SPOT = {
  id: "c862b734-626b-4029-b2bf-b600d4f7959f",
  name: "Kloster",
};

let currentSessionCount = 0; // used to generate unique session names
const createSession = async (
  testDb: TestDb,
  {
    date = "2026-10-12",
    rating = 10,
  }: {
    date?: string;
    rating?: number;
  } = {},
) => {
  await testDb.insert(sessionsTable).values([
    {
      date,
      spotId: SPOT.id,
      sailId: SAIL.id,
      name: `Session ${currentSessionCount++}`,
      rating,
    },
  ]);
};

describe("Module: stats sessions repository", () => {
  const { getTestDb } = setupTestDatabase();

  beforeEach(async () => {
    const testDb = getTestDb();

    await testDb.insert(brandsTable).values(BRAND);
    await testDb.insert(sailsTable).values(SAIL);
    await testDb.insert(spotsTable).values(SPOT);
  });

  afterEach(async () => {
    const testDb = getTestDb();

    await testDb.delete(sessionsTable);
    await testDb.delete(sailsTable);
    await testDb.delete(brandsTable);
    await testDb.delete(spotsTable);
  });

  describe("sessions count", () => {
    test("returns zero if no sessions exist", async () => {
      const testDb = getTestDb();

      const repo = createSessionsStatsRepository(testDb);

      const result = await repo.getCount();
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data, 0);
    });

    test("returns sessions count correctly", async () => {
      const testDb = getTestDb();

      await createSession(testDb, { date: "2026-10-12" });
      await createSession(testDb, { date: "2026-10-13" });
      await createSession(testDb, { date: "2026-10-14" });
      await createSession(testDb, { date: "2026-10-15" });

      const repo = createSessionsStatsRepository(testDb);

      const result = await repo.getCount();
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data, 4);
    });

    test("returns filtered session counts", async () => {
      const testDb = getTestDb();
      const repo = createSessionsStatsRepository(testDb);

      await createSession(testDb, { date: "2026-10-12" });
      await createSession(testDb, { date: "2026-10-13" });
      await createSession(testDb, { date: "2026-10-14" });
      await createSession(testDb, { date: "2026-10-15" });

      const filteredResult = await repo.getCount({
        from: "2026-10-13",
        to: "2026-10-13",
      });
      assert.strictEqual(filteredResult.success, true);
      assert.strictEqual(filteredResult.data, 1);

      const filteredFrom = await repo.getCount({
        from: "2026-10-13",
      });
      assert.strictEqual(filteredFrom.success, true);
      assert.strictEqual(filteredFrom.data, 3);

      const filteredTo = await repo.getCount({
        to: "2026-10-13",
      });
      assert.strictEqual(filteredTo.success, true);
      assert.strictEqual(filteredTo.data, 2);
    });
  });

  describe("Average session rating", () => {
    test("Should return null if no sessions exist", async () => {
      const testDb = getTestDb();

      const repo = createSessionsStatsRepository(testDb);

      const result = await repo.getAverageRating();
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data, null);
    });

    test("Should return average session rating correctly", async () => {
      const testDb = getTestDb();

      await createSession(testDb, { rating: 10 });
      await createSession(testDb, { rating: 1 });
      await createSession(testDb, { rating: 5 });
      await createSession(testDb, { rating: 7 });

      const repo = createSessionsStatsRepository(testDb);

      const result = await repo.getAverageRating();
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data, 5.75);
    });

    test("Should filter average session rating correctly", async () => {
      const testDb = getTestDb();

      await createSession(testDb, { date: "2026-10-12", rating: 10 });
      await createSession(testDb, { date: "2026-10-13", rating: 1 });
      await createSession(testDb, { date: "2026-10-14", rating: 5 });
      await createSession(testDb, { date: "2026-10-15", rating: 7 });

      const repo = createSessionsStatsRepository(testDb);

      const filteredResult = await repo.getAverageRating({
        from: "2026-10-13",
        to: "2026-10-14",
      });
      assert.strictEqual(filteredResult.success, true);
      assert.strictEqual(filteredResult.data, 3);

      const filteredFromResult = await repo.getAverageRating({
        from: "2026-10-13",
      });
      assert.strictEqual(filteredFromResult.success, true);
      assert.strictEqual(filteredFromResult.data, 4.333333333333333);

      const filteredToResult = await repo.getAverageRating({
        to: "2026-10-13",
      });
      assert.strictEqual(filteredToResult.success, true);
      assert.strictEqual(filteredToResult.data, 5.5);
    });
  });

  describe("Best session", () => {
    test("Should return null if no sessions exist", async () => {
      const testDb = getTestDb();

      const repo = createSessionsStatsRepository(testDb);

      const result = await repo.getBestSession();
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data, null);
    });

    test("Should return highest rated session", async () => {
      const testDb = getTestDb();

      await createSession(testDb, { rating: 1 });
      await createSession(testDb, { rating: 9 });
      await createSession(testDb, { rating: 10 });
      await createSession(testDb, { rating: 6 });
      await createSession(testDb, { rating: 8 });

      const repo = createSessionsStatsRepository(testDb);

      const result = await repo.getBestSession();
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data?.rating, 10);
    });

    test("Should filter highest rated session", async () => {
      const testDb = getTestDb();

      await createSession(testDb, { date: "2026-10-12", rating: 1 });
      await createSession(testDb, { date: "2026-10-13", rating: 9 });
      await createSession(testDb, { date: "2026-10-14", rating: 10 });
      await createSession(testDb, { date: "2026-10-15", rating: 6 });
      await createSession(testDb, { date: "2026-10-16", rating: 8 });

      const repo = createSessionsStatsRepository(testDb);

      const filtered = await repo.getBestSession({
        from: "2026-10-01",
        to: "2026-10-20",
      });
      assert.strictEqual(filtered.success, true);
      assert.strictEqual(filtered.data?.rating, 10);

      const filteredFrom = await repo.getBestSession({
        from: "2026-10-15",
      });
      assert.strictEqual(filteredFrom.success, true);
      assert.strictEqual(filteredFrom.data?.rating, 8);

      const filteredTo = await repo.getBestSession({
        to: "2026-10-13",
      });
      assert.strictEqual(filteredTo.success, true);
      assert.strictEqual(filteredTo.data?.rating, 9);
    });
  });

  describe("Days since last session", () => {
    test("Should return null if no sessions exist", async () => {
      const testDb = getTestDb();

      const repo = createSessionsStatsRepository(testDb);

      const result = await repo.getDaysSinceLastSession();
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data, null);
    });

    test("Should return days since last session", async () => {
      const testDb = getTestDb();

      const today = new Date();

      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(today.getDate() - 3);
      const fiveDaysAgo = new Date(today);
      fiveDaysAgo.setDate(today.getDate() - 5);

      await createSession(testDb, {
        date: sevenDaysAgo.toISOString(),
      });
      await createSession(testDb, {
        date: fiveDaysAgo.toISOString(),
      });
      await createSession(testDb, {
        date: threeDaysAgo.toISOString(),
      });

      const repo = createSessionsStatsRepository(testDb);

      const result = await repo.getDaysSinceLastSession();
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data, 3);
    });
  });
});
