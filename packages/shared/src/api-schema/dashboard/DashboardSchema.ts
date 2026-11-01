import { z } from "zod";

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

const GetMostUsedSailsFiltersSchema = z
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

export { GetMostUsedSailsResponseSchema, GetMostUsedSailsFiltersSchema };
