import { Request } from "express";
import { ZodError } from "zod";
import { Airdrop1SubmitProofDtoSchema } from "./schemas";
import { Airdrop1SubmitProofDto } from "./types";

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
      throw new Error(`Validation error: ${message}`);
    }
    throw new Error(`Validation error`);
  }

  return submitProofDto;
}
