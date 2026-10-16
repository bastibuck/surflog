import { defineRelations } from "drizzle-orm";
import { sailsTable } from "../../modules/gear/models/Sail.model.ts";
import { sessionsTable } from "../../modules/sessions/models/Session.model.ts";
import { spotsTable } from "../../modules/spots/models/Spot.model.ts";
import { brandsTable } from "../../modules/gear/models/Brand.model.ts";

const schema = {
  spots: spotsTable,
  sessions: sessionsTable,
  sails: sailsTable,
  brands: brandsTable,
};

const relations = defineRelations(schema, (relationBuilder) => ({
  sessions: {
    sail: relationBuilder.one.sails({
      from: relationBuilder.sessions.sailId,
      to: relationBuilder.sails.id,
      optional: false,
    }),

    spot: relationBuilder.one.spots({
      from: relationBuilder.sessions.spotId,
      to: relationBuilder.spots.id,
      optional: false,
    }),
  },

  spots: {
    sessions: relationBuilder.many.sessions(),
  },

  sails: {
    sessions: relationBuilder.many.sessions(),
    brand: relationBuilder.one.brands({
      from: relationBuilder.sails.brandId,
      to: relationBuilder.brands.id,
      optional: false,
    }),
  },

  brands: {
    sails: relationBuilder.many.sails(),
  },
}));

export { schema, relations };

export type Schema = typeof schema;
export type TableName = keyof Schema;
