import { FunctionalError } from "../../common";

export class AirdropClaimClosedError extends FunctionalError {
  constructor(
    message = "Airdrop claim closed",
    userMessage = "This airdrop claim is now closed",
    options?: ErrorOptions
  ) {
    super("AirdropClaimClosedError", message, userMessage, options);
  }
}
