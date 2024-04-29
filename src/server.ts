import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import serverless from "serverless-http";
import { routerV1 } from "./routes";

const app = express();

const corsConfig = {};

app.use(cors(corsConfig));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api/rest", routerV1);

export const handler = serverless(app);
