import { eq } from "drizzle-orm/pg-core/expressions";
import type { FastifyInstance } from "fastify";

import type { CreateSessionPayload } from "@surflog/shared/api-schema/sessions/SessionSchema";
import { EntityNotFoundError, withDatabaseResult } from "../../lib/database.ts";
import type { Repository } from "../../lib/types/Repository.ts";
import { brandsTable } from "../gear/models/Brand.model.ts";
import { sailsTable } from "../gear/models/Sail.model.ts";
import { spotsTable } from "../spots/models/Spot.model.ts";
import { sessionsTable } from "./models/Session.model.ts";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

const createSessionsRepository = (db: FastifyInstance["db"]) => {
  return {
    list: () =>
      withDatabaseResult(() =>
        db.query.sessions.findMany({
          columns: {
            id: true,
            name: true,
            date: true,
          },
          orderBy: {
            date: "desc",
          },
        }),
      ),

    findById: (id: string) =>
      withDatabaseResult(async () => {
        const session = await db.query.sessions.findFirst({
          columns: {
            id: true,
            name: true,
            date: true,
            rating: true,
            notes: true,
          },
          where: {
            id,
          },
          with: {
            spot: {
              columns: {
                name: true,
              },
            },
            sail: {
              columns: {
                size: true,
                alias: true,
              },
              with: {
                brand: {
                  columns: {
                    name: true,
                  },
                },
              },
            },
          },
        });

        if (session === undefined) {
          throw new EntityNotFoundError("sessions", id);
        }

        return {
          ...session,
          sail: {
            ...session.sail,
            brand: session.sail.brand.name,
          },
        };
      }),

    create: (session: CreateSessionPayload) =>
      withDatabaseResult(() =>
        db.transaction(async (tx) => {
          let spotId: InferInsertModel<typeof spotsTable>["id"];
          let sailId: InferInsertModel<typeof sailsTable>["id"];

          if (session.sail.action === "create") {
            let brandId: InferInsertModel<typeof brandsTable>["id"];

            if (session.sail.brand.action === "create") {
              brandId = await createBrand(tx, session.sail.brand);
            } else {
              brandId = await resolveBrandId(tx, session.sail.brand.id);
            }

            sailId = await createSail(tx, {
              size: session.sail.size,
              alias: session.sail.alias,
              brandId: brandId,
            });
          } else {
            sailId = await resolveSailId(tx, session.sail.id);
          }

          if (session.spot.action === "create") {
            spotId = await createSpot(tx, session.spot);
          } else {
            spotId = await resolveSpotId(tx, session.spot.id);
          }

          const [newSession] = await tx
            .insert(sessionsTable)
            .values({
              date: session.date,
              name: session.name,
              rating: session.rating,
              notes: session.notes,
              sailId: sailId,
              spotId: spotId,
            })
            .returning();

          return {
            id: newSession.id,
          };
        }),
      ),

    delete: (id: string) =>
      withDatabaseResult(async () => {
        await db.delete(sessionsTable).where(eq(sessionsTable.id, id));
      }),
  } satisfies Repository;
};

export { createSessionsRepository };

export type SessionsRepository = ReturnType<typeof createSessionsRepository>;

const resolveBrandId = async (
  tx: FastifyInstance["db"],
  brandId: InferSelectModel<typeof brandsTable>["id"],
) => {
  const existingBrand = await tx.query.brands.findFirst({
    columns: { id: true },
    where: {
      id: brandId,
    },
  });

  if (!existingBrand) {
    throw new EntityNotFoundError("brands", brandId);
  }

  return existingBrand.id;
};

const createBrand = async (
  tx: FastifyInstance["db"],
  brand: InferInsertModel<typeof brandsTable>,
) => {
  const [newBrand] = await tx
    .insert(brandsTable)
    .values({
      name: brand.name,
    })
    .returning();

  return newBrand.id;
};

const resolveSailId = async (
  tx: FastifyInstance["db"],
  sailId: InferSelectModel<typeof sailsTable>["id"],
) => {
  const existingSail = await tx.query.sails.findFirst({
    columns: { id: true, brandId: true },
    where: {
      id: sailId,
    },
  });

  if (!existingSail) {
    throw new EntityNotFoundError("sails", sailId);
  }

  return existingSail.id;
};

const createSail = async (
  tx: FastifyInstance["db"],
  sail: InferInsertModel<typeof sailsTable>,
) => {
  const [newSail] = await tx
    .insert(sailsTable)
    .values({
      size: sail.size,
      alias: sail.alias,
      brandId: sail.brandId,
    })
    .returning();

  return newSail.id;
};

const resolveSpotId = async (
  tx: FastifyInstance["db"],
  spotId: InferSelectModel<typeof spotsTable>["id"],
) => {
  const existingSpot = await tx.query.spots.findFirst({
    columns: { id: true },
    where: {
      id: spotId,
    },
  });

  if (!existingSpot) {
    throw new EntityNotFoundError("spots", spotId);
  }

  return existingSpot.id;
};

const createSpot = async (
  tx: FastifyInstance["db"],
  spot: InferInsertModel<typeof spotsTable>,
) => {
  const [newSpot] = await tx
    .insert(spotsTable)
    .values({
      name: spot.name,
    })
    .returning();

  return newSpot.id;
};
