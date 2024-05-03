import { Client as NotionClient } from "@notionhq/client";
import { Client as VeridaClient } from "@verida/client-ts";
import { isPromiseFulfilled } from "../common";
import { config } from "../config";
import { getXpPointsForActivity, validateUserActivity } from "../missions";
import { AIRDROP_1_CUTOFF_DATE, AIRDROP_1_MIN_XP_POINTS } from "./constants";
import {
  AlreadyExistsError,
  NotEnoughXpPointsError,
  NotionError,
  TermsNotAcceptedError,
} from "./errors";
import { Airdrop1SubmitProofDto } from "./types";
import { getCountryFromIp, validateCountry } from "./utils";

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

  /**
   * Check a proof for the airdrop 1 already exists. Does not return the result, to prevent data leaks.
   *
   * @param did the DID the proof has been submitted for.
   * @returns a boolean indicating whether the proof has already been submitted.
   */
  async checkAirdrop1ProofExist(did: string) {
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

      // Do not return the result, to prevent data leaks
      return result.results.length > 0;
    } catch (error) {
      throw new NotionError("Error while querying the database", undefined, {
        cause: error,
      });
    }
  }

  /**
   * Sumbit a proof for the airdrop 1.
   *
   * @param submitProofDto the DTO of the proof.
   */
  async submitAirdrop1Proof(submitProofDto: Airdrop1SubmitProofDto) {
    const { activityProofs, did, profile, ipAddress, termsAccepted } =
      submitProofDto;

    const alreadyExists = await this.checkAirdrop1ProofExist(did);
    if (alreadyExists) {
      throw new AlreadyExistsError(
        "Proof already submitted",
        "Proof already submitted"
      );
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
   * Check if a user is eligible for the airdrop 2. Does not return the result, to prevent data leaks.
   *
   * @param did the DID of the user to check.
   * @returns a boolean indicating whether the user is eligible.
   */
  async checkAirdrop2Eligibility(did: string): Promise<boolean> {
    try {
      const result = await this.notionClient.databases.query({
        database_id: config.AIRDROP_2_NOTION_DB_ID,
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

      // Do not return the result, to prevent data leaks
      return result.results.length > 0;
    } catch (error) {
      throw new NotionError("Error while querying the database", undefined, {
        cause: error,
      });
    }
  }
}
