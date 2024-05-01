import z from "zod";
import { Airdrop1SubmitProofDtoSchema } from "./schemas";

export type Airdrop1SubmitProofDto = z.infer<
  typeof Airdrop1SubmitProofDtoSchema
>;
