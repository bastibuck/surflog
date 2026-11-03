import * as assert from "node:assert";
import { describe, test } from "node:test";

import { failure, success } from "../../../src/lib/typed-result.ts";
import type { SpotsStatsRepository } from "../../../src/modules/stats/spots/repository.ts";
import { build } from "../../helper.ts";

const SPOT_ID = "c862b734-626b-4029-b2bf-b600d4f7959f";

const fakeSpotsStatsRepository = {
  getMostVisited: async () => success([]),
  getBestSpots: async () => success([]),
  getAverageSpotRating: async (_spotId: string) => success(null),
} satisfies SpotsStatsRepository;

describe("Module: stats spots routes", () => {
  describe("routes", () => {
    describe("GET /stats/spots/most-visited", () => {
      test("returns most visited spots and forwards date filters", async (t) => {
        const app = await build(t, {
          spotsStatsRepository: {
            ...fakeSpotsStatsRepository,
            getMostVisited: async (filters) => {
              assert.deepEqual(filters, {
                from: "2026-10-10",
                to: "2026-10-15",
              });

              return success([
                {
                  id: SPOT_ID,
                  name: "Kloster",
                  count: 4,
                },
              ]);
            },
          },
        });

        const res = await app.inject({
          url: "/stats/spots/most-visited?from=2026-10-10&to=2026-10-15",
        });

        assert.equal(res.statusCode, 200);
        assert.deepEqual(JSON.parse(res.payload), [
          {
            id: SPOT_ID,
            name: "Kloster",
            count: 4,
          },
        ]);
      });

      test("returns an empty list when no spots have been visited", async (t) => {
        const app = await build(t, {
          spotsStatsRepository: {
            ...fakeSpotsStatsRepository,
            getMostVisited: async () => success([]),
          },
        });

        const res = await app.inject({ url: "/stats/spots/most-visited" });

        assert.equal(res.statusCode, 200);
        assert.deepEqual(JSON.parse(res.payload), []);
      });

      test("returns 500 on repository error", async (t) => {
        const app = await build(t, {
          spotsStatsRepository: {
            ...fakeSpotsStatsRepository,
            // @ts-expect-error unsupported return type to simulate unknown error
            getMostVisited: async () => failure("UNKNOWN"),
          },
        });

        const res = await app.inject({ url: "/stats/spots/most-visited" });

        assert.equal(res.statusCode, 500);
        assert.equal(
          JSON.parse(res.payload).message,
          "Failed to retrieve most visited spots",
        );
      });
    });

    describe("GET /stats/spots/top-three", () => {
      test("returns the best spots and forwards date filters", async (t) => {
        const app = await build(t, {
          spotsStatsRepository: {
            ...fakeSpotsStatsRepository,
            getBestSpots: async (filters) => {
              assert.deepEqual(filters, {
                from: "2026-10-10",
                to: "2026-10-15",
              });

              return success([
                {
                  id: SPOT_ID,
                  name: "Kloster",
                  averageRating: 8.5,
                  sessionCount: 2,
                },
              ]);
            },
          },
        });

        const res = await app.inject({
          url: "/stats/spots/top-three?from=2026-10-10&to=2026-10-15",
        });

        assert.equal(res.statusCode, 200);
        assert.deepEqual(JSON.parse(res.payload), [
          {
            id: SPOT_ID,
            name: "Kloster",
            averageRating: 8.5,
            sessionCount: 2,
          },
        ]);
      });

      test("returns an empty list when no ratings exist", async (t) => {
        const app = await build(t, {
          spotsStatsRepository: {
            ...fakeSpotsStatsRepository,
            getBestSpots: async () => success([]),
          },
        });

        const res = await app.inject({ url: "/stats/spots/top-three" });

        assert.equal(res.statusCode, 200);
        assert.deepEqual(JSON.parse(res.payload), []);
      });

      test("returns 500 on repository error", async (t) => {
        const app = await build(t, {
          spotsStatsRepository: {
            ...fakeSpotsStatsRepository,
            // @ts-expect-error unsupported return type to simulate unknown error
            getBestSpots: async () => failure("UNKNOWN"),
          },
        });

        const res = await app.inject({ url: "/stats/spots/top-three" });

        assert.equal(res.statusCode, 500);
        assert.equal(
          JSON.parse(res.payload).message,
          "Failed to retrieve best spots",
        );
      });
    });

    describe("GET /stats/spots/average-rating/:spotId", () => {
      test("returns the average spot rating", async (t) => {
        const app = await build(t, {
          spotsStatsRepository: {
            ...fakeSpotsStatsRepository,
            getAverageSpotRating: async (spotId) => {
              assert.equal(spotId, SPOT_ID);
              return success(8.5);
            },
          },
        });

        const res = await app.inject({
          url: `/stats/spots/average-rating/${SPOT_ID}`,
        });

        assert.equal(res.statusCode, 200);
        assert.deepEqual(JSON.parse(res.payload), 8.5);
      });

      test("returns null when the spot has no sessions", async (t) => {
        const app = await build(t, {
          spotsStatsRepository: {
            ...fakeSpotsStatsRepository,
            getAverageSpotRating: async () => success(null),
          },
        });

        const res = await app.inject({
          url: `/stats/spots/average-rating/${SPOT_ID}`,
        });

        assert.equal(res.statusCode, 200);
        assert.deepEqual(JSON.parse(res.payload), null);
      });

      test("returns 404 when the spot does not exist", async (t) => {
        const app = await build(t, {
          spotsStatsRepository: {
            ...fakeSpotsStatsRepository,
            getAverageSpotRating: async () => failure("NOT_FOUND__spots"),
          },
        });

        const res = await app.inject({
          url: `/stats/spots/average-rating/${SPOT_ID}`,
        });

        assert.equal(res.statusCode, 404);
        assert.equal(JSON.parse(res.payload).message, "Spot not found");
      });

      test("returns 500 on repository error", async (t) => {
        const app = await build(t, {
          spotsStatsRepository: {
            ...fakeSpotsStatsRepository,
            // @ts-expect-error unsupported return type to simulate unknown error
            getAverageSpotRating: async () => failure("UNKNOWN"),
          },
        });

        const res = await app.inject({
          url: `/stats/spots/average-rating/${SPOT_ID}`,
        });

        assert.equal(res.statusCode, 500);
        assert.equal(
          JSON.parse(res.payload).message,
          "Failed to retrieve spot rating",
        );
      });

      test("validates the spot ID", async (t) => {
        const app = await build(t, {
          spotsStatsRepository: fakeSpotsStatsRepository,
        });

        const res = await app.inject({
          url: "/stats/spots/average-rating/not-a-uuid",
        });

        assert.equal(res.statusCode, 400);
      });
    });
  });
});
