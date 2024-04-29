import { Client as NotionClient } from "@notionhq/client";
import { Client as VeridaClient } from "@verida/client-ts";
import { config } from "../config";
import { UserActivityRecord, getXpPointsForActivity } from "../missions";
import { MIN_XP_POINTS, EARLY_ADOPTER_CUTOFF_DATE } from "./constants";
import { Airdrop1SubmitProofDto } from "./types";

export class Service {
  private notion: NotionClient;
  private verida: VeridaClient;

  constructor() {
    this.notion = new NotionClient({
      auth: config.NOTION_API_KEY,
    });
    this.verida = new VeridaClient({
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
    const result = await this.notion.databases.query({
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
  }

  /**
   * Sumbit a proof for the airdrop 1.
   *
   * @param submitProofDto the DTO of the proof.
   */
  async submitAirdrop1Proof(submitProofDto: Airdrop1SubmitProofDto) {
    // TODO: Check all conditions
    // - proof records are valid
    // - Minimum XP points
    // - Country whitelist
    // - Cutoff date

    // Save into Notion DB
    try {
      await this.notion.pages.create({
        parent: {
          type: "database_id",
          database_id: config.AIRDROP_1_NOTION_DB_ID,
        },
        properties: {
          DID: {
            type: "title",
            title: [
              {
                type: "text",
                text: {
                  content: submitProofDto.did,
                },
              },
            ],
          },
          Name: {
            type: "rich_text",
            rich_text: [
              {
                type: "text",
                text: {
                  content: submitProofDto.profile.name,
                },
              },
            ],
          },
          Country: {
            type: "rich_text",
            rich_text: [
              {
                type: "text",
                text: {
                  content: submitProofDto.profile.country,
                },
              },
            ],
          },
        },
      });
    } catch (error) {
      throw new Error("Error while creating a new record");
    }
  }

  // =====================================================================

  async checkEarlyAdopterWhitelist(address: string) {
    // Check the DID creation date is before EARLY_ADOPTER_CUTOFF_DATE
    try {
      const userDid = await this.verida.didClient.get(address);
      const didData = userDid.export();

      if (didData.created && didData.created < EARLY_ADOPTER_CUTOFF_DATE) {
        return true;
      }

      return false;
    } catch (err) {
      return false;
    }
  }

  async validateActivityProofs(activities: UserActivityRecord[], did: string) {
    const points = await Promise.all(
      activities.map(async (activity) => {
        const match = await this.verida.getValidDataSignatures(activity, did);
        if (!match) {
          // If the activity record is not valid, return 0 points
          return 0;
        }
        if (activity.status !== "completed") {
          //If the activity is not completed, return 0 points
          return 0;
        }
        // If the activity id is not known, return 0 points
        // Otherwise, return the number of points for the activity
        return getXpPointsForActivity(activity.id);
      })
    );

    const totalPoints = points.reduce((a, b) => a + b, 0);

    if (totalPoints < MIN_XP_POINTS) {
      throw new Error("Not enough XP points");
    }
  }
}
