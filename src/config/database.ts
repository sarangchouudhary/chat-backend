import { Sequelize } from "sequelize";
import { env } from "./env";

export const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
	dialect: "mysql",
	host: env.DB_HOST,
	port: env.DB_PORT,
	logging: env.NODE_ENV === "development" ? console.log : false,
	define: { underscored: true, freezeTableName: true },
});
