import z from "zod";

export const VeridaBaseRecordSchema = z.object({
  _id: z.string(),
  _rev: z.string(),
  name: z.string().optional(),
  schema: z.string(),
  insertedAt: z.string().datetime(),
  modifiedAt: z.string().datetime(),
});

export const UserProfileInfoSchema = z.object({
  name: z.string(),
  country: z.string().optional(),
});
