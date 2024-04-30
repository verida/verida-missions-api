/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { routerV1 as airdropsRouterV1 } from "./airdrops";

const routerV1 = express.Router();
routerV1.use("/airdrops", airdropsRouterV1);

export const appRouter = express.Router();
appRouter.use("/v1", routerV1);
