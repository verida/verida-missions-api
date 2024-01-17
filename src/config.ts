import { EnvironmentType } from "@verida/types";
import z from "zod";

const EnvVarsSchema = z
  .object({
    VERIDA_NETWORK: z
      .enum(["local", "devnet", "testnet", "mainnet"])
      .optional()
      .transform((value) => {
        return value === "local"
          ? EnvironmentType.LOCAL
          : value === "devnet"
            ? EnvironmentType.DEVNET
            : value === "testnet"
              ? EnvironmentType.TESTNET
              : value === "mainnet"
                ? EnvironmentType.MAINNET
                : EnvironmentType.TESTNET;
      }),
    NOTION_API_KEY: z.string(),
    NOTION_DB_ID: z.string(),
  })
  .passthrough();

// If the environment variables are not valid, an error will be thrown and the app won't start
export const config = EnvVarsSchema.parse(process.env);
