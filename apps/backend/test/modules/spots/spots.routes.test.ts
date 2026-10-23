import * as assert from "node:assert";
import { describe, test } from "node:test";
import { failure, success } from "../../../src/lib/typed-result.ts";
import type { SpotsRepository } from "../../../src/modules/spots/repository.ts";
import { build } from "../../helper.ts";
import type { CreateSpotPayload } from "@surflog/shared/api-schema/spots/SpotSchema";

const fakeSpotsRepository = {
  list: async () => success([]),
  create: async (_spot: CreateSpotPayload) => success(undefined),
} satisfies SpotsRepository;

describe("Module: spots", () => {
  describe("routes", () => {
    test("GET /spots returns all spots", async (t) => {
      const app = await build(t, {
        spotsRepository: {
          ...fakeSpotsRepository,
          list: async () =>
            success([
              {
                id: "d1aca720-9c75-40c9-ad8e-c4171f37e21c",
                name: "Spot 1",
              },
              {
                id: "e1aca720-9c75-40c9-ad8e-c4171f37e21c",
                name: "Spot 2",
              },
            ]),
        },
      });

      const res = await app.inject({
        url: "/spots",
      });

      assert.equal(res.statusCode, 200);
      assert.deepEqual(JSON.parse(res.payload), [
        { id: "d1aca720-9c75-40c9-ad8e-c4171f37e21c", name: "Spot 1" },
        { id: "e1aca720-9c75-40c9-ad8e-c4171f37e21c", name: "Spot 2" },
      ]);
    });

    test("GET /spots returns 500 on unknown error", async (t) => {
      const app = await build(t, {
        spotsRepository: {
          ...fakeSpotsRepository,
          // @ts-expect-error unsupported return type to simulate unknown error
          list: async () => failure("UNKNOWN"),
        },
      });

      const res = await app.inject({
        url: "/spots",
      });

      assert.equal(res.statusCode, 500);
    });

    test("POST /spots returns 201", async (t) => {
      const app = await build(t, {
        spotsRepository: {
          ...fakeSpotsRepository,
          create: async () => success(undefined),
        },
      });

      const res = await app.inject({
        url: "/spots",
        method: "POST",
        payload: {
          name: "New Spot",
        },
      });

      assert.equal(res.statusCode, 201);
    });

    test("POST /spots validates payload correctly", async (t) => {
      const app = await build(t, {
        spotsRepository: {
          ...fakeSpotsRepository,
          create: async () => success(undefined),
        },
      });

      const res = await app.inject({
        url: "/spots",
        method: "POST",
        payload: {},
      });

      assert.equal(res.statusCode, 400);
      assert.equal(
        JSON.parse(res.payload).message,
        "body/name Invalid input: expected string, received undefined",
      );
    });

    test("POST /spots returns a conflict on duplication", async (t) => {
      const app = await build(t, {
        spotsRepository: {
          ...fakeSpotsRepository,
          create: async () => failure("DUPLICATE_ENTRY__spots"),
        },
      });

      const res = await app.inject({
        url: "/spots",
        method: "POST",
        payload: {
          name: "Some duplicate name",
        },
      });

      assert.equal(res.statusCode, 409);
      assert.equal(JSON.parse(res.payload).message, "Spot already exists");
    });

    test("POST /spots fails on unhandled errors", async (t) => {
      const app = await build(t, {
        spotsRepository: {
          ...fakeSpotsRepository,
          create: async () => {
            throw new Error("Should trigger global error handler");
          },
        },
      });

      const res = await app.inject({
        url: "/spots",
        method: "POST",
        payload: {
          name: "Some duplicate name",
        },
      });

      assert.equal(res.statusCode, 500);
      assert.equal(JSON.parse(res.payload).message, "Failed to retrieve spots");
    });

    test("POST /spots returns 500 on unknown error", async (t) => {
      const app = await build(t, {
        spotsRepository: {
          ...fakeSpotsRepository,
          // @ts-expect-error unsupported return type to simulate unknown error
          create: async () => failure("UNKNOWN"),
        },
      });

      const res = await app.inject({
        url: "/spots",
        method: "POST",
        payload: {
          name: "Fake name",
        },
      });

      assert.equal(res.statusCode, 500);
    });
  });
});
