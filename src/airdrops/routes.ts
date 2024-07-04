/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { ControllerV1 } from "./controller";

const controllerV1 = new ControllerV1();

export const routerV1 = express.Router();

// Airdrop 1: Early adopter of Verida Missions

routerV1.get("/1/check/:did", (req, res) =>
  controllerV1.airdrop1Check(req, res)
);

routerV1.post("/1/register", (req, res) =>
  controllerV1.airdrop1Register(req, res)
);

routerV1.post("/1/claim", (req, res) => controllerV1.airdrop1Claim(req, res));

// Airdrop 2: Galxe and Zealy participants

routerV1.get("/2/check/:wallet", (req, res) =>
  controllerV1.airdrop2Check(req, res)
);

/**
 * @deprecated use /2/check/:wallet instead
 */
routerV1.get("/2/eligibility/:wallet", (req, res) =>
  controllerV1.airdrop2Check(req, res)
);
