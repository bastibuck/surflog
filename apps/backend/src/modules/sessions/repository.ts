import { eq } from "drizzle-orm/pg-core/expressions";
import type { FastifyInstance } from "fastify";

import { EntityNotFoundError, handleDbErrors } from "../../lib/database.ts";
import { success } from "../../lib/typed-result.ts";
import type { Repository } from "../../lib/types/Repository.ts";
import { sessionsTable } from "./models/Session.model.ts";
import type { CreateSessionPayload } from "@surflog/shared/api-schema/sessions/SessionSchema";
import { brandsTable } from "../gear/models/Brand.model.ts";
import { sailsTable } from "../gear/models/Sail.model.ts";
import { spotsTable } from "../spots/models/Spot.model.ts";

const createSessionsRepository = (db: FastifyInstance["db"]) => {
  return {
    list: async () =>
      success(
        await db.query.sessions.findMany({
          columns: {
            id: true,
            name: true,
            date: true,
          },
        }),
      ),

    findById: async (id: string) => {
      try {
        const session = await db.query.sessions.findFirst({
          columns: {
            id: true,
            name: true,
            date: true,
            rating: true,
            notes: true,
          },
          where: {
            id: id,
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

        return success({
          ...session,
          sail: {
            ...session.sail,
            brand: session.sail.brand.name,
          },
        });
      } catch (err) {
        return handleDbErrors(err);
      }
    },

    create: async (session: CreateSessionPayload) => {
      try {
        await db.transaction(async (tx) => {
          const brandId = await resolveBrandId(tx, session.sail.brand);
          const sailId = await resolveSailId(tx, session.sail, brandId);
          const spotId = await resolveSpotId(tx, session.spot);

          await tx.insert(sessionsTable).values({
            date: session.date,
            name: session.name,
            rating: session.rating,
            notes: session.notes,
            sailId: sailId,
            spotId: spotId,
          });
        });

        return success(undefined);
      } catch (err) {
        return handleDbErrors(err);
      }
    },

    delete: async (id: string) => {
      try {
        return success(
          await db.delete(sessionsTable).where(eq(sessionsTable.id, id)),
        );
      } catch (err) {
        return handleDbErrors(err);
      }
    },
  } satisfies Repository;
};

export { createSessionsRepository };

export type SessionsRepository = ReturnType<typeof createSessionsRepository>;

const resolveBrandId = async (
  tx: FastifyInstance["db"],
  brand: CreateSessionPayload["sail"]["brand"],
) => {
  if (brand.id) {
    const existingBrand = await tx.query.brands.findFirst({
      columns: { id: true },
      where: {
        id: brand.id,
      },
    });

    if (!existingBrand) {
      throw new EntityNotFoundError("brands", brand.name);
    }

    return existingBrand.id;
  }

  const [newBrand] = await tx
    .insert(brandsTable)
    .values({
      name: brand.name,
    })
    .returning();

  if (!newBrand) {
    throw new EntityNotFoundError("brands", brand.name);
  }

  return newBrand.id;
};

const resolveSailId = async (
  tx: FastifyInstance["db"],
  sail: CreateSessionPayload["sail"],
  brandId: string,
) => {
  if (sail.id) {
    const existingSail = await tx.query.sails.findFirst({
      columns: { id: true },
      where: {
        id: sail.id,
      },
    });

    if (!existingSail) {
      throw new EntityNotFoundError("sails", `${sail.brand.name} ${sail.size}`);
    }

    return existingSail.id;
  }

  const [newSail] = await tx
    .insert(sailsTable)
    .values({
      size: sail.size,
      alias: sail.alias,
      brandId: brandId,
    })
    .returning();

  if (!newSail) {
    throw new EntityNotFoundError("sails", `${sail.brand.name} ${sail.size}`);
  }

  return newSail.id;
};

const resolveSpotId = async (
  tx: FastifyInstance["db"],
  spot: CreateSessionPayload["spot"],
) => {
  if (spot.id) {
    const existingSpot = await tx.query.spots.findFirst({
      columns: { id: true },
      where: {
        id: spot.id,
      },
    });

    if (!existingSpot) {
      throw new EntityNotFoundError("spots", spot.name);
    }

    return existingSpot.id;
  }

  const [newSpot] = await tx
    .insert(spotsTable)
    .values({
      name: spot.name,
    })
    .returning();

  if (!newSpot) {
    throw new EntityNotFoundError("spots", spot.name);
  }

  return newSpot.id;
};
