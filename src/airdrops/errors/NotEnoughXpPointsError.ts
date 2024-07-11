import { FunctionalError } from "../../common";

export class NotEnoughXpPointsError extends FunctionalError {
  constructor(
    message = "Not enough XP points",
    userMessage = "Unfortunatelly, you don't have enough XP points",
    options?: ErrorOptions
  ) {
    super("NotEnoughXpPointsError", message, userMessage, options);
  }
}
