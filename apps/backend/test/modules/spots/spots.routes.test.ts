import * as assert from "node:assert";
import { describe, test } from "node:test";
import { failure, success } from "../../../src/lib/typed-result.ts";
import type { SpotsRepository } from "../../../src/modules/spots/repository.ts";
import { build } from "../../helper.ts";

const fakeSpotsRepository = {
  list: async () => success([]),
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

    test("GET /spots returns empty list when no spots exist", async (t) => {
      const app = await build(t, {
        spotsRepository: {
          ...fakeSpotsRepository,
          list: async () => success([]),
        },
      });

      const res = await app.inject({
        url: "/spots",
      });

      assert.equal(res.statusCode, 200);
      assert.deepEqual(JSON.parse(res.payload), []);
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
      assert.equal(JSON.parse(res.payload).message, "Failed to retrieve spots");
    });
  });
});
