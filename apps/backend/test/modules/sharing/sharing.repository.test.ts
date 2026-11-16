import * as assert from "node:assert";
import { afterEach, beforeEach, describe, test } from "node:test";

import { setupTestDatabase } from "../../helper.ts";

import { brandsTable } from "../../../src/modules/gear/models/Brand.model.ts";
import { sailsTable } from "../../../src/modules/gear/models/Sail.model.ts";
import { sessionsTable } from "../../../src/modules/sessions/models/Session.model.ts";
import { sessionSharesTable } from "../../../src/modules/sharing/models/SessionShare.model.ts";
import { createSessionSharesRepository } from "../../../src/modules/sharing/repository.ts";
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
const SESSION = {
  id: "9d411ee6-8c08-45b8-9e42-b29c2723980a",
  date: "2026-10-12",
  spotId: SPOT.id,
  sailId: SAIL.id,
  name: "Super session",
  rating: 10,
  notes: null,
};

describe("Module: sharing repository", () => {
  const { getTestDb } = setupTestDatabase();

  beforeEach(async () => {
    const testDb = getTestDb();

    await testDb.insert(brandsTable).values(BRAND);
    await testDb.insert(sailsTable).values(SAIL);
    await testDb.insert(spotsTable).values(SPOT);
    await testDb.insert(sessionsTable).values(SESSION);
  });

  afterEach(async () => {
    const testDb = getTestDb();

    await testDb.delete(sessionsTable);
    await testDb.delete(sailsTable);
    await testDb.delete(brandsTable);
    await testDb.delete(spotsTable);
  });

  test("creates a share for a session", async () => {
    const testDb = getTestDb();
    const repo = createSessionSharesRepository(testDb);

    const result = await repo.create(SESSION.id);

    assert.strictEqual(result.success, true);
    if (!result.success) return;

    assert.match(
      result.data,
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );

    const share = await testDb.query.session_shares.findFirst({
      where: { sessionId: SESSION.id },
    });
    assert.strictEqual(share?.id, result.data);
    assert.ok(share.expiresAt > new Date());
  });

  test("rotates an existing share and renews its expiry", async () => {
    const testDb = getTestDb();

    const oldShareId = "5e28a5e9-1ee2-4cbd-ad61-9c9827680adf";

    await testDb.insert(sessionSharesTable).values({
      id: oldShareId,
      sessionId: SESSION.id,
      expiresAt: new Date(Date.now() - 1000),
    });

    const repo = createSessionSharesRepository(testDb);

    const result = await repo.create(SESSION.id);

    assert.strictEqual(result.success, true);
    assert.notStrictEqual(result.data, oldShareId);

    const share = await testDb.query.session_shares.findFirst({
      where: { sessionId: SESSION.id },
    });

    assert.strictEqual(share?.id, result.data);
    assert.ok(share.expiresAt > new Date());
  });

  test("revokes a share link for a session", async () => {
    const testDb = getTestDb();

    await testDb.insert(sessionSharesTable).values({
      id: "5e28a5e9-1ee2-4cbd-ad61-9c9827680adf",
      sessionId: SESSION.id,
    });

    const repo = createSessionSharesRepository(testDb);

    const result = await repo.delete(SESSION.id);

    assert.strictEqual(result.success, true);

    const share = await testDb.query.session_shares.findFirst({
      where: { sessionId: SESSION.id },
    });
    assert.strictEqual(share, undefined);
  });

  test("returns the session associated with a valid share link", async () => {
    const testDb = getTestDb();

    const shareId = "5e28a5e9-1ee2-4cbd-ad61-9c9827680adf";

    await testDb.insert(sessionSharesTable).values({
      id: shareId,
      sessionId: SESSION.id,
    });

    const repo = createSessionSharesRepository(testDb);

    const result = await repo.viewSharedSession(shareId);

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data.success, true);
    assert.strictEqual(result.data.data.id, SESSION.id);
    assert.strictEqual(result.data.data.name, SESSION.name);
    assert.strictEqual(result.data.data.date, SESSION.date);
    assert.strictEqual(result.data.data.rating, SESSION.rating);
    assert.strictEqual(result.data.data.notes, SESSION.notes);
    assert.strictEqual(result.data.data.spot, SPOT.name);
    assert.strictEqual(result.data.data.sail, "Gaastra 9");
  });

  test("does not return expired or unknown share links", async () => {
    const testDb = getTestDb();

    const expiredShareId = "5e28a5e9-1ee2-4cbd-ad61-9c9827680adf";

    await testDb.insert(sessionSharesTable).values({
      id: expiredShareId,
      sessionId: SESSION.id,
      expiresAt: new Date(Date.now() - 1000),
    });

    const repo = createSessionSharesRepository(testDb);

    const expiredResult = await repo.viewSharedSession(expiredShareId);
    const unknownResult = await repo.viewSharedSession(
      "2f53dc19-5318-46ae-a66e-3c45ef0c606a",
    );

    assert.deepStrictEqual(expiredResult, {
      success: false,
      error: "NOT_FOUND__session_shares",
    });
    assert.deepStrictEqual(unknownResult, {
      success: false,
      error: "NOT_FOUND__session_shares",
    });
  });
});
