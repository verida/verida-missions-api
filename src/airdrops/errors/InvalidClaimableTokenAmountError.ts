import { TechnicalError } from "../../common";

export class InvalidClaimableTokenAmountError extends TechnicalError {
  constructor(
    message = "Invalid claimable token amount",
    userMessage?: string,
    options?: ErrorOptions
  ) {
    super("InvalidClaimableTokenAmountError", message, userMessage, options);
  }
}
