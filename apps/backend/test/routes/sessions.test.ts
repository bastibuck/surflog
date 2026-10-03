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
