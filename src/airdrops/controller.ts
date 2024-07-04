import { Request, Response } from "express";
import { BadRequestError, ErrorResponse } from "../common";
import {
  AlreadyClaimedError,
  AlreadyRegisteredError,
  NotEnoughXpPointsError,
  NotRegisteredError,
  TermsNotAcceptedError,
  UnauthorizedCountryError,
} from "./errors";
import { Service } from "./service";
import {
  extractAirdrop1ClaimDtoFromRequest,
  extractAirdrop1RegistrationDtoFromRequest,
  extractDidFromRequestParams,
  extractWalletFromRequestParams,
} from "./utils";
import {
  Airdrop1CheckSuccessResponse,
  Airdrop1ClaimSuccessResponse,
  Airdrop1RegisterSuccessResponse,
  Airdrop2CheckSuccessResponse,
} from "./types";

export class ControllerV1 {
  private service: Service;

  constructor() {
    this.service = new Service();
  }

  // MARK: Airdrop 1: Early adopters of Verida Missions

  /**
   * Check the status of the airdrop 1 for a given DID.
   *
   * @param req The Express request object
   * @param res The Express response object
   * @returns The response
   */
  async airdrop1Check(
    req: Request,
    res: Response<Airdrop1CheckSuccessResponse | ErrorResponse>
  ) {
    try {
      const did = extractDidFromRequestParams(req);

      const status = await this.service.getAirdrop1Status(did);

      return res.status(200).send({
        status: "success",
        isRegistered: status.isRegistered,
        isClaimed: status.isClaimed,
      });
    } catch (error) {
      if (error instanceof BadRequestError) {
        return res.status(400).send({
          status: "error",
          errorMessage: error.message,
          errorUserMessage: error.userMessage,
        });
      }

      return res.status(500).send({
        status: "error",
        errorMessage: "Something went wrong",
      });
    }
  }

  /**
   * Register for the airdrop 1
   *
   * @param req The Express request object
   * @param res The Express response object
   * @returns The response
   */
  async airdrop1Register(
    req: Request,
    res: Response<Airdrop1RegisterSuccessResponse | ErrorResponse>
  ) {
    try {
      const registrationDto = extractAirdrop1RegistrationDtoFromRequest(req);

      await this.service.registerAirdrop1(registrationDto);

      return res.status(201).send({
        status: "success",
      });
    } catch (error) {
      if (error instanceof BadRequestError) {
        return res.status(400).send({
          status: "error",
          errorMessage: error.message,
          errorUserMessage:
            error.userMessage ||
            "Something went wrong on our side. Please try again later.",
        });
      }

      if (error instanceof AlreadyRegisteredError) {
        return res.status(403).send({
          status: "error",
          errorMessage: error.message,
          errorUserMessage: error.userMessage,
        });
      }

      if (
        error instanceof NotEnoughXpPointsError ||
        error instanceof TermsNotAcceptedError ||
        error instanceof UnauthorizedCountryError
      ) {
        return res.status(403).send({
          status: "error",
          // Intentionally not sending the error details
        });
      }

      return res.status(500).send({
        status: "error",
        errorMessage: "Something went wrong",
        errorUserMessage:
          "Something went wrong on our side. Please try again later.",
      });
    }
  }

  /**
   * Claim the airdrop 1
   *
   * @param req The Express request object
   * @param res The Express response object
   * @returns The response
   */
  async airdrop1Claim(
    req: Request,
    res: Response<Airdrop1ClaimSuccessResponse | ErrorResponse>
  ) {
    try {
      const claimDto = extractAirdrop1ClaimDtoFromRequest(req);

      await this.service.claimAirdrop1(claimDto);

      return res.status(201).send({
        status: "success",
      });
    } catch (error) {
      if (error instanceof BadRequestError) {
        return res.status(400).send({
          status: "error",
          errorMessage: error.message,
          errorUserMessage:
            error.userMessage ||
            "Something went wrong on our side. Please try again later.",
        });
      }

      if (error instanceof NotRegisteredError) {
        return res.status(403).send({
          status: "error",
          errorMessage: error.message,
          errorUserMessage: error.userMessage,
        });
      }

      if (error instanceof AlreadyClaimedError) {
        return res.status(403).send({
          status: "error",
          errorMessage: error.message,
          errorUserMessage: error.userMessage,
        });
      }

      if (
        error instanceof TermsNotAcceptedError ||
        error instanceof UnauthorizedCountryError
      ) {
        return res.status(403).send({
          status: "error",
          // Intentionally not sending the error details
        });
      }

      return res.status(500).send({
        status: "error",
        errorMessage: "Something went wrong",
      });
    }
  }

  // MARK: Airdrop 2: Galxe and Zealy participants

  /**
   * Check if a user is eligible for the airdrop 2.
   *
   * @param req The Express request object
   * @param res The Express response object
   * @returns The response
   */
  async airdrop2Check(
    req: Request,
    res: Response<Airdrop2CheckSuccessResponse | ErrorResponse>
  ) {
    try {
      const wallet = extractWalletFromRequestParams(req);

      const isRegistered =
        await this.service.checkAirdrop2RegistrationExist(wallet);

      return res.status(200).send({
        status: "success",
        isRegistered,
        isEligible: isRegistered,
      });
    } catch (error) {
      if (error instanceof BadRequestError) {
        return res.status(400).send({
          status: "error",
          errorMessage: error.message,
          errorUserMessage: error.userMessage,
        });
      }

      return res.status(500).send({
        status: "error",
        errorMessage: "Something went wrong",
      });
    }
  }
}
