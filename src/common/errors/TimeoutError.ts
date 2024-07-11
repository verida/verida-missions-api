import { TechnicalError } from "./TechnicalError";

export class TimeoutError extends TechnicalError {
  constructor(
    message = "Time out",
    userMessage?: string,
    options?: ErrorOptions
  ) {
    super("TimeoutError", message, userMessage, options);
  }
}
