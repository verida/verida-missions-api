/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from "express";
import { CreateDto, CreateDtoSchema } from "./types";
import { Service } from "./service";

export class ControllerV1 {
  private service: Service;

  constructor() {
    this.service = new Service();
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
      const alreadyExists = await this.service.find(createDto.did);
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
    // Validate the DTO against the schema
    const createDto = CreateDtoSchema.parse(req.body);
    // Validate the activit proofs
    await this.service.validateActivityProofs(
      createDto.activityProofs,
      createDto.did
    );

    return createDto;
  }
}
