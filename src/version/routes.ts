import express from "express";
import { Controller } from "./controller";

const controller = new Controller();

export const router = express.Router();
router.get("/", (req, res) => controller.getVersion(req, res));
