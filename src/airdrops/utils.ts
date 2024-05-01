import { Request } from "express";
import { ZodError } from "zod";
import { isValidVeridaDid, BadRequestError } from "../common";
import { BLOCKED_COUNTRIES } from "./constants";
import { UnauthorizedCountryError } from "./errors";
import { Airdrop1SubmitProofDtoSchema } from "./schemas";
import { Airdrop1SubmitProofDto } from "./types";

export function extractDidFromRequestParams(req: Request): string {
  const did = req.params.did;

  const isValid = isValidVeridaDid(did);
  if (isValid) {
    return did;
  }

  throw new BadRequestError("Invalid DID parameter in request");
}

export function extractAirdrop1SubmitProofDtoFromRequest(
  req: Request
): Airdrop1SubmitProofDto {
  let submitProofDto: Airdrop1SubmitProofDto;
  try {
    const ipAddress = req.socket.remoteAddress;
    // When developing locally, as 127.x.x.x is a local reserved range the IP checker won't resturn any result.
    // To test, hardcode a valid IP address from a country you want to check

    // Validate the DTO against the schema
    submitProofDto = Airdrop1SubmitProofDtoSchema.parse({
      ...req.body,
      ipAddress,
    });
  } catch (error) {
    // Catching the error here to re-throw a more appropriate message than the Zod one
    if (error instanceof ZodError) {
      const message = error.issues.map((issue) => issue.message).join(", ");
      throw new BadRequestError(`Validation error: ${message}`);
    }
    throw new BadRequestError(`Validation error`);
  }

  return submitProofDto;
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

export function validateCountry(country?: string) {
  if (!country) {
    throw new UnauthorizedCountryError();
  }
  const isUnauthorized = BLOCKED_COUNTRIES.includes(country);
  if (isUnauthorized) {
    throw new UnauthorizedCountryError();
  }
}
