import { Request, Response } from "express";
import { validated } from "../utils/validate";
import * as chatService from "../services/chat.service";

type CreateChatBody = { userAId: number; userBId: number };
type SendMessageBody = { senderId: number; text: string };
type UserBody = { userId: number };
type LastSeenBody = UserBody & { messageId: string };
type MessageParams = { chatId: number; messageId: string };
type ChatParams = { chatId: number };
type ListParams = { userId: number };
type MessageQuery = { limit: number; before?: string };

export async function createChat(request: Request, response: Response): Promise<void> {
	const { userAId, userBId } = validated<CreateChatBody>(request, "body");
	const chat = await chatService.createOrGetChat(userAId, userBId);
	response.status(200).json({ chatId: chat.id });
}

export async function sendMessage(request: Request, response: Response): Promise<void> {
	const { chatId } = validated<ChatParams>(request, "params");
	const { senderId, text } = validated<SendMessageBody>(request, "body");
	response.status(201).json(await chatService.sendMessage(chatId, senderId, text));
}

export async function getMessages(request: Request, response: Response): Promise<void> {
	const { chatId } = validated<ChatParams>(request, "params");
	const { limit, before } = validated<MessageQuery>(request, "query");
	response.status(200).json({ messages: await chatService.getMessages(chatId, limit, before) });
}

export async function markRead(request: Request, response: Response): Promise<void> {
	const { chatId, messageId } = validated<MessageParams>(request, "params");
	const { userId } = validated<UserBody>(request, "body");
	response.status(200).json(await chatService.markMessageRead(chatId, messageId, userId));
}

export async function updateLastSeen(request: Request, response: Response): Promise<void> {
	const { chatId } = validated<ChatParams>(request, "params");
	const body = validated<LastSeenBody>(request, "body");
	response.status(200).json(await chatService.updateLastSeen(chatId, body.messageId, body.userId));
}

export async function listChats(request: Request, response: Response): Promise<void> {
	const { userId } = validated<ListParams>(request, "params");
	response.status(200).json({ chats: await chatService.listUserChats(userId) });
}
