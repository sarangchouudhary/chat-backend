import joi from "joi";

const schema = joi.object({
	NODE_ENV: joi.string().valid("development", "test", "production").default("development"),
	PORT: joi.number().port().default(3000),
	DB_HOST: joi.string().default("localhost"),
	DB_PORT: joi.number().port().default(3306),
	DB_NAME: joi.string().required(),
	DB_USER: joi.string().required(),
	DB_PASSWORD: joi.string().allow("").default(""),
	FIREBASE_PROJECT_ID: joi.string().required(),
	FIREBASE_SERVICE_ACCOUNT_PATH: joi.string().optional(),
	FIREBASE_SERVICE_ACCOUNT_JSON: joi.string().optional(),
}).unknown(true);

const { value, error } = schema.validate(process.env, { convert: true });
if (error) throw new Error(`Invalid environment configuration: ${error.message}`);

export const env = value as {
	NODE_ENV: "development" | "test" | "production";
	PORT: number;
	DB_HOST: string;
	DB_PORT: number;
	DB_NAME: string;
	DB_USER: string;
	DB_PASSWORD: string;
	FIREBASE_PROJECT_ID: string;
	FIREBASE_SERVICE_ACCOUNT_PATH?: string;
	FIREBASE_SERVICE_ACCOUNT_JSON?: string;
};
