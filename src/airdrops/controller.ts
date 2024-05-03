import { Request, Response } from "express";
import { BadRequestError } from "../common";
import { Service } from "./service";
import {
  extractAirdrop1SubmitProofDtoFromRequest,
  extractDidFromRequestParams,
} from "./utils";
import {
  AlreadyExistsError,
  NotEnoughXpPointsError,
  TermsNotAcceptedError,
  UnauthorizedCountryError,
} from "./errors";

export class ControllerV1 {
  private service: Service;

  constructor() {
    this.service = new Service();
  }

  // MARK: Airdrop 1: Early adopters of Verida Missions

  /**
   * Check if a proof for the airdrop 1 has already been submitted for a given did
   *
   * @param req The Express request object
   * @param res The Express response object
   * @returns The response
   */
  async airdrop1CheckProofExist(req: Request, res: Response) {
    try {
      const did = extractDidFromRequestParams(req);

      const exists = await this.service.checkAirdrop1ProofExist(did);

      return res.status(200).send({
        status: "success",
        exists,
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
   * Submit a proof for the airdrop 1
   *
   * @param req The Express request object
   * @param res The Express response object
   * @returns The response
   */
  async airdrop1SubmitProof(req: Request, res: Response) {
    try {
      const submitProofDto = extractAirdrop1SubmitProofDtoFromRequest(req);

      await this.service.submitAirdrop1Proof(submitProofDto);

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

      if (
        error instanceof AlreadyExistsError ||
        error instanceof NotEnoughXpPointsError ||
        error instanceof TermsNotAcceptedError ||
        error instanceof UnauthorizedCountryError
      ) {
        return res.status(403).send({
          status: "error",

          // Actually don't send the error message to the user
          // errorMessage: error.message,
          // errorUserMessage: error.userMessage,
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

  // MARK: Airdrop 2: Galxe and Zealy participants

  /**
   * Check if a user is eligible for the airdrop 2.
   *
   * @param req The Express request object
   * @param res The Express response object
   * @returns The response
   */
  async airdrop2CheckEligibility(req: Request, res: Response) {
    try {
      const did = extractDidFromRequestParams(req);

      const isEligible = await this.service.checkAirdrop2Eligibility(did);

      // TODO: Type the response
      return res.status(200).send({
        status: "success",
        isEligible,
      });
    } catch (error) {
      if (error instanceof BadRequestError) {
        // TODO: Type the response
        return res.status(400).send({
          status: "error",
          errorMessage: error.message,
          errorUserMessage: error.userMessage,
        });
      }

      // TODO: Type the response
      return res.status(500).send({
        status: "error",
        errorMessage: "Something went wrong",
      });
    }
  }
}
