import { TechnicalError } from "../../common";

export class BlockchainTransactionFailureError extends TechnicalError {
  constructor(
    message = "Blockchain transaction failed",
    userMessage = "Something went wrong processing the transaction",
    options?: ErrorOptions
  ) {
    super("BlockchainTransactionFailureError", message, userMessage, options);
  }
}
