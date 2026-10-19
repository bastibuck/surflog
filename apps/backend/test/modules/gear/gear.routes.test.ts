import * as assert from "node:assert";
import { describe, test } from "node:test";
import { success } from "../../../src/lib/typed-result.ts";
import type { GearRepository } from "../../../src/modules/gear/repository.ts";
import { build } from "../../helper.ts";

const fakeGearRepository = {
  listBrands: async () => success([]),
  listSails: async () => success([]),
} satisfies GearRepository;

describe("Module: gear", () => {
  describe("routes", () => {
    describe("brands", () => {
      test("GET /gear/brands returns all brands", async (t) => {
        const app = await build(t, {
          gearRepository: {
            ...fakeGearRepository,
            listBrands: async () =>
              success([
                {
                  id: "d1aca720-9c75-40c9-ad8e-c4171f37e21c",
                  name: "Brand 1",
                },
                {
                  id: "e1aca720-9c75-40c9-ad8e-c4171f37e21c",
                  name: "Brand 2",
                },
              ]),
          },
        });

        const res = await app.inject({
          url: "/gear/brands",
        });

        assert.equal(res.statusCode, 200);
        assert.deepEqual(JSON.parse(res.payload), [
          { id: "d1aca720-9c75-40c9-ad8e-c4171f37e21c", name: "Brand 1" },
          { id: "e1aca720-9c75-40c9-ad8e-c4171f37e21c", name: "Brand 2" },
        ]);
      });
    });

    describe("sails", () => {
      test("GET /gear/sails returns all sails", async (t) => {
        const app = await build(t, {
          gearRepository: {
            ...fakeGearRepository,
            listSails: async () =>
              success([
                {
                  id: "a3695ab6-c94a-444c-ae0a-215b10e20249",
                  brand: "Brand eins",
                  size: 9,
                  alias: null,
                },
              ]),
          },
        });

        const res = await app.inject({
          url: "/gear/sails",
        });

        assert.equal(res.statusCode, 200);
        assert.deepEqual(JSON.parse(res.payload), [
          {
            id: "a3695ab6-c94a-444c-ae0a-215b10e20249",
            brand: "Brand eins",
            size: 9,
            alias: null,
          },
        ]);
      });
    });
  });
});
