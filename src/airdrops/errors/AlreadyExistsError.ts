import { FunctionalError } from "../../common";

export class AlreadyExistsError extends FunctionalError {
  constructor(
    message = "AlreadyExistsError",
    userMessage = "Already exists",
    options?: ErrorOptions
  ) {
    super("AlreadyExistsError", message, userMessage, options);
  }
}
