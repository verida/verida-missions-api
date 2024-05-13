/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { ControllerV1 } from "./controller";

const controllerV1 = new ControllerV1();

export const routerV1 = express.Router();

// Airdrop 1: Early adopter of Verida Missions
routerV1.get("/1/proofs/:did", (req, res) =>
  controllerV1.airdrop1CheckProofExist(req, res)
);
routerV1.post("/1/proofs", (req, res) =>
  controllerV1.airdrop1SubmitProof(req, res)
);

// Airdrop 2: Galxe and Zealy participants
routerV1.get("/2/eligibility/:wallet", (req, res) =>
  controllerV1.airdrop2CheckEligibility(req, res)
);
