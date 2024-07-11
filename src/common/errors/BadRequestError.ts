import { FunctionalError } from "./FunctionalError";

export class BadRequestError extends FunctionalError {
  constructor(
    message = "Bad request",
    userMessage?: string,
    options?: ErrorOptions
  ) {
    super("BadRequestError", message, userMessage, options);
  }
}
