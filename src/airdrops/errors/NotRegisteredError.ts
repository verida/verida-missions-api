import { FunctionalError } from "../../common";

export class NotRegisteredError extends FunctionalError {
  constructor(
    message = "NotRegisteredError",
    userMessage = "Not registered",
    options?: ErrorOptions
  ) {
    super("NotRegisteredError", message, userMessage, options);
  }
}
