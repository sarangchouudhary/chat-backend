import { NextFunction, Request, Response } from "express";

export type AsyncController = (
	request: Request,
	response: Response,
	next: NextFunction,
) => Promise<void>;

export type ValidationTarget = "body" | "params" | "query";
