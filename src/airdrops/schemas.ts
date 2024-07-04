import z from "zod";
import {
  EVM_ADDRESS_REGEXP,
  UserProfileInfoSchema,
  VERIDA_DID_REGEXP,
} from "../common";
import { UserActivityRecordSchema } from "../missions";

export const Airdrop1RegistrationDtoSchema = z.object({
  did: z
    .string()
    .regex(VERIDA_DID_REGEXP, { message: "Not a valid Verida DID" }),
  activityProofs: z.array(UserActivityRecordSchema),
  profile: UserProfileInfoSchema,
  ipAddress: z.string().optional(),
  termsAccepted: z.boolean().default(false),
});

export const Airdrop1ClaimDtoSchema = z.object({
  did: z
    .string()
    .regex(VERIDA_DID_REGEXP, { message: "Not a valid Verida DID" }),
  profile: UserProfileInfoSchema,
  ipAddress: z.string().optional(),
  termsAccepted: z.boolean().default(false),
  userEvmAddress: z
    .string()
    .regex(EVM_ADDRESS_REGEXP, { message: "Not a valid EVM address" }),
  userEvmAddressSignature: z.string(),
});
