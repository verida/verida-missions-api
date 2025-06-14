import { Request, Response } from "express";
import { BadRequestError, ErrorResponse } from "../common";
import {
  AirdropClaimClosedError,
  AlreadyClaimedError,
  AlreadyRegisteredError,
  InvalidEvmAddressError,
  NotEnoughXpPointsError,
  NotRegisteredError,
  TermsNotAcceptedError,
  UnauthorizedCountryError,
} from "./errors";
import { Service } from "./service";
import {
  extractAirdrop1RegistrationDtoFromRequest,
  extractAirdrop2CheckDtoFromRequest,
  extractDidFromRequestParams,
  extractWalletFromRequestParams,
} from "./utils";
import {
  Airdrop1CheckSuccessResponse,
  Airdrop1ClaimSuccessResponse,
  Airdrop1RegisterSuccessResponse,
  Airdrop2CheckSuccessResponse,
  Airdrop2ClaimSuccessResponse,
  Airdrop2LegacyCheckSuccessResponse,
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
        exists: status.isRegistered,
        isRegistered: status.isRegistered,
        isClaimed: status.isClaimed,
        claimableTokenAmount: status.claimableTokenAmount,
        claimedTokenAmount: status.claimedTokenAmount,
        claimTransactionUrl: status.claimTransactionUrl,
      });
    } catch (error) {
      if (error instanceof BadRequestError) {
        return res.status(400).send({
          status: "error",
          errorCode: error.code,
          errorMessage: error.message,
          errorUserMessage: error.userMessage,
        });
      }

      return res.status(500).send({
        status: "error",
        errorCode: "InternalError",
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
          errorCode: error.code,
          errorMessage: error.message,
          errorUserMessage:
            error.userMessage ||
            "Something went wrong on our side. Please try again later.",
        });
      }

      if (error instanceof AlreadyRegisteredError) {
        return res.status(403).send({
          status: "error",
          errorCode: error.code,
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
          errorCode: "Unauthorized",
        });
      }

      return res.status(500).send({
        status: "error",
        errorCode: "InternalError",
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
  airdrop1Claim(
    _req: Request,
    res: Response<Airdrop1ClaimSuccessResponse | ErrorResponse>
  ) {
    try {
      // Airdrop now closed, returning an error

      const airdropClaimClosedError = new AirdropClaimClosedError();

      return res.status(403).send({
        status: "error",
        errorCode: airdropClaimClosedError.code,
        errorMessage: airdropClaimClosedError.message,
        errorUserMessage: airdropClaimClosedError.userMessage,
      });

      // ---- Previous implementation ----

      // const claimDto = extractAirdrop1ClaimDtoFromRequest(req);

      // const result = await this.service.claimAirdrop1(claimDto);

      // return res.status(201).send({
      //   status: "success",
      //   claimedTokenAmount: result.claimedTokenAmount,
      //   transactionExplorerUrl: result.transactionExplorerUrl,
      // });
    } catch (error) {
      if (
        error instanceof InvalidEvmAddressError ||
        error instanceof BadRequestError
      ) {
        return res.status(400).send({
          status: "error",
          errorCode: error.code,
          errorMessage: error.message,
          errorUserMessage:
            error.userMessage ||
            "Something went wrong on our side. Please try again later.",
        });
      }

      if (
        error instanceof TermsNotAcceptedError ||
        error instanceof NotRegisteredError ||
        error instanceof AlreadyClaimedError
      ) {
        return res.status(403).send({
          status: "error",
          errorCode: error.code,
          errorMessage: error.message,
          errorUserMessage: error.userMessage,
        });
      }

      return res.status(500).send({
        status: "error",
        errorCode: "InternalError",
        errorMessage: "Something went wrong",
      });
    }
  }

  // MARK: Airdrop 2: Galxe and Zealy participants

  /**
   * Check the status of a user for the airdrop 2.
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
      const checkDto = extractAirdrop2CheckDtoFromRequest(req);

      const status = await this.service.getAirdrop2Status(checkDto);

      return res.status(200).send({
        status: "success",
        isRegistered: status.isRegistered,
        isClaimed: status.isClaimed,
        claimableTokenAmount: status.claimableTokenAmount,
        claimedTokenAmount: status.claimedTokenAmount,
        claimTransactionUrl: status.claimTransactionUrl,
      });
    } catch (error) {
      if (
        error instanceof InvalidEvmAddressError ||
        error instanceof BadRequestError
      ) {
        return res.status(400).send({
          status: "error",
          errorCode: error.code,
          errorMessage: error.message,
          errorUserMessage: error.userMessage,
        });
      }

      if (error instanceof UnauthorizedCountryError) {
        return res.status(403).send({
          status: "error",
          // Intentionally not sending the error details
          errorCode: "Unauthorized",
        });
      }

      return res.status(500).send({
        status: "error",
        errorCode: "InternalError",
        errorMessage: "Something went wrong",
      });
    }
  }

  /**
   * Check if a user is eligible for the airdrop 2.
   *
   * @deprecated Use `airdrop2Check` instead
   *
   * @param req The Express request object
   * @param res The Express response object
   * @returns The response
   */
  async airdrop2LegacyCheck(
    req: Request,
    res: Response<Airdrop2LegacyCheckSuccessResponse | ErrorResponse>
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
          errorCode: error.code,
          errorMessage: error.message,
          errorUserMessage: error.userMessage,
        });
      }

      return res.status(500).send({
        status: "error",
        errorCode: "InternalError",
        errorMessage: "Something went wrong",
      });
    }
  }

  /**
   * Claim the airdrop 2
   *
   * @param req The Express request object
   * @param res The Express response object
   * @returns The response
   */
  airdrop2Claim(
    _req: Request,
    res: Response<Airdrop2ClaimSuccessResponse | ErrorResponse>
  ) {
    try {
      // Airdrop now closed, returning an error

      const airdropClaimClosedError = new AirdropClaimClosedError();

      return res.status(403).send({
        status: "error",
        errorCode: airdropClaimClosedError.code,
        errorMessage: airdropClaimClosedError.message,
        errorUserMessage: airdropClaimClosedError.userMessage,
      });

      // ---- Previous implementation ----

      // const claimDto = extractAirdrop2ClaimDtoFromRequest(req);

      // const result = await this.service.claimAirdrop2(claimDto);

      // return res.status(201).send({
      //   status: "success",
      //   claimedTokenAmount: result.claimedTokenAmount,
      //   transactionExplorerUrl: result.transactionExplorerUrl,
      // });
    } catch (error) {
      if (
        error instanceof InvalidEvmAddressError ||
        error instanceof BadRequestError
      ) {
        return res.status(400).send({
          status: "error",
          errorCode: error.code,
          errorMessage: error.message,
          errorUserMessage:
            error.userMessage ||
            "Something went wrong on our side. Please try again later.",
        });
      }

      if (
        error instanceof TermsNotAcceptedError ||
        error instanceof NotRegisteredError ||
        error instanceof AlreadyClaimedError
      ) {
        return res.status(403).send({
          status: "error",
          errorCode: error.code,
          errorMessage: error.message,
          errorUserMessage: error.userMessage,
        });
      }

      if (error instanceof UnauthorizedCountryError) {
        return res.status(403).send({
          status: "error",
          // Intentionally not sending the error details
          errorCode: "Unauthorized",
        });
      }

      return res.status(500).send({
        status: "error",
        errorCode: "InternalError",
        errorMessage: "Something went wrong",
      });
    }
  }
}
