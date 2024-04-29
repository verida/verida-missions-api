import { UserActivityRecordSchema } from "missions/schemas";
import z from "zod";

export type UserActivityRecord = z.infer<typeof UserActivityRecordSchema>;

export type UserActivityStatus = "todo" | "pending" | "completed";
