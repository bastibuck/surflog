import { defineRelations } from "drizzle-orm";
import { brandsTable } from "../../modules/gear/models/Brand.model.ts";
import {
  sailsTable,
  sailsTableConstraints,
} from "../../modules/gear/models/Sail.model.ts";
import {
  sessionsTable,
  sessionsTableConstraints,
} from "../../modules/sessions/models/Session.model.ts";
import { spotsTable } from "../../modules/spots/models/Spot.model.ts";
import { sessionSharesTable } from "../../modules/sharing/models/SessionShare.model.ts";

const schema = {
  spots: spotsTable,
  sessions: sessionsTable,
  sails: sailsTable,
  brands: brandsTable,
  session_shares: sessionSharesTable,
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

    share: relationBuilder.one.session_shares({
      from: relationBuilder.sessions.id,
      to: relationBuilder.session_shares.sessionId,
      optional: true,
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

  sessionShares: {
    session: relationBuilder.one.sessions({
      from: relationBuilder.session_shares.sessionId,
      to: relationBuilder.sessions.id,
      optional: false,
    }),
  },
}));

const constraints = {
  ...sailsTableConstraints,
  ...sessionsTableConstraints,
};

export { relations, schema };

export type Schema = typeof schema;
export type TableName = keyof Schema;
export type Constraint = (typeof constraints)[keyof typeof constraints];
