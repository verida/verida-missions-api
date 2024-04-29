import { ACTIVITY_XP_POINTS } from "./constants";

export function getXpPointsForActivity(activity: string): number {
  return ACTIVITY_XP_POINTS[activity] || 0;
}
