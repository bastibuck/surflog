import * as assert from "node:assert";
import { describe, test } from "node:test";
import { build } from "../../helper.ts";
import type { SessionsRepository } from "../../../src/modules/sessions/repository.ts";
import { failure, success } from "../../../src/lib/typed-result.ts";

const fakeSessionsRepository = {
  list: async () => success([]),
  findById: async (id: string) =>
    success({
      id,
      name: "Session Name",
      date: "2024-06-03",
      rating: 1,
      notes: null,
      spot: {
        name: "Spot Name",
      },
      sail: {
        size: 5,
        alias: "Sail Alias",
        brand: "Some Brand",
      },
    }),
  create: async (_session) =>
    success({ id: "7561179f-9760-4ac2-838b-67ee08225a13" }),
  delete: async (_id) => success(undefined),
} satisfies SessionsRepository;

describe("Module: sessions", () => {
  describe("routes", () => {
    describe("GET /sessions", () => {
      test("returns all sessions", async (t) => {
        const app = await build(t, {
          sessionsRepository: {
            ...fakeSessionsRepository,
            list: async () =>
              success([
                {
                  id: "779f163e-52e5-496d-8c48-9ecee8e6d780",
                  name: "Fake session",
                  date: "2024-06-01",
                  rating: 2,
                },
                {
                  id: "b196c283-b88b-4d01-a82a-8322a0d55bb8",
                  name: "Another session",
                  date: "2024-06-02",
                  rating: 5,
                },
              ]),
          },
        });

        const res = await app.inject({
          url: "/sessions",
        });

        assert.equal(res.statusCode, 200);
        assert.deepEqual(JSON.parse(res.payload), [
          {
            id: "779f163e-52e5-496d-8c48-9ecee8e6d780",
            name: "Fake session",
            date: "2024-06-01",
          },
          {
            id: "b196c283-b88b-4d01-a82a-8322a0d55bb8",
            name: "Another session",
            date: "2024-06-02",
          },
        ]);
      });

      test("returns empty array when no sessions exist", async (t) => {
        const app = await build(t, {
          sessionsRepository: {
            ...fakeSessionsRepository,
            list: async () => success([]),
          },
        });

        const res = await app.inject({
          url: "/sessions",
        });

        assert.equal(res.statusCode, 200);
        assert.deepEqual(JSON.parse(res.payload), []);
      });

      test("returns 500 on unknown error", async (t) => {
        const app = await build(t, {
          sessionsRepository: {
            ...fakeSessionsRepository,
            // @ts-expect-error unsupported return type to simulate unknown error
            list: async () => failure("UNKNOWN"),
          },
        });

        const res = await app.inject({
          url: "/sessions",
        });

        assert.equal(res.statusCode, 500);
        assert.equal(
          JSON.parse(res.payload).message,
          "Failed to retrieve sessions",
        );
      });
    });

    describe("GET /sessions/:sessionId", () => {
      test("returns session details", async (t) => {
        const app = await build(t, {
          sessionsRepository: fakeSessionsRepository,
        });

        const res = await app.inject({
          url: "/sessions/19ef6310-4306-4942-b72a-8f118ccfee38",
        });

        assert.equal(res.statusCode, 200);
        assert.deepEqual(JSON.parse(res.payload), {
          id: "19ef6310-4306-4942-b72a-8f118ccfee38",
          name: "Session Name",
          date: "2024-06-03",
          rating: 1,
          notes: null,
          spot: {
            name: "Spot Name",
          },
          sail: {
            size: 5,
            alias: "Sail Alias",
            brand: "Some Brand",
          },
        });
      });

      test("returns not found", async (t) => {
        const app = await build(t, {
          sessionsRepository: {
            ...fakeSessionsRepository,
            findById: async (_id: string) => failure("NOT_FOUND__sessions"),
          },
        });

        const res = await app.inject({
          url: "/sessions/3adf84e0-68e3-4cae-842b-26ac6441702e",
        });

        assert.equal(res.statusCode, 404);
        assert.equal(JSON.parse(res.payload).message, "Session not found");
      });

      test("returns 500 on unknown error", async (t) => {
        const app = await build(t, {
          sessionsRepository: {
            ...fakeSessionsRepository,
            // @ts-expect-error unsupported return type to simulate unknown error
            findById: async (_id: string) => failure("UNKNOWN"),
          },
        });

        const res = await app.inject({
          url: "/sessions/3adf84e0-68e3-4cae-842b-26ac6441702e",
        });

        assert.equal(res.statusCode, 500);
        assert.equal(
          JSON.parse(res.payload).message,
          "Failed to retrieve session",
        );
      });
    });

    describe("POST /sessions", () => {
      const createSession = (app: any) => {
        return app.inject({
          method: "POST",
          url: "/sessions",
          payload: {
            name: "Test Session",
            date: "2024-06-02",
            rating: 8,
            notes: null,
            spot: {
              action: "reference",
              id: "e237d317-f452-422e-bf92-aebcdf375cca",
            },
            sail: {
              action: "reference",
              id: "e237d317-f452-422e-bf92-aebcdf375cca",
            },
          },
        });
      };

      test("POST /sessions creates a new session", async (t) => {
        const app = await build(t, {
          sessionsRepository: fakeSessionsRepository,
        });

        const res = await createSession(app);

        assert.equal(res.statusCode, 201);
        assert.deepEqual(JSON.parse(res.payload), {
          id: "7561179f-9760-4ac2-838b-67ee08225a13",
        });
      });

      describe("404 errors", () => {
        test("POST /sessions returns 404 on not found brand", async (t) => {
          const app = await build(t, {
            sessionsRepository: {
              ...fakeSessionsRepository,
              create: async (_session) => failure("NOT_FOUND__brands"),
            },
          });

          const res = await createSession(app);

          assert.equal(res.statusCode, 404);
          assert.equal(JSON.parse(res.payload).message, "Brand not found");
        });

        test("POST /sessions returns 404 on not found sail", async (t) => {
          const app = await build(t, {
            sessionsRepository: {
              ...fakeSessionsRepository,
              create: async (_session) => failure("NOT_FOUND__sails"),
            },
          });

          const res = await createSession(app);

          assert.equal(res.statusCode, 404);
          assert.equal(JSON.parse(res.payload).message, "Sail not found");
        });

        test("POST /sessions returns 404 on not found spot", async (t) => {
          const app = await build(t, {
            sessionsRepository: {
              ...fakeSessionsRepository,
              create: async (_session) => failure("NOT_FOUND__spots"),
            },
          });

          const res = await createSession(app);

          assert.equal(res.statusCode, 404);
          assert.equal(JSON.parse(res.payload).message, "Spot not found");
        });
      });

      describe("409 errors", () => {
        test("returns 409 on duplicate brand", async (t) => {
          const app = await build(t, {
            sessionsRepository: {
              ...fakeSessionsRepository,
              create: async (_session) => failure("DUPLICATE_ENTRY__brands"),
            },
          });

          const res = await app.inject({
            method: "POST",
            url: "/sessions",
            payload: {
              name: "Test Session",
              date: "2024-06-02",
              rating: 8,
              notes: null,
              spot: {
                action: "reference",
                id: "e237d317-f452-422e-bf92-aebcdf375cca",
              },
              sail: {
                action: "reference",
                id: "e237d317-f452-422e-bf92-aebcdf375cca",
              },
            },
          });

          assert.equal(res.statusCode, 409);
          assert.equal(JSON.parse(res.payload).message, "Brand already exists");
        });

        test("returns 409 on duplicate sail", async (t) => {
          const app = await build(t, {
            sessionsRepository: {
              ...fakeSessionsRepository,
              create: async (_session) => failure("DUPLICATE_ENTRY__sails"),
            },
          });

          const res = await app.inject({
            method: "POST",
            url: "/sessions",
            payload: {
              name: "Test Session",
              date: "2024-06-02",
              rating: 8,
              notes: null,
              spot: {
                action: "reference",
                id: "e237d317-f452-422e-bf92-aebcdf375cca",
              },
              sail: {
                action: "reference",
                id: "e237d317-f452-422e-bf92-aebcdf375cca",
              },
            },
          });

          assert.equal(res.statusCode, 409);
          assert.equal(JSON.parse(res.payload).message, "Sail already exists");
        });

        test("returns 409 on duplicate spot", async (t) => {
          const app = await build(t, {
            sessionsRepository: {
              ...fakeSessionsRepository,
              create: async (_session) => failure("DUPLICATE_ENTRY__spots"),
            },
          });

          const res = await app.inject({
            method: "POST",
            url: "/sessions",
            payload: {
              name: "Test Session",
              date: "2024-06-02",
              rating: 8,
              notes: null,
              spot: {
                action: "reference",
                id: "e237d317-f452-422e-bf92-aebcdf375cca",
              },
              sail: {
                action: "reference",
                id: "e237d317-f452-422e-bf92-aebcdf375cca",
              },
            },
          });

          assert.equal(res.statusCode, 409);
          assert.equal(JSON.parse(res.payload).message, "Spot already exists");
        });

        test("returns 409 on duplicate sessions", async (t) => {
          const app = await build(t, {
            sessionsRepository: {
              ...fakeSessionsRepository,
              create: async (_session) => failure("DUPLICATE_ENTRY__sessions"),
            },
          });

          const res = await app.inject({
            method: "POST",
            url: "/sessions",
            payload: {
              name: "Test Session",
              date: "2024-06-02",
              rating: 8,
              notes: null,
              spot: {
                action: "reference",
                id: "e237d317-f452-422e-bf92-aebcdf375cca",
              },
              sail: {
                action: "reference",
                id: "e237d317-f452-422e-bf92-aebcdf375cca",
              },
            },
          });

          assert.equal(res.statusCode, 409);
          assert.equal(
            JSON.parse(res.payload).message,
            "Session with the same name on that day already exists",
          );
        });
      });

      describe("500 errors", () => {
        test("returns 500 on unhandlded error", async (t) => {
          const app = await build(t, {
            sessionsRepository: {
              ...fakeSessionsRepository,
              // @ts-expect-error unsupported return type to simulate unknown error
              create: async (_session) => failure("UNKNOWN_ERROR"),
            },
          });

          const res = await createSession(app);

          assert.equal(res.statusCode, 500);
          assert.equal(
            JSON.parse(res.payload).message,
            "Failed to create session",
          );
        });
      });

      describe("paylod validation", () => {
        test("accepts each spot and sail reference combination", async (t) => {
          const app = await build(t, {
            sessionsRepository: fakeSessionsRepository,
          });

          const combinations = [
            {
              spot: {
                action: "reference",
                id: "e237d317-f452-422e-bf92-aebcdf375cca",
              },
              sail: {
                action: "reference",
                id: "e237d317-f452-422e-bf92-aebcdf375cca",
              },
            },
            {
              spot: { action: "create", name: "New Spot" },
              sail: {
                action: "reference",
                id: "e237d317-f452-422e-bf92-aebcdf375cca",
              },
            },
            {
              spot: {
                action: "reference",
                id: "e237d317-f452-422e-bf92-aebcdf375cca",
              },
              sail: {
                action: "create",
                size: 5,
                alias: null,
                brand: {
                  action: "reference",
                  id: "e237d317-f452-422e-bf92-aebcdf375cca",
                },
              },
            },
            {
              spot: { action: "create", name: "New Spot" },
              sail: {
                action: "create",
                size: 5,
                alias: null,
                brand: { action: "create", name: "New Brand" },
              },
            },
          ];

          for (const selection of combinations) {
            const res = await app.inject({
              method: "POST",
              url: "/sessions",
              payload: {
                name: "Test Session",
                date: "2024-06-02",
                rating: 8,
                notes: null,
                ...selection,
              },
            });

            assert.equal(res.statusCode, 201);
          }
        });

        test("rejects fields inconsistent with the selected action", async (t) => {
          const app = await build(t, {
            sessionsRepository: fakeSessionsRepository,
          });
          const common = {
            name: "Test Session",
            date: "2024-06-02",
            rating: 8,
            notes: null,
          };
          const conflictingChoices = [
            {
              ...common,
              spot: {
                action: "reference",
                id: "e237d317-f452-422e-bf92-aebcdf375cca",
                name: "Unexpected new spot name",
              },
              sail: {
                action: "reference",
                id: "e237d317-f452-422e-bf92-aebcdf375cca",
              },
            },
            {
              ...common,
              spot: {
                action: "reference",
                id: "e237d317-f452-422e-bf92-aebcdf375cca",
              },
              sail: {
                action: "reference",
                id: "e237d317-f452-422e-bf92-aebcdf375cca",
                size: 5,
                alias: null,
              },
            },
            {
              ...common,
              sail: {
                action: "create",
                size: 5,
                alias: null,
                brand: {
                  action: "reference",
                  id: "e237d317-f452-422e-bf92-aebcdf375cca",
                  name: "Unexpected new brand name",
                },
              },
              spot: {
                action: "reference",
                id: "e237d317-f452-422e-bf92-aebcdf375cca",
              },
            },
          ];

          for (const payload of conflictingChoices) {
            const res = await app.inject({
              method: "POST",
              url: "/sessions",
              payload,
            });

            assert.equal(res.statusCode, 400);
          }
        });

        test("validates request payload for required fields", async (t) => {
          const app = await build(t, {
            sessionsRepository: fakeSessionsRepository,
          });

          const res = await app.inject({
            method: "POST",
            url: "/sessions",
            payload: {},
          });

          assert.equal(res.statusCode, 400);
          assert.equal(JSON.parse(res.payload).error, "Bad Request");

          const issues = JSON.parse(res.payload).details.issues as Array<{
            path: string;
            message: string;
          }>;

          assert.equal(issues.length, 6);
          assert.equal(
            issues.filter((issue) =>
              issue.message.includes("received undefined"),
            ).length,
            6,
          );
        });

        test("validates name for max length", async (t) => {
          const app = await build(t, {
            sessionsRepository: fakeSessionsRepository,
          });

          const res = await app.inject({
            method: "POST",
            url: "/sessions",
            payload: {
              name: "a".repeat(51),
              date: "2024-06-02",
              rating: 1,
              notes: null,
              spot: {
                action: "reference",
                id: "e237d317-f452-422e-bf92-aebcdf375cca",
              },
              sail: {
                action: "reference",
                id: "abd9a487-8f93-4fc0-90f3-f4f7eb266c08",
              },
            },
          });

          assert.equal(res.statusCode, 400);
          assert.equal(JSON.parse(res.payload).error, "Bad Request");

          assert.equal(JSON.parse(res.payload).details.issues[0].path, "/name");
          assert.equal(
            JSON.parse(res.payload).details.issues[0].message,
            "Too big: expected string to have <=50 characters",
          );
        });

        test("validates rating for valid range", async (t) => {
          const app = await build(t, {
            sessionsRepository: fakeSessionsRepository,
          });

          const cases = [
            {
              rating: -1,
              message: "Too small: expected number to be >=1",
            },
            {
              rating: 0,
              message: "Too small: expected number to be >=1",
            },
            {
              rating: 11,
              message: "Too big: expected number to be <=10",
            },
          ];

          for (const { rating, message } of cases) {
            const res = await app.inject({
              method: "POST",
              url: "/sessions",
              payload: {
                name: "Some session",
                date: "2024-06-02",
                rating: rating,
                notes: null,
                spot: {
                  action: "reference",
                  id: "e237d317-f452-422e-bf92-aebcdf375cca",
                },
                sail: {
                  action: "reference",
                  id: "abd9a487-8f93-4fc0-90f3-f4f7eb266c08",
                },
              },
            });

            assert.equal(res.statusCode, 400);
            assert.equal(
              JSON.parse(res.payload).details.issues[0].message,
              message,
            );
          }
        });
      });
    });

    test("DELETE /sessions/:sessionId deletes a session", async (t) => {
      const app = await build(t, {
        sessionsRepository: fakeSessionsRepository,
      });

      const res = await app.inject({
        method: "DELETE",
        url: "/sessions/e237d317-f452-422e-bf92-aebcdf375cca",
      });

      assert.equal(res.statusCode, 204);
    });
  });
});
