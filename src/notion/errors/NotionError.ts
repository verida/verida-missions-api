import { TechnicalError } from "../../common";

export class NotionError extends TechnicalError {
  constructor(
    message = "NotionError",
    userMessage?: string,
    options?: ErrorOptions
  ) {
    super("NotionError", message, userMessage, options);
  }
}
