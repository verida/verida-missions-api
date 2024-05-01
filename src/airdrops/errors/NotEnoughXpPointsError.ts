import { FunctionalError } from "../../common";

export class NotEnoughXpPointsError extends FunctionalError {
  constructor(
    message = "Not enough XP points",
    userMessage = "Not enough XP points",
    options?: ErrorOptions
  ) {
    super("NotEnoughXpPointsError", message, userMessage, options);
  }
}
