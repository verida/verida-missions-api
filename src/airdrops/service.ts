import { Client as NotionClient } from "@notionhq/client";
import { Client as VeridaClient } from "@verida/client-ts";
import { isPromiseFulfilled } from "../common";
import { config } from "../config";
import { getXpPointsForActivity, validateUserActivity } from "../missions";
import { AIRDROP_1_CUTOFF_DATE, AIRDROP_1_MIN_XP_POINTS } from "./constants";
import {
  AlreadyClaimedError,
  AlreadyRegisteredError,
  InvalidClaimableTokenAmountError,
  NotEnoughXpPointsError,
  NotRegisteredError,
  TermsNotAcceptedError,
} from "./errors";
import {
  Airdrop1ClaimDto,
  Airdrop1ClaimSuccessResult,
  Airdrop1Record,
  Airdrop1RegistrationDto,
  Airdrop1UserStatus,
  Airdrop2CheckDto,
  Airdrop2ClaimDto,
  Airdrop2ClaimSuccessResult,
  Airdrop2Record,
  Airdrop2UserStatus,
} from "./types";
import {
  closeAirdrop1ClaimInNotion,
  closeAirdrop2ClaimInNotion,
  getCountryFromIp,
  transformNotionRecordToAirdrop1,
  transformNotionRecordToAirdrop2,
  validateCountry,
} from "./utils";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { NotionError } from "../notion";
import {
  getBlockchainExplorerTransactionUrl,
  isTransactionSuccessfull,
  transferVdaTokens,
} from "../blockchain";

export class Service {
  private notionClient: NotionClient;
  private veridaClient: VeridaClient;

  constructor() {
    this.notionClient = new NotionClient({
      auth: config.NOTION_API_KEY,
    });
    this.veridaClient = new VeridaClient({
      environment: config.VERIDA_NETWORK,
    });
  }

  private async getAirdrop1Record(
    did: string
  ): Promise<Airdrop1Record | undefined> {
    try {
      const result = await this.notionClient.databases.query({
        database_id: config.AIRDROP_1_NOTION_DB_ID,
        filter: {
          or: [
            {
              property: "DID",
              title: {
                equals: did,
              },
            },
          ],
        },
      });

      if (result.results.length === 0) {
        return undefined;
      }

      const record = result.results[0] as DatabaseObjectResponse;

      const airdrop1Record: Airdrop1Record =
        transformNotionRecordToAirdrop1(record);

      return airdrop1Record;
    } catch (error) {
      throw new NotionError("Error while querying the database", undefined, {
        cause: error,
      });
    }
  }

  /**
   * Get the status of a user for the airdrop 1. Does not return detailed
   * result, to prevent data leaks.
   *
   * @param did the DID the proof has been submitted for.
   * @returns the status for the user.
   */
  async getAirdrop1Status(did: string): Promise<Airdrop1UserStatus> {
    let record = await this.getAirdrop1Record(did);

    if (record && !record.claimed && record.claimTransactionHash) {
      // Check if the transaction has been completed
      const isClaimed = await isTransactionSuccessfull(
        record.claimTransactionHash
      );

      if (isClaimed) {
        // Update the Notion record
        await closeAirdrop1ClaimInNotion(
          this.notionClient,
          record.id,
          record.claimableAmount as number
          // If the transaction has been initiated, the claimable amount
          // should be defined
        );

        record = await this.getAirdrop1Record(did);
      }
    }

    return {
      isRegistered: !!record, // If the record exists, the user is registered
      isClaimed: record?.claimed ?? false,
      claimableTokenAmount:
        record && !record.claimed
          ? record.claimableAmount ?? undefined
          : undefined,
      claimedTokenAmount:
        record && record.claimed
          ? record.claimedAmount ?? undefined
          : undefined,
      claimTransactionUrl:
        record && record.claimed && record.claimTransactionHash
          ? getBlockchainExplorerTransactionUrl(record?.claimTransactionHash)
          : undefined,
    };
  }

  /**
   * Register for the airdrop 1.
   *
   * @param registrationDto the DTO of the registration.
   */
  async registerAirdrop1(
    registrationDto: Airdrop1RegistrationDto
  ): Promise<void> {
    const { activityProofs, did, profile, ipAddress, termsAccepted } =
      registrationDto;

    const { isRegistered } = await this.getAirdrop1Status(did);
    if (isRegistered) {
      throw new AlreadyRegisteredError();
    }

    //  ----- Terms and Conditions -----

    if (!termsAccepted) {
      throw new TermsNotAcceptedError();
    }

    //  ----- Country -----

    // Check country fromn profile
    validateCountry(profile.country); // Throw an error if invalid

    // Check country from user's location
    const requesterCountry = ipAddress
      ? await getCountryFromIp(ipAddress)
      : undefined;
    validateCountry(requesterCountry); // Throw an error if invalid

    //  ----- Check user activities and XP points -----

    const userActivityValidationResults = await Promise.allSettled(
      activityProofs.map(async (activity) => {
        const isValid = await validateUserActivity(
          this.veridaClient,
          activity,
          did
        );
        return { activity, isValid };
      })
    );

    const validActivities = userActivityValidationResults
      .filter(isPromiseFulfilled)
      .filter((result) => result.value.isValid)
      .map((result) => result.value.activity);

    const totalXpPoints = validActivities
      .map((activity) => getXpPointsForActivity(activity.id))
      .reduce((a, b) => a + b, 0);

    const totalXpPointsBeforeCuttoff = validActivities
      .filter((activity) => {
        // Filtering out activities completed after the cutt off date
        return (
          activity.completionDate &&
          activity.completionDate < AIRDROP_1_CUTOFF_DATE
        );
      })
      .map((activity) => getXpPointsForActivity(activity.id))
      .reduce((a, b) => a + b, 0);

    if (totalXpPointsBeforeCuttoff < AIRDROP_1_MIN_XP_POINTS) {
      const message = `From your ${totalXpPoints} XP points, ${totalXpPointsBeforeCuttoff} have been earned before the eligibility date (${new Date(AIRDROP_1_CUTOFF_DATE).toLocaleDateString()})`;
      throw new NotEnoughXpPointsError(undefined, message);
    }

    // Save into Notion DB
    try {
      await this.notionClient.pages.create({
        parent: {
          type: "database_id",
          database_id: config.AIRDROP_1_NOTION_DB_ID,
        },
        properties: {
          "DID": {
            type: "title",
            title: [
              {
                type: "text",
                text: {
                  content: did,
                },
              },
            ],
          },
          "Total XP points": {
            type: "number",
            number: totalXpPoints,
          },
          "XP points before cut-off": {
            type: "number",
            number: totalXpPointsBeforeCuttoff,
          },
          "Country": {
            type: "rich_text",
            rich_text: profile.country
              ? [
                  {
                    type: "text",
                    text: {
                      content: profile.country,
                    },
                  },
                ]
              : [],
          },
          "Terms accepted": {
            type: "checkbox",
            checkbox: termsAccepted,
          },
        },
      });
    } catch (error) {
      throw new NotionError("Error while creating a new record", undefined, {
        cause: error,
      });
    }
  }

  /**
   * Claim the airdrop 1.
   *
   * @param claimDto the DTO for the claim
   */
  async claimAirdrop1(
    claimDto: Airdrop1ClaimDto
  ): Promise<Airdrop1ClaimSuccessResult> {
    const { did, termsAccepted, userEvmAddress } = claimDto;

    const airdrop1Record = await this.getAirdrop1Record(did);

    if (!airdrop1Record) {
      throw new NotRegisteredError();
    }

    if (airdrop1Record.claimed) {
      throw new AlreadyClaimedError();
    }

    // In case a claim transaction has been initiated but the record hasn't
    // been updated yet with the `claimed` boolean.
    if (airdrop1Record.claimTransactionHash) {
      // Check if the transaction has been completed
      const isClaimed = await isTransactionSuccessfull(
        airdrop1Record.claimTransactionHash
      );

      if (isClaimed) {
        // Update the Notion record
        await closeAirdrop1ClaimInNotion(
          this.notionClient,
          airdrop1Record.id,
          airdrop1Record.claimableAmount as number
          // If the transaction has been initiated, the claimable amount
          // should be defined
        );

        throw new AlreadyClaimedError();
      }
    }

    if (!termsAccepted) {
      throw new TermsNotAcceptedError();
    }

    if (airdrop1Record.claimableAmount === null) {
      throw new InvalidClaimableTokenAmountError(
        "The claimable token amount is null"
      );
    }

    if (airdrop1Record.claimableAmount <= 0) {
      throw new InvalidClaimableTokenAmountError(
        "The claimable token amount is negative or zero"
      );
    }

    // Transfer tokens
    const transactionHash = await transferVdaTokens({
      to: userEvmAddress,
      amount: airdrop1Record.claimableAmount,
      onTransferStarted: async (txHash) => {
        try {
          await this.notionClient.pages.update({
            page_id: airdrop1Record.id,
            properties: {
              "Transaction Hash": {
                type: "rich_text",
                rich_text: [
                  {
                    type: "text",
                    text: {
                      content: txHash,
                    },
                  },
                ],
              },
            },
          });
        } catch (error) {
          throw new NotionError("Error while updating a record", undefined, {
            cause: error,
          });
        }
      },
    });

    // Update the Notion record
    await closeAirdrop1ClaimInNotion(
      this.notionClient,
      airdrop1Record.id,
      airdrop1Record.claimableAmount
    );

    return {
      transactionExplorerUrl:
        getBlockchainExplorerTransactionUrl(transactionHash),
      claimedTokenAmount: airdrop1Record.claimableAmount,
    };
  }

  /**
   * Check if a user is registered for the airdrop 2. Does not return the result, to prevent data leaks.
   *
   * @deprecated
   *
   * @param wallet the wallet address of the user to check.
   * @returns a boolean indicating whether the user is eligible.
   */
  async checkAirdrop2RegistrationExist(wallet: string): Promise<boolean> {
    try {
      const result = await this.notionClient.databases.query({
        database_id: config.AIRDROP_2_NOTION_DB_ID,
        filter: {
          or: [
            {
              property: "Wallet",
              title: {
                equals: wallet,
              },
            },
          ],
        },
      });

      // Do not return the result, to prevent data leaks
      return result.results.length > 0;
    } catch (error) {
      throw new NotionError("Error while querying the database", undefined, {
        cause: error,
      });
    }
  }

  private async getAirdrop2Record(
    wallet: string
  ): Promise<Airdrop2Record | undefined> {
    try {
      const result = await this.notionClient.databases.query({
        database_id: config.AIRDROP_2_NOTION_DB_ID,
        filter: {
          or: [
            {
              property: "Wallet",
              title: {
                equals: wallet,
              },
            },
          ],
        },
      });

      if (result.results.length === 0) {
        return undefined;
      }

      const record = result.results[0] as DatabaseObjectResponse;

      const airdrop2Record = transformNotionRecordToAirdrop2(record);

      return airdrop2Record;
    } catch (error) {
      throw new NotionError("Error while querying the database", undefined, {
        cause: error,
      });
    }
  }

  /**
   * Get the status of a user for the airdrop 2. Does not return detailed
   * result, to prevent data leaks.
   *
   * @param wallet the wallet address of the user to check.
   * @returns the status for the user.
   */
  async getAirdrop2Status(
    checkDto: Airdrop2CheckDto
  ): Promise<Airdrop2UserStatus> {
    const { profile, ipAddress, userEvmAddress } = checkDto;

    // Check country fromn profile
    validateCountry(profile.country); // Throw an error if invalid

    // Check country from user's location
    const requesterCountry = ipAddress
      ? await getCountryFromIp(ipAddress)
      : undefined;
    validateCountry(requesterCountry); // Throw an error if invalid

    let record = await this.getAirdrop2Record(userEvmAddress);

    if (record && !record.claimed && record.claimTransactionHash) {
      // Check if the transaction has been completed
      const isClaimed = await isTransactionSuccessfull(
        record.claimTransactionHash
      );

      if (isClaimed) {
        // Update the Notion record
        await closeAirdrop2ClaimInNotion(
          this.notionClient,
          record.id,
          record.claimableAmount as number
          // If the transaction has been initiated, the claimable amount
          // should be defined
        );

        record = await this.getAirdrop2Record(userEvmAddress);
      }
    }

    return {
      isRegistered: !!record, // If the record exists, the user is registered
      isClaimed: record?.claimed ?? false,
      claimableTokenAmount:
        record && !record.claimed
          ? record.claimableAmount ?? undefined
          : undefined,
      claimedTokenAmount:
        record && record.claimed
          ? record.claimedAmount ?? undefined
          : undefined,
      claimTransactionUrl:
        record && record.claimed && record.claimTransactionHash
          ? getBlockchainExplorerTransactionUrl(record?.claimTransactionHash)
          : undefined,
    };
  }

  /**
   * Claim the airdrop 2.
   *
   * @param claimDto the DTO for the claim
   */
  async claimAirdrop2(
    claimDto: Airdrop2ClaimDto
  ): Promise<Airdrop2ClaimSuccessResult> {
    const { termsAccepted, userEvmAddress, profile, ipAddress } = claimDto;

    // Check country fromn profile
    validateCountry(profile.country); // Throw an error if invalid

    // Check country from user's location
    const requesterCountry = ipAddress
      ? await getCountryFromIp(ipAddress)
      : undefined;
    validateCountry(requesterCountry); // Throw an error if invalid

    const airdrop2Record = await this.getAirdrop2Record(userEvmAddress);

    if (!airdrop2Record) {
      throw new NotRegisteredError();
    }

    if (airdrop2Record.claimed) {
      throw new AlreadyClaimedError();
    }

    // In case a claim transaction has been initiated but the record hasn't
    // been updated yet with the `claimed` boolean.
    if (airdrop2Record.claimTransactionHash) {
      // Check if the transaction has been completed
      const isClaimed = await isTransactionSuccessfull(
        airdrop2Record.claimTransactionHash
      );

      if (isClaimed) {
        // Update the Notion record
        await closeAirdrop2ClaimInNotion(
          this.notionClient,
          airdrop2Record.id,
          airdrop2Record.claimableAmount as number
          // If the transaction has been initiated, the claimable amount
          // should be defined
        );

        throw new AlreadyClaimedError();
      }
    }

    if (!termsAccepted) {
      throw new TermsNotAcceptedError();
    }

    if (airdrop2Record.claimableAmount === null) {
      throw new InvalidClaimableTokenAmountError(
        "The claimable token amount is null"
      );
    }

    if (airdrop2Record.claimableAmount <= 0) {
      throw new InvalidClaimableTokenAmountError(
        "The claimable token amount is negative or zero"
      );
    }

    // Transfer tokens
    const transactionHash = await transferVdaTokens({
      to: userEvmAddress,
      amount: airdrop2Record.claimableAmount,
      onTransferStarted: async (txHash) => {
        try {
          await this.notionClient.pages.update({
            page_id: airdrop2Record.id,
            properties: {
              "Transaction Hash": {
                type: "rich_text",
                rich_text: [
                  {
                    type: "text",
                    text: {
                      content: txHash,
                    },
                  },
                ],
              },
            },
          });
        } catch (error) {
          throw new NotionError("Error while updating a record", undefined, {
            cause: error,
          });
        }
      },
    });

    // Update the Notion record
    await closeAirdrop2ClaimInNotion(
      this.notionClient,
      airdrop2Record.id,
      airdrop2Record.claimableAmount
    );

    return {
      transactionExplorerUrl:
        getBlockchainExplorerTransactionUrl(transactionHash),
      claimedTokenAmount: airdrop2Record.claimableAmount,
    };
  }
}
