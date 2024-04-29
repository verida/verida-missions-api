/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from "express";
import { Service } from "./service";
import { Airdrop1SubmitProofDto } from "./types";
import { extractAirdrop1SubmitProofDtoFromRequest } from "./utils";

export class ControllerV1 {
  private service: Service;

  constructor() {
    this.service = new Service();
  }

  /**
   * Check if a proof for the airdrop 1 has already been submitted for a given did
   *
   * @param req The Express request object
   * @param res The Express response object
   * @returns The response
   */
  async airdrop1CheckProofExist(req: Request, res: Response) {
    const did = req.params.did;

    if (!did) {
      return res.status(401).send({
        status: "error",
        message: "Missing DID parameter",
      });
    }

    try {
      const exists = await this.service.checkAirdrop1ProofExist(did);
      return res.status(200).send({
        status: "success",
        exists,
      });
    } catch (error) {
      return res.status(500).send({
        status: "error",
        message:
          error instanceof Error ? error.message : "Something went wrong",
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
    let submitProofDto: Airdrop1SubmitProofDto;

    try {
      // Get the DTO from the request. Will throw an error if invalid
      submitProofDto = extractAirdrop1SubmitProofDtoFromRequest(req);
    } catch (error) {
      return res.status(401).send({
        status: "error",
        message:
          error instanceof Error ? error.message : "Something went wrong",
      });
    }

    try {
      // Check the proof doesn't already exist
      const alreadyExists = await this.service.checkAirdrop1ProofExist(
        submitProofDto.did
      );
      if (alreadyExists) {
        return res.status(403).send({
          status: "error",
          message: "Already submitted",
        });
      }

      // Create the proof submission
      await this.service.submitAirdrop1Proof(submitProofDto);

      return res.status(201).send({
        status: "success",
      });
    } catch (error) {
      // TODO: Identify the error and return a more specific message

      return res.status(500).send({
        status: "error",
        message:
          error instanceof Error ? error.message : "Something went wrong",
      });
    }
  }
}
