/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { routerV1 as airdropsRouterV1 } from "./airdrops";
import { router as versionRouter } from "./version";

const routerV1 = express.Router();
routerV1.use("/airdrops", airdropsRouterV1);

export const appRouter = express.Router();
appRouter.use("/_version", versionRouter);
appRouter.use("/v1", routerV1);
