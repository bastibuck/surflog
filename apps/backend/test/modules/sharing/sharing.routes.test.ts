import * as assert from "node:assert";
import { describe, test } from "node:test";

import { failure, success } from "../../../src/lib/typed-result.ts";
import type { SessionSharesRepository } from "../../../src/modules/sharing/repository.ts";
import { build } from "../../helper.ts";

const SESSION_ID = "9d411ee6-8c08-45b8-9e42-b29c2723980a";
const SHARE_ID = "5e28a5e9-1ee2-4cbd-ad61-9c9827680adf";
const SHARED_SESSION = {
  id: SESSION_ID,
  name: "Super session",
  date: "2026-10-12",
  rating: 10,
  notes: "A great day on the water",
  spot: "Kloster",
  sail: "Gaastra 9",
  shareTokenPreview: "5e28...0adf",
};

const fakeSessionSharesRepository = {
  create: async (_sessionId: string) => success(SHARE_ID),
  delete: async (_sessionId: string) => success(undefined),
  viewSharedSession: async (_shareId: string) =>
    success(success(SHARED_SESSION)), // uses nested sessions repository to find session
} satisfies SessionSharesRepository;

describe("Module: sharing routes", () => {
  describe("POST /sharing/sessions/:sessionId/create", () => {
    test("creates and returns a share link for the requested session", async (t) => {
      const app = await build(t, {
        sessionSharesRepository: {
          ...fakeSessionSharesRepository,
          create: async (sessionId) => {
            assert.strictEqual(sessionId, SESSION_ID);
            return success(SHARE_ID);
          },
        },
      });

      const res = await app.inject({
        method: "POST",
        url: `/sharing/sessions/${SESSION_ID}/create`,
      });

      assert.strictEqual(res.statusCode, 201);
      const { shareLink } = JSON.parse(res.payload);
      const parsedShareLink = new URL(shareLink);
      assert.strictEqual(
        parsedShareLink.pathname,
        `/sharing/sessions/${SHARE_ID}`,
      );
    });

    test("returns 500 if the repository cannot create the share link", async (t) => {
      const app = await build(t, {
        sessionSharesRepository: {
          ...fakeSessionSharesRepository,
          // @ts-expect-error unsupported return type to simulate an unknown error
          create: async (_sessionId: string) => failure("UNKNOWN"),
        },
      });

      const res = await app.inject({
        method: "POST",
        url: `/sharing/sessions/${SESSION_ID}/create`,
      });

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(
        JSON.parse(res.payload).message,
        "Failed to create session share link",
      );
    });
  });

  describe("DELETE /sharing/sessions/:sessionId/revoke", () => {
    test("revokes the share link for the requested session", async (t) => {
      const app = await build(t, {
        sessionSharesRepository: {
          ...fakeSessionSharesRepository,
          delete: async (sessionId) => {
            assert.strictEqual(sessionId, SESSION_ID);
            return success(undefined);
          },
        },
      });

      const res = await app.inject({
        method: "DELETE",
        url: `/sharing/sessions/${SESSION_ID}/revoke`,
      });

      assert.strictEqual(res.statusCode, 204);
    });

    test("returns 500 if the repository cannot revoke the share link", async (t) => {
      const app = await build(t, {
        sessionSharesRepository: {
          ...fakeSessionSharesRepository,
          // @ts-expect-error unsupported return type to simulate an unknown error
          delete: async (_sessionId: string) => failure("UNKNOWN"),
        },
      });

      const res = await app.inject({
        method: "DELETE",
        url: `/sharing/sessions/${SESSION_ID}/revoke`,
      });

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(
        JSON.parse(res.payload).message,
        "Failed to revoke session share link",
      );
    });
  });

  describe("GET /sharing/sessions/:shareId", () => {
    test("returns the session associated with a share link", async (t) => {
      const app = await build(t, {
        sessionSharesRepository: {
          ...fakeSessionSharesRepository,
          viewSharedSession: async (shareId) => {
            assert.strictEqual(shareId, SHARE_ID);
            return success(success(SHARED_SESSION));
          },
        },
      });

      const res = await app.inject({
        url: `/sharing/sessions/${SHARE_ID}`,
      });

      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(JSON.parse(res.payload), {
        id: SESSION_ID,
        name: "Super session",
        date: "2026-10-12",
        rating: 10,
        notes: "A great day on the water",
        spot: "Kloster",
        sail: "Gaastra 9",
      });
    });

    test("returns 404 for an unknown or expired share link", async (t) => {
      const app = await build(t, {
        sessionSharesRepository: {
          ...fakeSessionSharesRepository,
          viewSharedSession: async () => failure("NOT_FOUND__session_shares"),
        },
      });

      const res = await app.inject({
        url: `/sharing/sessions/${SHARE_ID}`,
      });

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(
        JSON.parse(res.payload).message,
        "Session not found or expired",
      );
    });

    test("returns 404 if the shared session no longer exists", async (t) => {
      const app = await build(t, {
        sessionSharesRepository: {
          ...fakeSessionSharesRepository,
          viewSharedSession: async () =>
            success(failure("NOT_FOUND__sessions")),
        },
      });

      const res = await app.inject({
        url: `/sharing/sessions/${SHARE_ID}`,
      });

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(
        JSON.parse(res.payload).message,
        "Session not found or expired",
      );
    });

    test("returns 500 on an unexpected repository error", async (t) => {
      const app = await build(t, {
        sessionSharesRepository: {
          ...fakeSessionSharesRepository,
          // @ts-expect-error unsupported return type to simulate an unknown error
          viewSharedSession: async () => failure("UNKNOWN"),
        },
      });

      const res = await app.inject({
        url: `/sharing/sessions/${SHARE_ID}`,
      });

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(
        JSON.parse(res.payload).message,
        "Failed to view shared session",
      );
    });
  });
});
