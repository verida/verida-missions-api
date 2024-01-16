/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from "express";
import { Client as NotionClient } from "@notionhq/client";
import { Client as VeridaClient } from "@verida/client-ts";
import { EnvironmentType } from "@verida/types";
import { ValidRequestParams } from "~/types";

export class ControllerV1 {
  public static async add(req: Request, res: Response) {
    try {
      const { walletAddress, did, profile } =
        await ControllerV1.validateRequest(req);

      const NOTION_API_KEY = process.env.NOTION_API_KEY;
      const NOTION_DB_ID = process.env.NOTION_DB_ID;

      // Initializing a client
      const notion = new NotionClient({
        auth: NOTION_API_KEY,
      });

      try {
        await ControllerV1.validateRequest(req);
      } catch (error) {
        return res.status(401).send({
          status: "fail",
          message:
            error instanceof Error ? error.message : "Something went wrong",
        });
      }

      // Check the wallet / DID doesn't already exist
      const result = await notion.databases.query({
        database_id: NOTION_DB_ID || "", // FIXME: This is a temporary hack to get around the TS error
        filter: {
          or: [
            {
              property: "Wallet address",
              title: {
                equals: walletAddress,
              },
            },
            {
              property: "DID",
              title: {
                equals: walletAddress,
              },
            },
          ],
        },
      });

      if (result && result.results.length > 0) {
        return res.status(401).send({
          status: "fail",
          message: "Wallet or DID already exists",
        });
      }

      // Create a new entry for this wallet / DID
      await notion.pages.create({
        parent: {
          type: "database_id",
          database_id: NOTION_DB_ID || "", // FIXME: This is a temporary hack to get around the TS error
        },
        properties: {
          "Wallet address": {
            type: "title",
            title: [
              {
                type: "text",
                text: {
                  content: walletAddress,
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
                  content: did,
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
                  content: profile.name,
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
                  content: profile.country,
                },
              },
            ],
          },
        },
      });

      return res.status(200).send({
        status: "success",
        result,
      });
    } catch (error) {
      return res.status(500).send({
        status: "fail",
        message:
          error instanceof Error ? error.message : "Something went wrong",
      });
    }
  }

  private static async validateRequest(
    req: Request
  ): Promise<ValidRequestParams> {
    const { did, userWalletAddress, activityProofs, profile } = req.body;

    if (!did || !userWalletAddress || !activityProofs || !profile) {
      throw new Error("Invalid parameters");
    }

    const client = new VeridaClient({
      environment: <EnvironmentType>process.env.VERIDA_NETWORK,
    });

    const defaultXp = 50;
    const missionActivities: Record<string, number> = {
      "claim-gatekeeper-adopter-credential": 100,
      "refer-friend": 100,
      "claim-anima-pol-credential": 100,
    };

    let totalXp = 0;
    for (const i in activityProofs) {
      const activityProof = activityProofs[i];
      const match = await client.getValidDataSignatures(
        activityProof,
        did as string
      ); // FIXME: This is a temporary hack to get around the TS error
      if (match) {
        if (typeof missionActivities[activityProof.id] !== "undefined") {
          totalXp += missionActivities[activityProof.id];
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          totalXp += defaultXp;
        }
      }
    }

    return {
      walletAddress: userWalletAddress,
      did,
      profile,
    };
  }
}
