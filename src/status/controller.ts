import { Request, Response } from "express";
import { Version } from "./version";
import { StatusSuccessResponse } from "./types";

export class Controller {
  constructor() {
    // Nothing to do here
  }

  /**
   * Get deployed version and build time
   *
   * @param req The Express request object
   * @param res The Express response object
   *
   */
  public getStatus(
    req: Request,
    res: Response<StatusSuccessResponse>
  ): Response {
    return res.status(200).send({
      version: Version.version,
      build_time_utc: Version.build_time_utc,
    });
  }
}
