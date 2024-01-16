/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { ControllerV1 } from "./controller";

const routerV1 = express.Router();
const controllerV1 = new ControllerV1();
routerV1.post("/claims", (req, res) => controllerV1.create(req, res));

export const router = express.Router();
router.use("/api/rest/v1", routerV1);
