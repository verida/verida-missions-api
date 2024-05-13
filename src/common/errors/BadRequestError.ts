import { FunctionalError } from "./FunctionalError";

export class BadRequestError extends FunctionalError {
  constructor(
    message = "BadRequestError",
    userMessage?: string,
    options?: ErrorOptions
  ) {
    super("BadRequestError", message, userMessage, options);
  }
}
