import * as assert from "node:assert";
import { afterEach, beforeEach, describe, test } from "node:test";
import z from "zod";

import { setupTestDatabase } from "../../helper.ts";

import { brandsTable } from "../../../src/modules/gear/models/Brand.model.ts";
import { sailsTable } from "../../../src/modules/gear/models/Sail.model.ts";
import { sessionsTable } from "../../../src/modules/sessions/models/Session.model.ts";
import { spotsTable } from "../../../src/modules/spots/models/Spot.model.ts";
import { createSessionsRepository } from "../../../src/modules/sessions/repository.ts";

const BRANDS = [
  { id: "62e976d2-56df-4a23-983f-121b1344d233", name: "Gaastra" },
  { id: "83321f76-cb04-41f0-ae29-6743b3d56780", name: "Duotone" },
];

const SAILS = [
  {
    id: "5a217ca1-7d92-4403-a33f-fa3dc5f5b0e0",
    size: 9,
    brandId: BRANDS[1].id,
    alias: null,
  },
];

const SPOTS = [
  {
    id: "c862b734-626b-4029-b2bf-b600d4f7959f",
    name: "Kloster",
  },
];

describe("Module: sessions", () => {
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
    test("should list all sessions correctly", async () => {
      const testDb = getTestDb();

      await testDb.insert(sessionsTable).values([
        {
          id: "9d411ee6-8c08-45b8-9e42-b29c2723980a",
          date: "2026-10-12",
          spotId: SPOTS[0].id,
          sailId: SAILS[0].id,
          name: "Super session 1",
          rating: 10,
        },
        {
          id: "5bb856bc-5531-45d6-aeb3-3c043d48a040",
          date: "2026-06-01",
          spotId: SPOTS[0].id,
          sailId: SAILS[0].id,
          name: "Sessions numero dos",
          rating: 7,
        },
      ]);

      const repo = createSessionsRepository(testDb);

      const sessions = await repo.list();

      assert.strictEqual(sessions.success, true);
      assert.strictEqual(sessions.data.length, 2);
      assert.strictEqual(
        sessions.data[0].id,
        "9d411ee6-8c08-45b8-9e42-b29c2723980a",
      );
      assert.strictEqual(sessions.data[0].name, "Super session 1");
      assert.strictEqual(sessions.data[0].date, "2026-10-12");
      assert.strictEqual(
        sessions.data[1].id,
        "5bb856bc-5531-45d6-aeb3-3c043d48a040",
      );
      assert.strictEqual(sessions.data[1].name, "Sessions numero dos");
      assert.strictEqual(sessions.data[1].date, "2026-06-01");
    });

    test("should return an empty list if no sessions exist", async () => {
      const testDb = getTestDb();

      const repo = createSessionsRepository(testDb);

      const sessions = await repo.list();

      assert.strictEqual(sessions.success, true);
      assert.strictEqual(sessions.data.length, 0);
    });

    test("should find a session by id correctly", async () => {
      const testDb = getTestDb();

      await testDb.insert(sessionsTable).values({
        id: "9d411ee6-8c08-45b8-9e42-b29c2723980a",
        date: "2026-10-12",
        spotId: SPOTS[0].id,
        sailId: SAILS[0].id,
        name: "Super session 1",
        rating: 10,
      });

      const repo = createSessionsRepository(testDb);

      const session = await repo.findById(
        "9d411ee6-8c08-45b8-9e42-b29c2723980a",
      );

      assert.strictEqual(session.success, true);
      assert.strictEqual(
        session.data.id,
        "9d411ee6-8c08-45b8-9e42-b29c2723980a",
      );
      assert.strictEqual(session.data.name, "Super session 1");
      assert.strictEqual(session.data.date, "2026-10-12");
      assert.strictEqual(session.data.notes, null);
      assert.strictEqual(session.data.rating, 10);
      assert.deepEqual(session.data.spot, {
        name: SPOTS[0].name,
      });
      assert.deepEqual(session.data.sail, {
        size: SAILS[0].size,
        brand: BRANDS[1].name,
        alias: null,
      });
    });

    test("should return an error if session does not exist", async () => {
      const testDb = getTestDb();

      const repo = createSessionsRepository(testDb);

      const session = await repo.findById(
        "9d411ee6-8c08-45b8-9e42-b29c2723980a",
      );

      assert.strictEqual(session.success, false);
      assert.strictEqual(session.error, "NOT_FOUND__sessions");
    });

    test("should create a session correctly", async () => {
      const testDb = getTestDb();

      const repo = createSessionsRepository(testDb);

      const createResult = await repo.create({
        date: "2026-10-12",
        name: "Super session 1",
        rating: 10,
        notes: "This is a test session",
        sail: {
          action: "reference",
          id: SAILS[0].id,
        },
        spot: {
          action: "reference",
          id: SPOTS[0].id,
        },
      });

      assert.strictEqual(createResult.success, true);
      assert.strictEqual(
        z.uuid().safeParse(createResult.data.id).success,
        true,
      );
    });

    test("should create a session with inline spot and sail creation correctly", async () => {
      const testDb = getTestDb();

      const repo = createSessionsRepository(testDb);

      const createResult = await repo.create({
        date: "2026-10-12",
        name: "Super session 1",
        rating: 10,
        notes: "This is a test session",
        sail: {
          action: "create",
          size: 9,
          alias: "My new sail",
          brand: {
            action: "create",
            name: "North Sails",
          },
        },
        spot: {
          action: "create",
          name: "New Spot",
        },
      });

      assert.strictEqual(createResult.success, true);
      assert.strictEqual(
        z.uuid().safeParse(createResult.data.id).success,
        true,
      );

      const session = await testDb.query.sessions.findFirst({
        where: {
          id: createResult.data.id,
        },
        with: {
          spot: true,
          sail: {
            with: {
              brand: true,
            },
          },
        },
      });

      assert.strictEqual(session?.spot.name, "New Spot");
      assert.strictEqual(session?.sail.size, 9);
      assert.strictEqual(session?.sail.alias, "My new sail");
      assert.strictEqual(session?.sail.brand.name, "North Sails");
    });

    test("should prevent creating a session duplicate", async () => {
      const testDb = getTestDb();

      await testDb.insert(sessionsTable).values({
        id: "9d411ee6-8c08-45b8-9e42-b29c2723980a",
        date: "2026-10-12",
        spotId: SPOTS[0].id,
        sailId: SAILS[0].id,
        name: "Super session 1",
        rating: 10,
      });

      const repo = createSessionsRepository(testDb);

      const createResult = await repo.create({
        date: "2026-10-12",
        name: "Super session 1",
        rating: 10,
        notes: "This is a test session",
        sail: {
          action: "reference",
          id: SAILS[0].id,
        },
        spot: {
          action: "reference",
          id: SPOTS[0].id,
        },
      });

      assert.strictEqual(createResult.success, false);
      assert.strictEqual(createResult.error, "DUPLICATE_ENTRY__sessions");
    });

    test("should prevent session with an invalid rating", async () => {
      const testDb = getTestDb();

      const repo = createSessionsRepository(testDb);

      const invalidRatings = [-1, 0, 11, 100];

      for (const rating of invalidRatings) {
        const createResult = await repo.create({
          date: "2026-10-12",
          name: "Super session 1",
          rating: rating,
          notes: "This is a test session",
          sail: {
            action: "reference",
            id: SAILS[0].id,
          },
          spot: {
            action: "reference",
            id: SPOTS[0].id,
          },
        });

        assert.strictEqual(createResult.success, false);
        assert.strictEqual(
          createResult.error,
          "CONSTRAINT_VIOLATION__sessions_rating_check",
        );
      }
    });

    test("should prevent sail with an invalid size", async () => {
      const testDb = getTestDb();

      const repo = createSessionsRepository(testDb);

      const createResult = await repo.create({
        date: "2026-10-12",
        name: "Super session 1",
        rating: 2,
        notes: "This is a test session",
        sail: {
          action: "create",
          size: -5,
          alias: "My new sail",
          brand: {
            action: "reference",
            id: BRANDS[0].id,
          },
        },
        spot: {
          action: "reference",
          id: SPOTS[0].id,
        },
      });

      assert.strictEqual(createResult.success, false);
      assert.strictEqual(
        createResult.error,
        "CONSTRAINT_VIOLATION__sail_size_check",
      );
    });

    test("rolls back earlier creations when a later error occurs", async () => {
      const testDb = getTestDb();

      await testDb.insert(sessionsTable).values({
        id: "9d411ee6-8c08-45b8-9e42-b29c2723980a",
        date: "2026-10-12",
        spotId: SPOTS[0].id,
        sailId: SAILS[0].id,
        name: "Super session 1",
        rating: 10,
      });

      const repo = createSessionsRepository(testDb);

      const createResult = await repo.create({
        date: "2026-10-12",
        name: "Super session 1",
        rating: 10,
        notes: "This is a test session",
        sail: {
          action: "create",
          size: 9,
          alias: "My sail alias",
          brand: {
            action: "create",
            name: "North Sails",
          },
        },
        spot: {
          action: "create",
          name: "Gold",
        },
      });

      assert.strictEqual(createResult.success, false);
      assert.strictEqual(createResult.error, "DUPLICATE_ENTRY__sessions");

      const spots = await testDb.query.spots.findMany({
        where: {
          name: "Gold",
        },
      });

      assert.strictEqual(spots.length, 0);

      const brands = await testDb.query.brands.findMany({
        where: {
          name: "North Sails",
        },
      });

      assert.strictEqual(brands.length, 0);

      const sails = await testDb.query.sails.findMany({
        where: {
          alias: "My sail alias",
        },
      });

      assert.strictEqual(sails.length, 0);
    });

    test("should prevent creating a spot duplicate", async () => {
      const testDb = getTestDb();

      const repo = createSessionsRepository(testDb);

      const createResult = await repo.create({
        date: "2026-10-12",
        name: "Super session 1",
        rating: 10,
        notes: "This is a test session",
        sail: {
          action: "reference",
          id: SAILS[0].id,
        },
        spot: {
          action: "create",
          name: "kloster", // lowercased does not work either
        },
      });

      assert.strictEqual(createResult.success, false);
      assert.strictEqual(createResult.error, "DUPLICATE_ENTRY__spots");
    });

    test("should prevent creating a brand duplicate", async () => {
      const testDb = getTestDb();

      const repo = createSessionsRepository(testDb);

      const createResult = await repo.create({
        date: "2026-10-12",
        name: "Super session 1",
        rating: 10,
        notes: "This is a test session",
        sail: {
          action: "create",
          size: 9,
          alias: "My new sail",
          brand: {
            action: "create",
            name: "gaastra", // lowercased does not work either
          },
        },
        spot: {
          action: "reference",
          id: SPOTS[0].id,
        },
      });

      assert.strictEqual(createResult.success, false);
      assert.strictEqual(createResult.error, "DUPLICATE_ENTRY__brands");
    });

    test("should prevent creating a duplicate sail", async () => {
      const testDb = getTestDb();

      const repo = createSessionsRepository(testDb);

      const createResult = await repo.create({
        date: "2026-10-12",
        name: "Super session 1",
        rating: 10,
        notes: "This is a test session",
        sail: {
          action: "create",
          size: SAILS[0].size,
          alias: SAILS[0].alias,
          brand: {
            action: "reference",
            id: SAILS[0].brandId,
          },
        },
        spot: {
          action: "reference",
          id: SPOTS[0].id,
        },
      });

      assert.strictEqual(createResult.success, false);
      assert.strictEqual(createResult.error, "DUPLICATE_ENTRY__sails");
    });

    test("should return an error on a not found spot", async () => {
      const testDb = getTestDb();

      const repo = createSessionsRepository(testDb);

      const createResult = await repo.create({
        date: "2026-10-12",
        name: "Super session 1",
        rating: 10,
        notes: "This is a test session",
        sail: {
          action: "reference",
          id: SAILS[0].id,
        },
        spot: {
          action: "reference",
          id: "c6549647-b74c-4d0e-8f9f-5efd853c3017", // not found
        },
      });

      assert.strictEqual(createResult.success, false);
      assert.strictEqual(createResult.error, "NOT_FOUND__spots");
    });

    test("should return an error on a not found sail", async () => {
      const testDb = getTestDb();

      const repo = createSessionsRepository(testDb);

      const createResult = await repo.create({
        date: "2026-10-12",
        name: "Super session 1",
        rating: 10,
        notes: "This is a test session",
        sail: {
          action: "reference",
          id: "c6549647-b74c-4d0e-8f9f-5efd853c3017", // not found
        },
        spot: {
          action: "reference",
          id: SPOTS[0].id,
        },
      });

      assert.strictEqual(createResult.success, false);
      assert.strictEqual(createResult.error, "NOT_FOUND__sails");
    });

    test("should return an error on a not found brand", async () => {
      const testDb = getTestDb();

      const repo = createSessionsRepository(testDb);

      const createResult = await repo.create({
        date: "2026-10-12",
        name: "Super session 1",
        rating: 10,
        notes: "This is a test session",
        sail: {
          action: "create",
          size: 9,
          alias: "My new sail",
          brand: {
            action: "reference",
            id: "c6549647-b74c-4d0e-8f9f-5efd853c3017", // not found
          },
        },
        spot: {
          action: "reference",
          id: SPOTS[0].id,
        },
      });

      assert.strictEqual(createResult.success, false);
      assert.strictEqual(createResult.error, "NOT_FOUND__brands");
    });

    test("should delete a sessions by id correctly", async () => {
      const testDb = getTestDb();

      await testDb.insert(sessionsTable).values({
        id: "9d411ee6-8c08-45b8-9e42-b29c2723980a",
        date: "2026-10-12",
        spotId: SPOTS[0].id,
        sailId: SAILS[0].id,
        name: "Super session 1",
        rating: 10,
      });

      const repo = createSessionsRepository(testDb);

      const deleteResult = await repo.delete(
        "9d411ee6-8c08-45b8-9e42-b29c2723980a",
      );

      assert.strictEqual(deleteResult.success, true);

      const session = await testDb.query.sessions.findFirst({
        where: {
          id: "9d411ee6-8c08-45b8-9e42-b29c2723980a",
        },
      });

      assert.strictEqual(session, undefined);
    });
  });
});
