import * as assert from "node:assert";
import { describe, test } from "node:test";

import { failure, success } from "../../../src/lib/typed-result.ts";
import type { SessionsStatsRepository } from "../../../src/modules/stats/sessions/repository.ts";
import { build } from "../../helper.ts";

const BEST_SESSION = {
  id: "9d411ee6-8c08-45b8-9e42-b29c2723980a",
  name: "Best session",
  date: "2026-10-12",
  rating: 10,
  notes: null,
  spot: "Kloster",
  sail: "Gaastra 9",
};

const fakeSessionsStatsRepository = {
  getCount: async () => success(0),
  getAverageRating: async () => success(null),
  getBestSession: async () => success(null),
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

  describe("GET /stats/sessions/average-rating", () => {
    test("returns the average session rating and forwards date filters", async (t) => {
      const app = await build(t, {
        sessionsStatsRepository: {
          ...fakeSessionsStatsRepository,
          getAverageRating: async (filters) => {
            assert.deepEqual(filters, {
              from: "2026-10-10",
              to: "2026-10-15",
            });

            return success(8.5);
          },
        },
      });

      const res = await app.inject({
        url: "/stats/sessions/average-rating?from=2026-10-10&to=2026-10-15",
      });

      assert.equal(res.statusCode, 200);
      assert.deepEqual(JSON.parse(res.payload), 8.5);
    });

    test("returns 500 on repository error", async (t) => {
      const app = await build(t, {
        sessionsStatsRepository: {
          ...fakeSessionsStatsRepository,
          // @ts-expect-error unsupported return type to simulate an unknown error
          getAverageRating: async () => failure("UNKNOWN"),
        },
      });

      const res = await app.inject({ url: "/stats/sessions/average-rating" });

      assert.equal(res.statusCode, 500);
      assert.equal(
        JSON.parse(res.payload).message,
        "Failed to retrieve average session rating",
      );
    });
  });

  describe("GET /stats/sessions/best", () => {
    test("returns the best session and forwards date filters", async (t) => {
      const app = await build(t, {
        sessionsStatsRepository: {
          ...fakeSessionsStatsRepository,
          getBestSession: async (filters) => {
            assert.deepEqual(filters, {
              from: "2026-10-10",
              to: "2026-10-15",
            });

            return success(BEST_SESSION);
          },
        },
      });

      const res = await app.inject({
        url: "/stats/sessions/best?from=2026-10-10&to=2026-10-15",
      });

      assert.equal(res.statusCode, 200);
      assert.deepEqual(JSON.parse(res.payload), BEST_SESSION);
    });

    test("returns 500 on repository error", async (t) => {
      const app = await build(t, {
        sessionsStatsRepository: {
          ...fakeSessionsStatsRepository,
          // @ts-expect-error unsupported return type to simulate an unknown error
          getBestSession: async () => failure("UNKNOWN"),
        },
      });

      const res = await app.inject({ url: "/stats/sessions/best" });

      assert.equal(res.statusCode, 500);
      assert.equal(
        JSON.parse(res.payload).message,
        "Failed to retrieve best session",
      );
    });
  });
});
