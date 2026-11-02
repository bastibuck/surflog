import { z } from "zod";

// generic
const DateFilterSchema = z
  .object({
    from: z.iso.date().optional(),
    to: z.iso.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.from && data.to) {
      if (data.from > data.to) {
        ctx.addIssue({
          code: "custom",
          message:
            "The 'from' date must be less than or equal to the 'to' date",
          path: ["to"],
        });
      }
    }
  });

/**
 * most used sails
 */
const GetMostUsedSailsResponseSchema = z
  .object({
    id: z.uuid(),
    displayName: z.string(),
    count: z.number().positive().int(),
  })
  .array()
  .max(3);

const GetMostUsedSailsFiltersSchema = DateFilterSchema;

/**
 * most visited spots
 */
const GetMostVisitedSpotsResponseSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    count: z.number().positive().int(),
  })
  .array()
  .max(3);

const GetMostVisitedSpotsFiltersSchema = DateFilterSchema;

/**
 * best spots by session ratings
 */
const GetBestSpotsResponseSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    averageRating: z.number().min(1).max(10),
    sessionCount: z.number().positive().int(),
  })
  .array()
  .max(3);

const GetBestSpotsFiltersSchema = DateFilterSchema;

export {
  GetMostUsedSailsResponseSchema,
  GetMostUsedSailsFiltersSchema,
  GetMostVisitedSpotsResponseSchema,
  GetMostVisitedSpotsFiltersSchema,
  GetBestSpotsResponseSchema,
  GetBestSpotsFiltersSchema,
};
