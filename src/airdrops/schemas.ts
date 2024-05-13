import z from "zod";
import { UserProfileInfoSchema, VERIDA_DID_REGEXP } from "../common";
import { UserActivityRecordSchema } from "../missions";

export const Airdrop1SubmitProofDtoSchema = z.object({
  did: z
    .string()
    .regex(VERIDA_DID_REGEXP, { message: "Not a valid Verida DID" }),
  activityProofs: z.array(UserActivityRecordSchema),
  profile: UserProfileInfoSchema,
  ipAddress: z.string().optional(),
  termsAccepted: z.boolean().default(false),
});
