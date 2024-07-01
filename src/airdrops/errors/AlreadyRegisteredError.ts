import { FunctionalError } from "../../common";

export class AlreadyRegisteredError extends FunctionalError {
  constructor(
    message = "AlreadyRegisteredError",
    userMessage = "Already registered",
    options?: ErrorOptions
  ) {
    super("AlreadyRegisteredError", message, userMessage, options);
  }
}
