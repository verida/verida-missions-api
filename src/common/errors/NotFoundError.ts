import { FunctionalError } from "./FunctionalError";

export class NotFoundError extends FunctionalError {
  constructor(
    message = "Not found",
    userMessage?: string,
    options?: ErrorOptions
  ) {
    super("NotFoundError", message, userMessage, options);
  }
}
