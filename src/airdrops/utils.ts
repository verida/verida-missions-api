import { Request } from "express";
import { ZodError } from "zod";
import {
  isValidVeridaDid,
  BadRequestError,
  isValidEvmAddress,
} from "../common";
import { BLOCKED_COUNTRIES } from "./constants";
import { UnauthorizedCountryError } from "./errors";
import {
  Airdrop1ClaimDtoSchema,
  Airdrop1RegistrationDtoSchema,
} from "./schemas";
import {
  Airdrop1ClaimDto,
  Airdrop1Record,
  Airdrop1RegistrationDto,
} from "./types";
import { verifyMessage } from "ethers";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import {
  NotionDatabaseProperty,
  getValueFromNotionCheckboxProperty,
  getValueFromNotionNumberProperty,
  getValueFromNotionRichTextProperty,
  getValueFromNotionTitleProperty,
} from "../notion";

export function extractDidFromRequestParams(req: Request): string {
  const did = req.params.did;

  const isValid = isValidVeridaDid(did);
  if (isValid) {
    return did;
  }

  throw new BadRequestError("Invalid DID parameter in request");
}

export function extractWalletFromRequestParams(req: Request): string {
  const wallet = req.params.wallet;

  const isValid = isValidEvmAddress(wallet);
  if (isValid) {
    return wallet;
  }

  throw new BadRequestError("Invalid wallet parameter in request");
}

export function extractAirdrop1RegistrationDtoFromRequest(
  req: Request
): Airdrop1RegistrationDto {
  try {
    const ipAddress = req.socket.remoteAddress;
    // When developing locally, as 127.x.x.x is a local reserved range the IP checker won't resturn any result.
    // To test, hardcode a valid IP address from a country you want to check

    // Validate the DTO against the schema
    const registrationDto = Airdrop1RegistrationDtoSchema.parse({
      ...req.body,
      ipAddress,
    });

    return registrationDto;
  } catch (error) {
    // Catching the error here to re-throw a more appropriate message than the Zod one
    if (error instanceof ZodError) {
      const message = error.issues.map((issue) => issue.message).join(", ");
      throw new BadRequestError(`Validation error: ${message}`);
    }
    throw new BadRequestError(`Validation error`);
  }
}

export function extractAirdrop1ClaimDtoFromRequest(
  req: Request
): Airdrop1ClaimDto {
  try {
    // Validate the DTO against the schema
    const claimDto = Airdrop1ClaimDtoSchema.parse(req.body);
    return claimDto;
  } catch (error) {
    // Catching the error here to re-throw a more appropriate message than the Zod one
    if (error instanceof ZodError) {
      const message = error.issues.map((issue) => issue.message).join(", ");
      throw new BadRequestError(`Validation error: ${message}`);
    }
    throw new BadRequestError(`Validation error`);
  }
}

export async function getCountryFromIp(
  ipAddress: string
): Promise<string | undefined> {
  const url = `http://ip-api.com/json/${ipAddress}?fields=status,message,country,countryCode,proxy`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return undefined;
    }

    const data = (await response.json()) as {
      status: string;
      country: string;
      proxy: boolean; // Not used yet but could be, it indicates if a VPN, a proxy or TOR is being used
    };

    if (data.status !== "success") {
      return undefined;
    }

    return data.country;
  } catch (error) {
    return undefined;
  }
}

export function validateCountry(country?: string): void {
  if (!country) {
    throw new UnauthorizedCountryError();
  }
  const isUnauthorized = BLOCKED_COUNTRIES.includes(country);
  if (isUnauthorized) {
    throw new UnauthorizedCountryError();
  }
}

export function validateEVMAddress({
  address,
  signedMessage,
  clearMessage,
}: {
  address: string;
  signedMessage: string;
  clearMessage: string;
}): void {
  const isValid = isValidEvmAddress(address);
  if (!isValid) {
    throw new BadRequestError("Validation error: Invalid EVM address");
  }

  const resolvedAddress = verifyMessage(clearMessage, signedMessage);
  if (resolvedAddress !== address) {
    throw new BadRequestError("Validation error: Invalid signature");
  }
}

export function transformNotionRecordToAirdrop1(
  record: DatabaseObjectResponse
): Airdrop1Record {
  // HACK: Surprisingly the Notion library types don't correspond to the
  // actual data structure returned by the API, so we need to cast it
  const properties = record.properties as unknown as Record<
    string,
    NotionDatabaseProperty
  >;

  return {
    id: record.id,
    did: getValueFromNotionTitleProperty(properties["DID"]),
    country: getValueFromNotionRichTextProperty(properties["Country"]),
    termsAccepted: getValueFromNotionCheckboxProperty(
      properties["Terms accepted"]
    ),
    totalXPPoints: getValueFromNotionNumberProperty(
      properties["Total XP points"]
    ),
    totalXPPointsBeforeCutOff: getValueFromNotionNumberProperty(
      properties["XP points before cut-off"]
    ),
    claimed: getValueFromNotionCheckboxProperty(properties["Claimed"]),
  };
}
