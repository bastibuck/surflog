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

const CreateSessionPayloadSchema = SessionBaseSchema.omit({
  id: true,
}).extend({
  spot: z.object({
    id: z.uuid().nullable(),
    name: z.string().max(50).nonempty(),
  }),
  sail: z.object({
    id: z.uuid().nullable(),
    size: z.number().int().positive(),
    alias: z.string().max(30).nullable(),
    brand: z.object({
      id: z.uuid().nullable(),
      name: z.string().max(100).nonempty(),
    }),
  }),
});

export {
  GetSessionsListResponseSchema,
  GetSessionResponseSchema,
  CreateSessionPayloadSchema,
};

export type CreateSessionPayload = z.infer<typeof CreateSessionPayloadSchema>;
