import "dotenv/config";
import { app } from "./app";
import { env } from "./config/env";
import { sequelize } from "./config/database";
import "./models";

async function start(): Promise<void> {
	await sequelize.authenticate();
	await sequelize.sync();
	app.listen(env.PORT, () => console.log(`Chat API listening on port ${env.PORT}`));
}

void start().catch((error: unknown) => {
	console.error("Unable to start chat API", error);
	process.exitCode = 1;
});