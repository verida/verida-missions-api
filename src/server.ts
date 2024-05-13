import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import serverless from "serverless-http";
import { router as versionRouter } from "./version";
import { appRouter } from "./routes";

const app = express();

const corsConfig = {};

app.use(cors(corsConfig));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/_version", versionRouter);
app.use("/api/rest", appRouter);

export const handler = serverless(app);
