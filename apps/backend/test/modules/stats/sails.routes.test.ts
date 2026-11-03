import * as assert from "node:assert";
import { describe, test } from "node:test";

import { failure, success } from "../../../src/lib/typed-result.ts";
import type { SailsStatsRepository } from "../../../src/modules/stats/sails/repository.ts";
import { build } from "../../helper.ts";

const SAIL_ID = "5a217ca1-7d92-4403-a33f-fa3dc5f5b0e0";

const fakeSailsStatsRepository = {
  getMostUsed: async () => success([]),
  getBestSails: async () => success([]),
} satisfies SailsStatsRepository;

describe("Module: stats sails routes", () => {
  describe("routes", () => {
    describe("GET /stats/sails/most-used", () => {
      test("returns most used sails and forwards date filters", async (t) => {
        const app = await build(t, {
          sailsStatsRepository: {
            ...fakeSailsStatsRepository,
            getMostUsed: async (filters) => {
              assert.deepEqual(filters, {
                from: "2026-10-10",
                to: "2026-10-15",
              });

              return success([
                {
                  id: SAIL_ID,
                  displayName: "Gaastra 9",
                  count: 4,
                },
              ]);
            },
          },
        });

        const res = await app.inject({
          url: "/stats/sails/most-used?from=2026-10-10&to=2026-10-15",
        });

        assert.equal(res.statusCode, 200);
        assert.deepEqual(JSON.parse(res.payload), [
          {
            id: SAIL_ID,
            displayName: "Gaastra 9",
            count: 4,
          },
        ]);
      });

      test("returns an empty list when no sails are used", async (t) => {
        const app = await build(t, {
          sailsStatsRepository: {
            ...fakeSailsStatsRepository,
            getMostUsed: async () => success([]),
          },
        });

        const res = await app.inject({ url: "/stats/sails/most-used" });

        assert.equal(res.statusCode, 200);
        assert.deepEqual(JSON.parse(res.payload), []);
      });

      test("returns 500 on repository error", async (t) => {
        const app = await build(t, {
          sailsStatsRepository: {
            ...fakeSailsStatsRepository,
            // @ts-expect-error unsupported return type to simulate unknown error
            getMostUsed: async () => failure("UNKNOWN"),
          },
        });

        const res = await app.inject({ url: "/stats/sails/most-used" });

        assert.equal(res.statusCode, 500);
        assert.equal(
          JSON.parse(res.payload).message,
          "Failed to retrieve most used sails",
        );
      });
    });

    describe("GET /stats/sails/top-three", () => {
      test("returns the best sails and forwards date filters", async (t) => {
        const app = await build(t, {
          sailsStatsRepository: {
            ...fakeSailsStatsRepository,
            getBestSails: async (filters) => {
              assert.deepEqual(filters, {
                from: "2026-10-10",
                to: "2026-10-15",
              });

              return success([
                {
                  id: SAIL_ID,
                  displayName: "Gaastra 9",
                  averageRating: 8.5,
                  sessionCount: 2,
                },
              ]);
            },
          },
        });

        const res = await app.inject({
          url: "/stats/sails/top-three?from=2026-10-10&to=2026-10-15",
        });

        assert.equal(res.statusCode, 200);
        assert.deepEqual(JSON.parse(res.payload), [
          {
            id: SAIL_ID,
            displayName: "Gaastra 9",
            averageRating: 8.5,
            sessionCount: 2,
          },
        ]);
      });

      test("returns an empty list when no ratings exist", async (t) => {
        const app = await build(t, {
          sailsStatsRepository: {
            ...fakeSailsStatsRepository,
            getBestSails: async () => success([]),
          },
        });

        const res = await app.inject({ url: "/stats/sails/top-three" });

        assert.equal(res.statusCode, 200);
        assert.deepEqual(JSON.parse(res.payload), []);
      });

      test("returns 500 on repository error", async (t) => {
        const app = await build(t, {
          sailsStatsRepository: {
            ...fakeSailsStatsRepository,
            // @ts-expect-error unsupported return type to simulate unknown error
            getBestSails: async () => failure("UNKNOWN"),
          },
        });

        const res = await app.inject({ url: "/stats/sails/top-three" });

        assert.equal(res.statusCode, 500);
        assert.equal(
          JSON.parse(res.payload).message,
          "Failed to retrieve best sails",
        );
      });
    });
  });
});
