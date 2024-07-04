import { FunctionalError } from "../../common";

export class AlreadyRegisteredError extends FunctionalError {
  constructor(
    message = "AlreadyRegisteredError",
    userMessage = "You are already registered for this airdrop",
    options?: ErrorOptions
  ) {
    super("AlreadyRegisteredError", message, userMessage, options);
  }
}
