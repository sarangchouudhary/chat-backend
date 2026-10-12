import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "node:fs";
import { env } from "./env";

function serviceAccount(): Record<string, unknown> | undefined {
	if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
		return JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON) as Record<string, unknown>;
	}
	if (env.FIREBASE_SERVICE_ACCOUNT_PATH) {
		return JSON.parse(readFileSync(env.FIREBASE_SERVICE_ACCOUNT_PATH, "utf8")) as Record<string, unknown>;
	}
	return undefined;
}

const credentials = serviceAccount();
const app = getApps()[0] ?? initializeApp({
	projectId: env.FIREBASE_PROJECT_ID,
	...(credentials ? { credential: cert(credentials as Parameters<typeof cert>[0]) } : {}),
});

export const firestore = getFirestore(app);
