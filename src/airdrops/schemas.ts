import z from "zod";
import {
  EVM_ADDRESS_REGEXP,
  UserProfileInfoSchema,
  VERIDA_DID_REGEXP,
} from "../common";
import { UserActivityRecordSchema } from "../missions";

// ----- Airdrop 1 -----

export const Airdrop1RegistrationDtoSchema = z.object({
  did: z.string().regex(VERIDA_DID_REGEXP, { message: "Invalid Verida DID" }),
  activityProofs: z.array(UserActivityRecordSchema),
  profile: UserProfileInfoSchema,
  ipAddress: z.string().optional(),
  termsAccepted: z.boolean().default(false),
});

export const Airdrop1ClaimDtoSchema = z.object({
  did: z.string().regex(VERIDA_DID_REGEXP, { message: "Invalid Verida DID" }),
  termsAccepted: z.boolean().default(false),
  userEvmAddress: z
    .string()
    .regex(EVM_ADDRESS_REGEXP, { message: "Invalid EVM address" }),
  userEvmAddressSignature: z.string(),
});

// ----- Airdrop 2 -----

export const Airdrop2CheckDtoSchema = z.object({
  did: z.string().regex(VERIDA_DID_REGEXP, { message: "Invalid Verida DID" }),
  profile: UserProfileInfoSchema,
  ipAddress: z.string().optional(),
  termsAccepted: z.boolean().default(false),
  userEvmAddress: z
    .string()
    .regex(EVM_ADDRESS_REGEXP, { message: "Invalid EVM address" }),
  userEvmAddressSignature: z.string(),
});

export const Airdrop2ClaimDtoSchema = z.object({
  did: z.string().regex(VERIDA_DID_REGEXP, { message: "Invalid Verida DID" }),
  profile: UserProfileInfoSchema,
  ipAddress: z.string().optional(),
  termsAccepted: z.boolean().default(false),
  userEvmAddress: z
    .string()
    .regex(EVM_ADDRESS_REGEXP, { message: "Invalid EVM address" }),
  userEvmAddressSignature: z.string(),
});
