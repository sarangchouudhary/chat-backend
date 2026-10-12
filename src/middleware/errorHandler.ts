import { ErrorRequestHandler } from "express";
import { HttpError } from "../utils/httpError";

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
	if (error instanceof HttpError) {
		response.status(error.status).json({ error: error.message });
		return;
	}
	console.error(error);
	response.status(500).json({ error: "Internal server error" });
};
