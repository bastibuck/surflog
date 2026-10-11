import * as assert from "node:assert";
import { test } from "node:test";
import { build } from "../../helper.ts";
import type { SessionsRepository } from "../../../src/modules/sessions/repository.ts";
import { success } from "../../../src/lib/typed-result.ts";

const fakeSessionsRepository = {
  list: async () =>
    success([
      {
        id: "779f163e-52e5-496d-8c48-9ecee8e6d780",
        name: "Fake session",
        date: new Date("2024-06-01"),
      },
      {
        id: "b196c283-b88b-4d01-a82a-8322a0d55bb8",
        name: "Another session",
        date: new Date("2024-06-02"),
      },
    ]),
  findById: async (id: string) =>
    success({
      id,
      name: "Session Name",
      date: new Date("2024-06-03"),
    }),
  create: async (_session) => success(undefined),
  delete: async (_id) => success(undefined),
} satisfies SessionsRepository;

test("/sessions returns all sessions", async (t) => {
  const app = await build(t, {
    sessionsRepository: fakeSessionsRepository,
  });

  const res = await app.inject({
    url: "/sessions",
  });

  assert.deepEqual(JSON.parse(res.payload), [
    {
      id: "779f163e-52e5-496d-8c48-9ecee8e6d780",
      name: "Fake session",
      date: "2024-06-01T00:00:00.000Z",
    },
    {
      id: "b196c283-b88b-4d01-a82a-8322a0d55bb8",
      name: "Another session",
      date: "2024-06-02T00:00:00.000Z",
    },
  ]);
});

test("/sessions/:sessionId returns session details", async (t) => {
  const app = await build(t, {
    sessionsRepository: fakeSessionsRepository,
  });

  const res = await app.inject({
    url: "/sessions/19ef6310-4306-4942-b72a-8f118ccfee38",
  });

  assert.deepEqual(JSON.parse(res.payload), {
    id: "19ef6310-4306-4942-b72a-8f118ccfee38",
    name: "Session Name",
    date: "2024-06-03T00:00:00.000Z",
  });
});

test("/sessions POST creates a new session", async (t) => {
  const app = await build(t, {
    sessionsRepository: fakeSessionsRepository,
  });

  const res = await app.inject({
    method: "POST",
    url: "/sessions",
    payload: {
      name: "Test Session",
      date: "2024-06-02T00:00:00.000Z",
    },
  });

  assert.equal(res.statusCode, 204);
});

test("/sessions POST validates request payload for required fields", async (t) => {
  const app = await build(t, {
    sessionsRepository: fakeSessionsRepository,
  });

  const res = await app.inject({
    method: "POST",
    url: "/sessions",
    payload: {
      date: "2024-06-02T00:00:00.000Z",
    },
  });

  assert.equal(res.statusCode, 400);
  assert.equal(
    JSON.parse(res.payload).message,
    "body/name Invalid input: expected string, received undefined",
  );
});

test("/sessions POST validates name for max length", async (t) => {
  const app = await build(t, {
    sessionsRepository: fakeSessionsRepository,
  });

  const res = await app.inject({
    method: "POST",
    url: "/sessions",
    payload: {
      name: "a".repeat(51),
      date: "2024-06-02T00:00:00.000Z",
    },
  });

  assert.equal(res.statusCode, 400);
  assert.equal(
    JSON.parse(res.payload).message,
    "body/name Too big: expected string to have <=50 characters",
  );
});

test("/sessions/:sessionId DELETE deletes a session", async (t) => {
  const app = await build(t, {
    sessionsRepository: fakeSessionsRepository,
  });

  const res = await app.inject({
    method: "DELETE",
    url: "/sessions/e237d317-f452-422e-bf92-aebcdf375cca",
  });

  assert.equal(res.statusCode, 204);
});
