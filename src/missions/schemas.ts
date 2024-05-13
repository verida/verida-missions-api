import z from "zod";
import { VeridaBaseRecordSchema } from "../common";

export const UserActivitySchema = z.object({
  id: z.string(), // Not _id, this is the id of the activity, ie. 'create-verida-identity'
  status: z.enum(["todo", "pending", "completed"]).default("todo"),
  completionDate: z.string().datetime().optional(),
});

export const UserActivityRecordSchema = VeridaBaseRecordSchema.extend(
  UserActivitySchema.shape
);
