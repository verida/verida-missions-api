import { FunctionalError } from "../../common";

export class TermsNotAcceptedError extends FunctionalError {
  constructor(
    message = "TermsNotAcceptedError",
    userMessage = "The terms and conditions have not been accepted",
    options?: ErrorOptions
  ) {
    super("TermsNotAcceptedError", message, userMessage, options);
  }
}
