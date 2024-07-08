import { FunctionalError } from "../../common";

export class AlreadyClaimedError extends FunctionalError {
  constructor(
    message = "Already claimed",
    userMessage = "This airdrop has already been claimed",
    options?: ErrorOptions
  ) {
    super("AlreadyClaimedError", message, userMessage, options);
  }
}
