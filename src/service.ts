import { Client as NotionClient } from "@notionhq/client";
import { Client as VeridaClient } from "@verida/client-ts";
import { config } from "./config";
import { CreateDto, UserActivityRecord } from "./types";

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
    // TODO: When verifying the XP points and computing the rewards, check the following:
    // - activity is completed
    // - activity id is among the known activities

    await Promise.all(
      activities.map(async (activity) => {
        const match = await this.verida.getValidDataSignatures(activity, did);
        if (!match) {
          throw new Error("Invalid activity proofs");
        }
      })
    );
  }
}
