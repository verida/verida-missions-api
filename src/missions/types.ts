import z from "zod";
import { UserActivityRecordSchema } from "../missions";

export type UserActivityRecord = z.infer<typeof UserActivityRecordSchema>;

export type UserActivityStatus = "todo" | "pending" | "completed";
