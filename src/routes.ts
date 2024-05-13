/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { routerV1 as airdropsRouterV1 } from "./airdrops";

const routerV1 = express.Router();
routerV1.use("/airdrops", airdropsRouterV1);

export const appRouter = express.Router();
appRouter.get("/_version", (req, res) =>
  versionController.getVersion(req, res)
);
appRouter.use("/v1", routerV1);
