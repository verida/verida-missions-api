/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { routerV1 as airdropsRouterV1 } from "./airdrops/routes";

export const routerV1 = express.Router();
routerV1.use("/v1", airdropsRouterV1);
