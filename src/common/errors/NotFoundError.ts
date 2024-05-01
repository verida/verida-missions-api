import { FunctionalError } from "./FunctionalError";

export class NotFoundError extends FunctionalError {
  constructor(
    message = "NotFoundError",
    userMessage?: string,
    options?: ErrorOptions
  ) {
    super("NotFoundError", message, userMessage, options);
  }
}
