import { FunctionalError } from "../../common";

export class UnauthorizedCountryError extends FunctionalError {
  constructor(
    message = "UnauthorizedCountryError",
    userMessage = "Your country is not eligible",
    options?: ErrorOptions
  ) {
    super("UnauthorizedCountryError", message, userMessage, options);
  }
}
