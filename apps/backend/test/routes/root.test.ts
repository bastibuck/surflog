import { test } from "node:test";
import * as assert from "node:assert";
import { build } from "../helper.ts";

test("health-check root route", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: "/",
  });

  assert.equal(res.payload, JSON.stringify({ alive: true }));
});
