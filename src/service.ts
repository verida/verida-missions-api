import { Client as NotionClient } from "@notionhq/client";
import { Client as VeridaClient } from "@verida/client-ts";
import { config } from "./config";
import { CreateDto, UserActivityRecord } from "./types";
import { activityXpPoints } from "./constants";

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
   * Check if a DID exists in the database. Does not return the result, to prevent data leaks.
   *
   * @param did the DID to find.
   * @returns a boolean indicating whether the DID exists in the database.
   */
  async checkExist(did: string) {
    const result = await this.notion.databases.query({
      database_id: config.NOTION_DB_ID,
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

  async checkWhitelist1(address: string) {
    const WHITELIST1_CUTOFF = '2024-02-07T23:59:99.000Z'
    const result = await this.notion.databases.query({
      database_id: config.NOTION_DB_ID,
      filter: {
        or: [
          {
            property: "DID",
            title: {
              equals: address,
            },
          },
          {
            property: "Wallet address",
            title: {
              equals: address,
            },
          },
        ],
      },
    });

    // Do not return the result, to prevent data leaks
    if (result.results.length > 0) {
      const record = result.results[0]
      // @ts-ignore
      const createdTimestamp = record.properties['Created time'].created_time
      if (createdTimestamp > WHITELIST1_CUTOFF) {
        return false
      }

      return true
    } else {
      return false
    }
  }

  /**
   * Create a new record in the database.
   *
   * @param createDto the DTO to create the record with.
   */
  async create(createDto: CreateDto) {
    try {
      await this.notion.pages.create({
        parent: {
          type: "database_id",
          database_id: config.NOTION_DB_ID,
        },
        properties: {
          "Wallet address": {
            type: "title",
            title: [
              {
                type: "text",
                text: {
                  content: createDto.userWalletAddress,
                },
              },
            ],
          },
          "DID": {
            type: "rich_text",
            rich_text: [
              {
                type: "text",
                text: {
                  content: createDto.did,
                },
              },
            ],
          },
          "Name": {
            type: "rich_text",
            rich_text: [
              {
                type: "text",
                text: {
                  content: createDto.profile.name,
                },
              },
            ],
          },
          "Country": {
            type: "rich_text",
            rich_text: [
              {
                type: "text",
                text: {
                  content: createDto.profile.country,
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

  /**
   * Verify the signatures of the activities.
   *
   * @param activities
   * @param did
   */
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
        return activityXpPoints[activity.id] || 0;
      })
    );

    const totalPoints = points.reduce((a, b) => a + b, 0);

    if (totalPoints < config.MIN_XP_POINTS) {
      throw new Error("Not enough XP points");
    }
  }
}
