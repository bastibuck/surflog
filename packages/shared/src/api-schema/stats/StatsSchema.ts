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
 * Sails
 */

const GetMostUsedSailsFiltersSchema = DateFilterSchema;
const GetMostUsedSailsResponseSchema = z
  .object({
    id: z.uuid(),
    displayName: z.string(),
    count: z.number().positive().int(),
  })
  .array()
  .max(3);

const GetBestSailsFiltersSchema = DateFilterSchema;
const GetBestSailsResponseSchema = z
  .object({
    id: z.uuid(),
    displayName: z.string(),
    averageRating: z.number().min(1).max(10),
    sessionCount: z.number().positive().int(),
  })
  .array()
  .max(3);

/**
 * Spots
 */

const GetMostVisitedSpotsFiltersSchema = DateFilterSchema;
const GetMostVisitedSpotsResponseSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    count: z.number().positive().int(),
  })
  .array()
  .max(3);

const GetBestSpotsFiltersSchema = DateFilterSchema;
const GetBestSpotsResponseSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    averageRating: z.number().min(1).max(10),
    sessionCount: z.number().positive().int(),
  })
  .array()
  .max(3);

const GetAverageSpotRatingResponseSchema = z.number().min(1).max(10).nullable();

export {
  GetMostUsedSailsResponseSchema,
  GetMostUsedSailsFiltersSchema,
  GetBestSailsResponseSchema,
  GetBestSailsFiltersSchema,
  GetMostVisitedSpotsResponseSchema,
  GetMostVisitedSpotsFiltersSchema,
  GetBestSpotsResponseSchema,
  GetBestSpotsFiltersSchema,
  GetAverageSpotRatingResponseSchema,
};
