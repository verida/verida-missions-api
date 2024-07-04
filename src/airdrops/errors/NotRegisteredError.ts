import { FunctionalError } from "../../common";

export class NotRegisteredError extends FunctionalError {
  constructor(
    message = "NotRegisteredError",
    userMessage = "Unfortunately, you are not registered for this airdrop",
    options?: ErrorOptions
  ) {
    super("NotRegisteredError", message, userMessage, options);
  }
}
