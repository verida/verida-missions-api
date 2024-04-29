/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from "express";
import { ZodError } from "zod";
import { Service } from "./service";
import { CreateDto, CreateDtoSchema } from "./types";

export class ControllerV1 {
  private service: Service;

  constructor() {
    this.service = new Service();
  }

  async checkExist(req: Request, res: Response) {
    if (!req.params.did) {
      return res.status(401).send({
        status: "error",
        message: "Missing DID parameter",
      });
    }

    try {
      const exists = await this.service.checkExist(req.params.did);
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

  async checkWhitelist1(req: Request, res: Response) {
    const REDIRECT_URL = "https://www.verida.network/whitelist";
    const address = <string | undefined>req.params.address
      ? req.params.address
      : req.query.address;

    if (!address) {
      return res.status(401).send({
        status: "error",
        message: "Missing address parameter",
      });
    }

    try {
      const exists = await this.service.checkWhitelist1(<string>address);

      if (exists) {
        return res.redirect(`${REDIRECT_URL}?valid=true`);
      }
    } catch (error) {
      // do nothing, return false below
    }

    return res.redirect(`${REDIRECT_URL}?valid=false`);
  }

  /**
   * Rules:
   *
   * 1. Must be on the `Airdrop XP` whitelist
   * 2. DID must have been created prior to EARLY_ADOPTER_CUTOFF_DATE
   *
   * Example URL: http://localhost:5022/api/rest/v1/earlyadopterairdrop/0xabc
   */
  async checkEarlyAdopterWhitelist(req: Request, res: Response) {
    // @todo: change to www.verida.network
    const REDIRECT_URL =
      "https://www.verida.network/early-adopters-airdrop-check";
    const address = <string | undefined>req.params.address
      ? req.params.address
      : req.query.address;

    if (!address) {
      return res.status(401).send({
        status: "error",
        message: "Missing address parameter",
      });
    }

    try {
      const exists = await this.service.checkEarlyAdopterWhitelist(
        <string>address
      );

      if (exists) {
        return res.redirect(`${REDIRECT_URL}?valid=true`);
      }
    } catch (error) {
      // do nothing, return false below
    }

    return res.redirect(`${REDIRECT_URL}?valid=false`);
  }

  async create(req: Request, res: Response) {
    let createDto: CreateDto;

    try {
      // Get the DTO from the request. Will throw an error if invalid
      createDto = await this.extractCreateRequestDto(req);
    } catch (error) {
      return res.status(401).send({
        status: "error",
        message:
          error instanceof Error ? error.message : "Something went wrong",
      });
    }

    try {
      // Check the DID doesn't already exist
      const alreadyExists = await this.service.checkExist(createDto.did);
      if (alreadyExists) {
        return res.status(403).send({
          status: "error",
          message: "Already submitted",
        });
      }

      // Create the record
      await this.service.create(createDto);

      return res.status(201).send({
        status: "success",
      });
    } catch (error) {
      return res.status(500).send({
        status: "error",
        message:
          error instanceof Error ? error.message : "Something went wrong",
      });
    }
  }

  private async extractCreateRequestDto(req: Request): Promise<CreateDto> {
    let createDto: CreateDto;
    try {
      // Validate the DTO against the schema
      createDto = CreateDtoSchema.parse(req.body);
    } catch (error) {
      // Catching the error here to re-throw a more appropriate message than the Zod one
      if (error instanceof ZodError) {
        const message = error.issues.map((issue) => issue.message).join(", ");
        throw new Error(`Validation error: ${message}`);
      }
      throw new Error(`Validation error`);
    }

    // Validate the activity proofs and number of XP points
    await this.service.validateActivityProofs(
      createDto.activityProofs,
      createDto.did
    );
    // Not catching the error here because

    return createDto;
  }
}
