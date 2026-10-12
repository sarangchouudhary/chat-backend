# Chat Backend

A REST API for one-to-one chats. User, chat, and membership records live in MySQL through Sequelize. Messages, read receipts, and each member's last-seen message live in Firebase Cloud Firestore.

## Stack

- Node.js and TypeScript with strict type checking
- Express 5
- MySQL and Sequelize
- Firebase Admin SDK and Cloud Firestore
- Joi request validation

## Requirements

- Node.js 20 or newer
- MySQL 8 or compatible MySQL server
- A Firebase project with the Cloud Firestore API enabled and a `(default)` Firestore database created
- A Firebase service-account key for local development, or Application Default Credentials

## Setup

1. Install packages:

   ```bash
   npm install
   ```

2. Create the database and tables. The SQL creates the `chat_backend` database:

   ```bash
   mysql -h 127.0.0.1 -u root < database.schema.sql
   ```

   If tables were created earlier by an older version of Sequelize and inserts fail because timestamp columns have no defaults, apply:

   ```bash
   mysql -h 127.0.0.1 -u root chat_backend < database/fix_timestamp_defaults.sql
   ```

3. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

   Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` for your MySQL instance. Set `FIREBASE_PROJECT_ID` to the project ID in your Firebase service-account JSON.

4. Provide Firebase credentials. For local development, save the service-account JSON as `firebase-service-account.json` in the repository root and set:

   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   ```

   Alternatively, set `FIREBASE_SERVICE_ACCOUNT_JSON` to the JSON as a single-line value, or configure Application Default Credentials. Keep service-account keys private; `.env` and the default key-file name are ignored by Git.

5. (Optional) Insert sample users:

   ```bash
   mysql -h 127.0.0.1 -u root chat_backend < database/seed.sql
   ```

   Check the generated IDs with `SELECT id, name FROM users;`. There is no user-registration endpoint in this API.

## Run

```bash
npm run dev
```

This builds the TypeScript and starts the server on port `3000` by default. To create a production build and run it:

```bash
npm run build
npm start
```

Check server health at `GET /health`.

## API

All request bodies use JSON. IDs in examples are sample MySQL IDs; replace them with IDs from your database. A direct chat is unique per unordered pair of users, so creating the same pair again returns the existing chat.

| Method | Path | Request | Success response |
| --- | --- | --- | --- |
| `POST` | `/chat/create` | `{ "userAId": 1, "userBId": 2 }` | `{ "chatId": 1 }` |
| `POST` | `/chat/:chatId/message/send` | `{ "senderId": 1, "text": "Hello" }` | Message document including `messageId` |
| `GET` | `/chat/:chatId/messages?limit=50` | Optional `before` ISO timestamp for pagination | `{ "messages": [...] }`, oldest first within the returned page |
| `POST` | `/chat/:chatId/message/:messageId/read` | `{ "userId": 2 }` | Read receipt result |
| `POST` | `/chat/:chatId/lastseen` | `{ "userId": 2, "messageId": "..." }` | Last-seen result |
| `GET` | `/user/:userId/chats` | — | `{ "chats": [...] }` with member IDs |

### Example flow

Create or get a chat and copy the returned `chatId`:

```bash
curl -X POST http://localhost:3000/chat/create \
  -H 'Content-Type: application/json' \
  -d '{"userAId":1,"userBId":2}'
```

Send a message and copy its returned `messageId`:

```bash
curl -X POST http://localhost:3000/chat/1/message/send \
  -H 'Content-Type: application/json' \
  -d '{"senderId":1,"text":"Hello"}'
```

List messages:

```bash
curl 'http://localhost:3000/chat/1/messages?limit=50'
```

Mark the message read and update last seen:

```bash
curl -X POST http://localhost:3000/chat/1/message/MESSAGE_ID/read \
  -H 'Content-Type: application/json' \
  -d '{"userId":2}'

curl -X POST http://localhost:3000/chat/1/lastseen \
  -H 'Content-Type: application/json' \
  -d '{"userId":2,"messageId":"MESSAGE_ID"}'
```

List a user's chats:

```bash
curl http://localhost:3000/user/1/chats
```

## Data layout

- MySQL: `users`, `chats`, and `chat_members`
- Firestore messages: `chats/{chatId}/messages/{messageId}`
- Firestore read receipts: `chats/{chatId}/messages/{messageId}/readReceipts/{userId}`
- Firestore last seen: `chats/{chatId}/lastSeen/{userId}`

Firestore server timestamps are used for messages and receipts. Messages are ordered by timestamp; `limit` defaults to 50 and is capped at 100.

## Security and production notes

- The messages GET endpoint has no user identity in the requested API contract, so it cannot verify membership. Add authentication and derive the user from the authenticated session before exposing it publicly.
- The API currently accepts sender and user IDs from request bodies. Add authentication before using it as a public service.
- Do not commit `.env` or Firebase service-account credentials.
- The server calls `sequelize.sync()` on startup for development. Use migrations for production schema changes.
- MySQL membership checks and Firestore writes are separate operations; plan for retries or reconciliation if either service fails during a request.
