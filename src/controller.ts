import { Request, Response } from "express";
import { Version } from "./version";

export class Controller {
  constructor() {
    // Nothing to do here
  }

  /**
   * @summary Get deployed version
   *
   * @type GET
   *
   * @param {Request} Express request
   * @param {Response} Express response
   *
   */
  public getVersion(req: Request, res: Response): Response {
    return res.status(200).send({
      status: "success",
      data: {
        version: Version.version,
        build_time_utc: Version.build_utc,
      },
    });
  }
}
