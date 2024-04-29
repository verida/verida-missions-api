import z from "zod";
import {
  UserProfileInfoSchema,
  EVM_ADDRESS_REGEXP,
  VERIDA_DID_REGEXP,
} from "../common";
import { UserActivityRecordSchema } from "../missions";

export const CreateDtoSchema = z.object({
  did: z
    .string()
    .regex(VERIDA_DID_REGEXP, { message: "Not a valid Verida DID" }),
  userWalletAddress: z
    .string()
    .regex(EVM_ADDRESS_REGEXP, { message: "Not a valid EVM address" }),
  activityProofs: z.array(UserActivityRecordSchema),
  profile: UserProfileInfoSchema,
});

export type CreateDto = z.infer<typeof CreateDtoSchema>;
