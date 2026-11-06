import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import z from "zod";

import { brandsTable } from "../modules/gear/models/Brand.model.ts";
import { sailsTable } from "../modules/gear/models/Sail.model.ts";
import { sessionsTable } from "../modules/sessions/models/Session.model.ts";
import { spotsTable } from "../modules/spots/models/Spot.model.ts";
import { relations } from "../plugins/database/schema.ts";

// load environment variables from .env.local file for getting database connection string
const { error } = dotenv.config({ path: "./.env.local", quiet: true });
if (error) {
  console.error("Error loading .env.local file:", error);
  process.exit(1);
}

// get CLI arguments and parse them to lowercase and remove the leading "--"
const args = process.argv
  .filter((arg) => arg.startsWith("--"))
  .map((arg) => arg.trim().toLowerCase().replaceAll("--", ""));

// get preset size
const PresetSizeSchema = z.enum(["small", "medium", "large", "huge"]);
const presetSize =
  PresetSizeSchema.array().safeParse(args).data?.at(0) ?? "small";

const presets: Record<
  z.infer<typeof PresetSizeSchema>,
  {
    spots: number;
    brands: number;
    sails: number;
    sessions: number;
  }
> = {
  small: {
    spots: 3,
    brands: 3,
    sails: 3,
    sessions: 10,
  },
  medium: {
    spots: 20,
    brands: 20,
    sails: 40,
    sessions: 1000,
  },
  large: {
    spots: 100,
    brands: 100,
    sails: 200,
    sessions: 10000,
  },
  huge: {
    spots: 2000,
    brands: 1000,
    sails: 2000,
    sessions: 100000,
  },
};

console.log(`Seeding database with preset: ${presetSize}`);

const db = drizzle(process.env.DATABASE_URL!, { relations });
faker.seed(123); // Seed the faker library for consistent results

try {
  // clear database tables before seeding
  await db.execute(sql`TRUNCATE TABLE sessions, sails, brands, spots CASCADE;`);

  console.log("Database cleared. Seeding now...");

  const spotIds = await db
    .insert(spotsTable)
    .values(createSpots(presets[presetSize].spots))
    .returning({ id: spotsTable.id });

  console.log(`Inserted ${spotIds.length} spots`);

  const brandIds = await db
    .insert(brandsTable)
    .values(createBrands(presets[presetSize].brands))
    .returning({ id: brandsTable.id })
    .onConflictDoNothing();

  console.log(`Inserted ${brandIds.length} brands`);

  const sailIds = await db
    .insert(sailsTable)
    .values(
      createSails(
        presets[presetSize].sails,
        brandIds.map((b) => b.id),
      ),
    )
    .returning({ id: sailsTable.id })
    .onConflictDoNothing();

  console.log(`Inserted ${sailIds.length} sails`);

  const sessionCount = presets[presetSize].sessions;
  const sessionBatchSize = 5_000;
  const sessionSpotIds = spotIds.map((s) => s.id);
  const sessionSailIds = sailIds.map((s) => s.id);

  const totalBatches = Math.ceil(sessionCount / sessionBatchSize);
  console.log(
    `Inserting ${sessionCount} sessions in ${totalBatches} batches...`,
  );

  for (let batch = 0; batch < totalBatches; batch++) {
    const batchSize = Math.min(
      sessionBatchSize,
      sessionCount - batch * sessionBatchSize,
    );

    console.log(
      `Inserting batch ${batch + 1} of ${totalBatches} (${batchSize} sessions)...`,
    );

    await db
      .insert(sessionsTable)
      .values(createSessions(batchSize, sessionSpotIds, sessionSailIds));
  }

  console.log(`Inserted ${sessionCount} sessions`);
} finally {
  await db.$client.end();
  console.log("Seeding finished. Database connection closed.");
}

// FACTORIES
function createSpots(count: number) {
  return faker.helpers.uniqueArray(faker.location.city, count).map((name) => ({
    name,
  }));
}

function createBrands(count: number) {
  const possibleBrandNames = [
    "North",
    "Duotone",
    "Cabrinha",
    "Slingshot",
    "Naish",
    "F-One",
    "Ozone",
    "Airush",
    "Core",
    "Liquid Force",
  ];

  const brandNames =
    count > possibleBrandNames.length
      ? [
          ...possibleBrandNames,
          ...faker.helpers.uniqueArray(
            faker.company.name,
            count - possibleBrandNames.length,
          ),
        ]
      : faker.helpers.arrayElements(possibleBrandNames, count);

  return brandNames.map((name) => ({
    name,
  }));
}

function createSails(count: number, brandIds: string[]) {
  return Array.from({ length: count }, () => ({
    size: faker.number.int({ min: 4, max: 17 }),
    alias: faker.helpers.maybe(
      () => faker.lorem.word({ length: { min: 1, max: 2 } }),
      {
        probability: 0.2,
      },
    ),
    brandId: faker.helpers.weightedArrayElement(
      brandIds.map((brand, idx) => ({
        value: brand,
        weight: 1 - idx / brandIds.length, // higher weight for earlier brands
      })),
    ),
  }));
}

function createSessions(count: number, spotIds: string[], sailIds: string[]) {
  return Array.from({ length: count }, () => ({
    name: faker.word.words(3),
    rating: faker.number.int({ min: 1, max: 10 }),
    notes: faker.helpers.maybe(faker.lorem.paragraph, {
      probability: 0.1,
    }),
    date: faker.date
      .past({ years: 3, refDate: "2026-10-04" })
      .toISOString()
      .split("T")[0], // format as YYYY-MM-DD
    spotId: faker.helpers.weightedArrayElement(
      spotIds.map((spotId, idx) => ({
        value: spotId,
        weight: 1 - idx / spotIds.length, // higher weight for earlier spots
      })),
    ),
    sailId: faker.helpers.weightedArrayElement(
      sailIds.map((sailId, idx) => ({
        value: sailId,
        weight: 1 - idx / sailIds.length, // higher weight for earlier sails
      })),
    ),
  }));
}
