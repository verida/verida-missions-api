import { FunctionalError } from "../../common";

export class InvalidEvmAddressError extends FunctionalError {
  constructor(
    message = "Invalid EVM address",
    userMessage = "The provided EVM address or signature are not valid",
    options?: ErrorOptions
  ) {
    super("InvalidEvmAddressError", message, userMessage, options);
  }
}
