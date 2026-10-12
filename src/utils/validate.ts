import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { ValidationTarget } from "../types/common.types";

export function validate(schema: Joi.ObjectSchema, target: ValidationTarget) {
	return (request: Request, response: Response, next: NextFunction): void => {
		const { error, value } = schema.validate(request[target], { abortEarly: false, convert: true, stripUnknown: true });
		if (error) {
			response.status(400).json({ error: "Validation failed", details: error.details.map((detail) => detail.message) });
			return;
		}
		(request as Request & { validated?: Partial<Record<ValidationTarget, unknown>> }).validated ??= {};
		(request as Request & { validated?: Partial<Record<ValidationTarget, unknown>> }).validated![target] = value;
		next();
	};
}

export function validated<T>(request: Request, target: ValidationTarget): T {
	return (request as Request & { validated?: Partial<Record<ValidationTarget, unknown>> }).validated?.[target] as T;
}
