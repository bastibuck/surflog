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
const createSession = async (testDb: TestDb, date: string = "2026-10-12") => {
  await testDb.insert(sessionsTable).values([
    {
      date,
      spotId: SPOT.id,
      sailId: SAIL.id,
      name: `Session ${currentSessionCount++}`,
      rating: 10,
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

  test("returns total and date-filtered session counts", async () => {
    const testDb = getTestDb();
    const repo = createSessionsStatsRepository(testDb);

    const emptyResult = await repo.getCount();
    assert.strictEqual(emptyResult.success, true);
    assert.strictEqual(emptyResult.data, 0);

    await createSession(testDb, "2026-10-12");
    await createSession(testDb, "2026-10-13");
    await createSession(testDb, "2026-10-14");
    await createSession(testDb, "2026-10-15");

    const result = await repo.getCount();
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data, 4);

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
