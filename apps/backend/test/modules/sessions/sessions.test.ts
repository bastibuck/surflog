import * as assert from "node:assert";
import { describe, test } from "node:test";
import { build } from "../../helper.ts";
import type { SessionsRepository } from "../../../src/modules/sessions/repository.ts";
import { failure, success } from "../../../src/lib/typed-result.ts";

const fakeSessionsRepository = {
  list: async () => success([]),
  findById: async (id: string) =>
    success({
      id,
      name: "Session Name",
      date: "2024-06-03",
      rating: 1,
      notes: null,
      spot: {
        name: "Spot Name",
      },
      sail: {
        size: 5,
        alias: "Sail Alias",
        brand: "Some Brand",
      },
    }),
  create: async (_session) => success(undefined),
  delete: async (_id) => success(undefined),
} satisfies SessionsRepository;

describe("Module: sessions", () => {
  describe("routes", () => {
    test("GET /sessions returns all sessions", async (t) => {
      const app = await build(t, {
        sessionsRepository: {
          ...fakeSessionsRepository,
          list: async () =>
            success([
              {
                id: "779f163e-52e5-496d-8c48-9ecee8e6d780",
                name: "Fake session",
                date: "2024-06-01",
                rating: 2,
              },
              {
                id: "b196c283-b88b-4d01-a82a-8322a0d55bb8",
                name: "Another session",
                date: "2024-06-02",
                rating: 5,
              },
            ]),
        },
      });

      const res = await app.inject({
        url: "/sessions",
      });

      assert.equal(res.statusCode, 200);
      assert.deepEqual(JSON.parse(res.payload), [
        {
          id: "779f163e-52e5-496d-8c48-9ecee8e6d780",
          name: "Fake session",
          date: "2024-06-01",
        },
        {
          id: "b196c283-b88b-4d01-a82a-8322a0d55bb8",
          name: "Another session",
          date: "2024-06-02",
        },
      ]);
    });

    test("GET /sessions returns empty array when no sessions exist", async (t) => {
      const app = await build(t, {
        sessionsRepository: {
          ...fakeSessionsRepository,
          list: async () => success([]),
        },
      });

      const res = await app.inject({
        url: "/sessions",
      });

      assert.equal(res.statusCode, 200);
      assert.deepEqual(JSON.parse(res.payload), []);
    });

    test("GET /sessions returns 500 on unknown error", async (t) => {
      const app = await build(t, {
        sessionsRepository: {
          ...fakeSessionsRepository,
          // @ts-expect-error unsupported return type to simulate unknown error
          list: async () => failure("UNKNOWN"),
        },
      });

      const res = await app.inject({
        url: "/sessions",
      });

      assert.equal(res.statusCode, 500);
      assert.equal(
        JSON.parse(res.payload).message,
        "Failed to retrieve sessions",
      );
    });

    test("GET /sessions/:sessionId returns session details", async (t) => {
      const app = await build(t, {
        sessionsRepository: fakeSessionsRepository,
      });

      const res = await app.inject({
        url: "/sessions/19ef6310-4306-4942-b72a-8f118ccfee38",
      });

      assert.equal(res.statusCode, 200);
      assert.deepEqual(JSON.parse(res.payload), {
        id: "19ef6310-4306-4942-b72a-8f118ccfee38",
        name: "Session Name",
        date: "2024-06-03",
        rating: 1,
        notes: null,
        spot: {
          name: "Spot Name",
        },
        sail: {
          size: 5,
          alias: "Sail Alias",
          brand: "Some Brand",
        },
      });
    });

    test("GET /sessions/:sessionId returns not found", async (t) => {
      const app = await build(t, {
        sessionsRepository: {
          ...fakeSessionsRepository,
          findById: async (_id: string) => failure("NOT_FOUND__sessions"),
        },
      });

      const res = await app.inject({
        url: "/sessions/3adf84e0-68e3-4cae-842b-26ac6441702e",
      });

      assert.equal(res.statusCode, 404);
      assert.equal(JSON.parse(res.payload).message, "Session not found");
    });

    test("GET /sessions/:sessionId returns 500 on unknown error", async (t) => {
      const app = await build(t, {
        sessionsRepository: {
          ...fakeSessionsRepository,
          // @ts-expect-error unsupported return type to simulate unknown error
          findById: async (_id: string) => failure("UNKNOWN"),
        },
      });

      const res = await app.inject({
        url: "/sessions/3adf84e0-68e3-4cae-842b-26ac6441702e",
      });

      assert.equal(res.statusCode, 500);
      assert.equal(
        JSON.parse(res.payload).message,
        "Failed to retrieve session",
      );
    });

    test("POST /sessions creates a new session", async (t) => {
      const app = await build(t, {
        sessionsRepository: fakeSessionsRepository,
      });

      const res = await app.inject({
        method: "POST",
        url: "/sessions",
        payload: {
          name: "Test Session",
          date: "2024-06-02",
          rating: 8,
          notes: null,
          spot: {
            id: "e237d317-f452-422e-bf92-aebcdf375cca",
            name: "Spot Name",
          },
          sail: {
            id: "e237d317-f452-422e-bf92-aebcdf375cca",
            size: 5,
            alias: "Sail Alias",
            brand: {
              id: "e237d317-f452-422e-bf92-aebcdf375cca",
              name: "Some Brand",
            },
          },
        },
      });

      assert.equal(res.statusCode, 201);
    });

    test("POST /sessions validates request payload for required fields", async (t) => {
      const app = await build(t, {
        sessionsRepository: fakeSessionsRepository,
      });

      const res = await app.inject({
        method: "POST",
        url: "/sessions",
        payload: {},
      });

      assert.equal(res.statusCode, 400);
      assert.equal(
        JSON.parse(res.payload).message,
        "body/name Invalid input: expected string, received undefined, body/date Invalid input: expected string, received undefined, body/rating Invalid input: expected number, received undefined, body/notes Invalid input: expected string, received undefined, body/spot Invalid input: expected object, received undefined, body/sail Invalid input: expected object, received undefined",
      );
    });

    test("POST /sessions validates name for max length", async (t) => {
      const app = await build(t, {
        sessionsRepository: fakeSessionsRepository,
      });

      const res = await app.inject({
        method: "POST",
        url: "/sessions",
        payload: {
          name: "a".repeat(51),
          date: "2024-06-02",
          rating: 1,
          notes: null,
          spot: {
            id: "e237d317-f452-422e-bf92-aebcdf375cca",
            name: "Spot Name",
          },
          sail: {
            id: "e237d317-f452-422e-bf92-aebcdf375cca",
            size: 5,
            alias: "Sail Alias",
            brand: {
              id: "e237d317-f452-422e-bf92-aebcdf375cca",
              name: "Some Brand",
            },
          },
        },
      });

      assert.equal(res.statusCode, 400);
      assert.equal(
        JSON.parse(res.payload).message,
        "body/name Too big: expected string to have <=50 characters",
      );
    });

    test("DELETE /sessions/:sessionId deletes a session", async (t) => {
      const app = await build(t, {
        sessionsRepository: fakeSessionsRepository,
      });

      const res = await app.inject({
        method: "DELETE",
        url: "/sessions/e237d317-f452-422e-bf92-aebcdf375cca",
      });

      assert.equal(res.statusCode, 204);
    });
  });
});
