/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { ControllerV1 } from "./controller";

const controllerV1 = new ControllerV1();

export const routerV1 = express.Router();

routerV1.get("/claims/:did", (req, res) => controllerV1.checkExist(req, res));
routerV1.get("/whitelist1/:address", (req, res) =>
  controllerV1.checkWhitelist1(req, res)
);
routerV1.get("/whitelist1", (req, res) =>
  controllerV1.checkWhitelist1(req, res)
);
routerV1.get("/earlyadopterairdrop", (req, res) =>
  controllerV1.checkEarlyAdopterWhitelist(req, res)
);
routerV1.post("/claims", (req, res) => controllerV1.create(req, res));
