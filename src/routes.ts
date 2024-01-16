/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { ControllerV1 } from "~/controller";

const routerV1 = express.Router();
routerV1.post("/add", (req, res) => ControllerV1.add(req, res));

export const router = express.Router();
router.use("/api/rest/v1", routerV1);
