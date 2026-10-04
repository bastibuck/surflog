import * as assert from "node:assert";
import { test } from "node:test";
import { build } from "../../helper.ts";

test("/sessions returns all sessions", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: "/sessions",
  });

  assert.deepEqual(JSON.parse(res.payload), []);
});

test("/sessions/:sessionId returns session details", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: "/sessions/19ef6310-4306-4942-b72a-8f118ccfee38",
  });

  assert.deepEqual(JSON.parse(res.payload), {
    id: "19ef6310-4306-4942-b72a-8f118ccfee38",
    name: "Session Name",
  });
});

test("/sessions POST creates a new session", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    method: "POST",
    url: "/sessions",
    payload: {
      name: "Test Session",
    },
  });

  assert.equal(res.statusCode, 204);
});

test("/sessions POST validates request payload for required fields", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    method: "POST",
    url: "/sessions",
    payload: {},
  });

  assert.equal(res.statusCode, 400);
  assert.equal(
    JSON.parse(res.payload).message,
    "body/name Invalid input: expected string, received undefined",
  );
});

test("/sessions POST validates name for max length", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    method: "POST",
    url: "/sessions",
    payload: {
      name: "a".repeat(51),
    },
  });

  assert.equal(res.statusCode, 400);
  assert.equal(
    JSON.parse(res.payload).message,
    "body/name Too big: expected string to have <=50 characters",
  );
});

test("/sessions/:sessionId DELETE deletes a session", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    method: "DELETE",
    url: "/sessions/e237d317-f452-422e-bf92-aebcdf375cca",
  });

  assert.equal(res.statusCode, 204);
});
