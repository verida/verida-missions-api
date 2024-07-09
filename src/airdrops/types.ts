import z from "zod";
import {
  Airdrop1ClaimDtoSchema,
  Airdrop1RegistrationDtoSchema,
  Airdrop2CheckDtoSchema,
  Airdrop2ClaimDtoSchema,
} from "./schemas";

// ---- Airdrop 1 ----

export type Airdrop1Record = {
  id: string;
  did: string;
  country: string | null;
  termsAccepted: boolean;
  totalXPPoints: number | null;
  totalXPPointsBeforeCutOff: number | null;
  claimableAmount: number | null;
  claimed: boolean;
  claimedAmount: number | null;
  claimTransactionUrl: string | null;
};

export type Airdrop1UserStatus = {
  isRegistered: boolean;
  isClaimed: boolean;
  claimableTokenAmount: number | null;
  claimedTokenAmount: number | null;
  claimTransactionUrl: string | null;
};

export type Airdrop1RegistrationDto = z.infer<
  typeof Airdrop1RegistrationDtoSchema
>;

export type Airdrop1CheckSuccessResponse = {
  status: "success";
  /**
   * @deprecated use isRegistered instead
   */
  exists: boolean;
} & Airdrop1UserStatus;

export type Airdrop1RegisterSuccessResponse = {
  status: "success";
};

export type Airdrop1ClaimDto = z.infer<typeof Airdrop1ClaimDtoSchema>;

export type Airdrop1ClaimSuccessResult = {
  transactionExplorerUrl: string;
  claimedTokenAmount: number;
};

export type Airdrop1ClaimSuccessResponse = {
  status: "success";
} & Airdrop1ClaimSuccessResult;

// ---- Airdrop 2 ----

export type Airdrop2Record = {
  id: string;
  walletAddress: string;
  claimableAmount: number | null;
  claimed: boolean;
  claimedAmount: number | null;
  claimTransactionUrl: string | null;
};

export type Airdrop2UserStatus = {
  isRegistered: boolean;
  isClaimed: boolean;
  claimableTokenAmount: number | null;
  claimedTokenAmount: number | null;
  claimTransactionUrl: string | null;
};

export type Airdrop2CheckDto = z.infer<typeof Airdrop2CheckDtoSchema>;

/**
 * @deprecated use Airdrop2CheckSuccessResponse instead
 */
export type Airdrop2LegacyCheckSuccessResponse = {
  status: "success";
  /**
   * @deprecated use isRegistered instead
   */
  isEligible: boolean;
  isRegistered: boolean;
};

export type Airdrop2CheckSuccessResponse = {
  status: "success";
} & Airdrop2UserStatus;

export type Airdrop2ClaimDto = z.infer<typeof Airdrop2ClaimDtoSchema>;

export type Airdrop2ClaimSuccessResult = {
  transactionExplorerUrl: string;
  claimedTokenAmount: number;
};

export type Airdrop2ClaimSuccessResponse = {
  status: "success";
} & Airdrop2ClaimSuccessResult;
