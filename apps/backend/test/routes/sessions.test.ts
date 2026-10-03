import { test } from "node:test";
import * as assert from "node:assert";
import { build } from "../helper.ts";

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
    url: "/sessions/123",
  });

  assert.deepEqual(JSON.parse(res.payload), { id: "123" });
});

test("/sessions POST creates a new session", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    method: "POST",
    url: "/sessions",
  });

  assert.equal(res.statusCode, 201);
  assert.deepEqual(JSON.parse(res.payload), { message: "Session created" });
});

test("/sessions/:sessionId DELETE deletes a session", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    method: "DELETE",
    url: "/sessions/123",
  });

  assert.equal(res.statusCode, 204);
});
