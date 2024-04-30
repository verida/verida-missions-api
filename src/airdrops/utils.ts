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
    // Validate the DTO against the schema
    submitProofDto = Airdrop1SubmitProofDtoSchema.parse(req.body);
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

export function validateCountry(country?: string) {
  if (!country) {
    throw new UnauthorizedCountryError();
  }
  const isUnauthorized = BLOCKED_COUNTRIES.includes(country);
  if (isUnauthorized) {
    throw new UnauthorizedCountryError();
  }
}
