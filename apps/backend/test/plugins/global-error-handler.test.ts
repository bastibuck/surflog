import { test } from "node:test";
import { build } from "../helper.ts";
import { success } from "../../src/lib/typed-result.ts";
import assert from "node:assert";

test("Unhandled errors return 500 and do not expose the internal error msg", async (t) => {
  const app = await build(t, {
    gearRepository: {
      listBrands: async () => success([]),
      listSails: async () => {
        throw new Error("Some secret internal error message");
      },
    },
  });

  const res = await app.inject({
    url: "/gear/sails",
  });

  assert.equal(res.statusCode, 500);
  assert.deepEqual(JSON.parse(res.payload), {
    statusCode: 500,
    error: "Internal Server Error",
    message: "Internal Server Error",
  });
});
