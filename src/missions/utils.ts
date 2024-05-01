import { Client as VeridaClient } from "@verida/client-ts";
import { ACTIVITY_XP_POINTS } from "./constants";
import { UserActivityRecord } from "./types";

export function getXpPointsForActivity(activityId: string): number {
  return ACTIVITY_XP_POINTS[activityId] || 0;
}

export async function validateUserActivity(
  veridaClient: VeridaClient,
  activity: UserActivityRecord,
  did: string
): Promise<boolean> {
  const match = await veridaClient.getValidDataSignatures(activity, did);

  if (!match) {
    return false;
  }

  if (activity.status !== "completed") {
    return false;
  }

  return true;
}
