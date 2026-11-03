import * as assert from "node:assert";
import { describe, test } from "node:test";

import { failure, success } from "../../../src/lib/typed-result.ts";
import type { SessionsStatsRepository } from "../../../src/modules/stats/sessions/repository.ts";
import { build } from "../../helper.ts";

const fakeSessionsStatsRepository = {
  getCount: async () => success(0),
} satisfies SessionsStatsRepository;

describe("Module: stats sessions routes", () => {
  describe("GET /stats/sessions/count", () => {
    test("returns the session count", async (t) => {
      const app = await build(t, {
        sessionsStatsRepository: {
          ...fakeSessionsStatsRepository,
          getCount: async () => success(4),
        },
      });

      const res = await app.inject({ url: "/stats/sessions/count" });

      assert.equal(res.statusCode, 200);
      assert.deepEqual(JSON.parse(res.payload), 4);
    });

    test("forwards date filters to the repository", async (t) => {
      const app = await build(t, {
        sessionsStatsRepository: {
          ...fakeSessionsStatsRepository,
          getCount: async (filters) => {
            assert.deepEqual(filters, {
              from: "2026-10-12",
              to: "2026-10-13",
            });

            return success(2);
          },
        },
      });

      const res = await app.inject({
        url: "/stats/sessions/count?from=2026-10-12&to=2026-10-13",
      });

      assert.equal(res.statusCode, 200);
      assert.deepEqual(JSON.parse(res.payload), 2);
    });

    test("returns 500 on repository error", async (t) => {
      const app = await build(t, {
        sessionsStatsRepository: {
          ...fakeSessionsStatsRepository,
          // @ts-expect-error unsupported return type to simulate an unknown error
          getCount: async () => failure("UNKNOWN"),
        },
      });

      const res = await app.inject({ url: "/stats/sessions/count" });

      assert.equal(res.statusCode, 500);
      assert.equal(
        JSON.parse(res.payload).message,
        "Failed to retrieve session count",
      );
    });
  });
});
