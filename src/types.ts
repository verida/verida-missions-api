import { EVM_ADDRESS_REGEXP, VERIDA_DID_REGEXP } from "./utils";
import z from "zod";

export const VeridaBaseRecordSchema = z.object({
  _id: z.string(),
  _rev: z.string(),
  name: z.string().optional(),
  schema: z.string(),
  insertedAt: z.string().datetime(),
  modifiedAt: z.string().datetime(),
});

export type VeridaBaseRecord = z.infer<typeof VeridaBaseRecordSchema>;

export const UserActivitySchema = z.object({
  id: z.string(), // Not _id, this is the id of the activity, ie. 'create-verida-identity'
  status: z.enum(["todo", "pending", "completed"]).default("todo"),
  completionDate: z.string().datetime().optional(),
});

export const UserActivityRecordSchema = VeridaBaseRecordSchema.extend(
  UserActivitySchema.shape
);

export type UserActivityRecord = z.infer<typeof UserActivityRecordSchema>;

export type UserActivityStatus = "todo" | "pending" | "completed";

export const UserInfoSchema = z.object({
  name: z.string(),
  country: z.string(),
});

export type UserProfileInfo = z.infer<typeof UserInfoSchema>;

export const CreateDtoSchema = z.object({
  did: z
    .string()
    .regex(VERIDA_DID_REGEXP, { message: "Not a valid Verida DID" }),
  userWalletAddress: z
    .string()
    .regex(EVM_ADDRESS_REGEXP, { message: "Not a valid EVM address" }),
  activityProofs: z.array(UserActivityRecordSchema),
  profile: UserInfoSchema,
});

export type CreateDto = z.infer<typeof CreateDtoSchema>;
