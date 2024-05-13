import z from "zod";
import { Airdrop1SubmitProofDtoSchema } from "./schemas";

export type Airdrop1SubmitProofDto = z.infer<
  typeof Airdrop1SubmitProofDtoSchema
>;

export type Airdrop1CheckProofExistSuccessResponse = {
  status: "success";
  exists: boolean;
};

export type Airdrop1SubmitProofSuccessResponse = {
  status: "success";
};

export type Airdrop2CheckEligibilitySuccessResponse = {
  status: "success";
  isEligible: boolean;
};
