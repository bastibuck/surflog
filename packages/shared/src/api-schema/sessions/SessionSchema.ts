import { z } from "zod";

const SessionBaseSchema = z.object({
  id: z.uuid(),
  name: z.string().max(50).nonempty(),
  date: z.iso.date(),
  rating: z.number().int().min(1).max(10),
  notes: z.string().max(500).nullable(),
  spot: z.object({
    name: z.string().max(50).nonempty(),
  }),
  sail: z.object({
    size: z.number().int().positive(),
    alias: z.string().max(30).nullable(),
    brand: z.string().max(100).nonempty(),
  }),
});

const GetSessionsListResponseSchema = SessionBaseSchema.pick({
  id: true,
  name: true,
  date: true,
}).array();

const GetSessionResponseSchema = SessionBaseSchema;

const SpotSelectionSchema = z.discriminatedUnion("action", [
  z.strictObject({
    action: z.literal("reference"),
    id: z.uuid(),
  }),
  z.strictObject({
    action: z.literal("create"),
    name: z.string().max(50).nonempty(),
  }),
]);

const BrandSelectionSchema = z.discriminatedUnion("action", [
  z.strictObject({
    action: z.literal("reference"),
    id: z.uuid(),
  }),
  z.strictObject({
    action: z.literal("create"),
    name: z.string().max(100).nonempty(),
  }),
]);

const SailSelectionSchema = z.discriminatedUnion("action", [
  z.strictObject({
    action: z.literal("reference"),
    id: z.uuid(),
  }),
  z.strictObject({
    action: z.literal("create"),
    size: z.number().int().positive(),
    alias: z.string().max(30).nullable(),
    brand: BrandSelectionSchema,
  }),
]);

const CreateSessionPayloadSchema = SessionBaseSchema.omit({
  id: true,
  spot: true,
  sail: true,
}).extend({
  spot: SpotSelectionSchema,
  sail: SailSelectionSchema,
});

const CreateSessionResponseSchema = SessionBaseSchema.pick({
  id: true,
});

export {
  GetSessionsListResponseSchema,
  GetSessionResponseSchema,
  CreateSessionPayloadSchema,
  CreateSessionResponseSchema,
};

export type CreateSessionPayload = z.infer<typeof CreateSessionPayloadSchema>;
