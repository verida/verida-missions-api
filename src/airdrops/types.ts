import z from "zod";
import {
  Airdrop1ClaimDtoSchema,
  Airdrop1RegistrationDtoSchema,
} from "./schemas";

export type Airdrop1RegistrationDto = z.infer<
  typeof Airdrop1RegistrationDtoSchema
>;

export type Airdrop1CheckSuccessResponse = {
  status: "success";
  isRegistered: boolean;
  /**
   * @deprecated use isRegistered instead
   */
  exists: boolean;
};

export type Airdrop1RegisterSuccessResponse = {
  status: "success";
};

export type Airdrop1ClaimDto = z.infer<typeof Airdrop1ClaimDtoSchema>;

export type Airdrop1ClaimSuccessResponse = {
  status: "success";
  // TODO: Add transaction hash is possible
};

export type Airdrop2CheckSuccessResponse = {
  status: "success";
  isRegistered: boolean;
  /**
   * @deprecated use isRegistered instead
   */
  isEligible: boolean;
};
