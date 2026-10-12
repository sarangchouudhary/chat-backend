import { Router } from "express";
import * as controller from "../controllers/chat.controller";
import {
	chatParamsSchema,
	createChatSchema,
	lastSeenSchema,
	listChatsParamsSchema,
	messageParamsSchema,
	messagesQuerySchema,
	readSchema,
	sendMessageSchema,
} from "../schemas/chat.schemas";
import { validate } from "../utils/validate";

export const chatRouter = Router();
chatRouter.post("/chat/create", validate(createChatSchema, "body"), controller.createChat);
chatRouter.post("/chat/:chatId/message/send", validate(chatParamsSchema, "params"), validate(sendMessageSchema, "body"), controller.sendMessage);
chatRouter.get("/chat/:chatId/messages", validate(chatParamsSchema, "params"), validate(messagesQuerySchema, "query"), controller.getMessages);
chatRouter.post("/chat/:chatId/message/:messageId/read", validate(messageParamsSchema, "params"), validate(readSchema, "body"), controller.markRead);
chatRouter.post("/chat/:chatId/lastseen", validate(chatParamsSchema, "params"), validate(lastSeenSchema, "body"), controller.updateLastSeen);
chatRouter.get("/user/:userId/chats", validate(listChatsParamsSchema, "params"), controller.listChats);
