import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { chatRouter } from "./routes/chat.routes";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.get("/health", (_request, response) =>
	response.status(200).json({ status: "ok" }),
);
app.use(chatRouter);
app.use((_request, response) =>
	response.status(404).json({ error: "Route not found" }),
);
app.use(errorHandler);
