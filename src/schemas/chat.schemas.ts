import Joi from "joi";

const id = Joi.number().integer().positive().max(4294967295);
export const createChatSchema = Joi.object({
	userAId: id.required(),
	userBId: id.required().invalid(Joi.ref("userAId")),
});
export const chatParamsSchema = Joi.object({ chatId: id.required() });
export const sendMessageSchema = Joi.object({
	senderId: id.required(),
	text: Joi.string().trim().min(1).max(10000).required(),
});
export const messageParamsSchema = Joi.object({
	chatId: id.required(),
	messageId: Joi.string().trim().min(1).max(150).required(),
});
export const readSchema = Joi.object({ userId: id.required() });
export const lastSeenSchema = Joi.object({
	userId: id.required(),
	messageId: Joi.string().trim().min(1).max(150).required(),
});
export const listChatsParamsSchema = Joi.object({ userId: id.required() });
export const messagesQuerySchema = Joi.object({
	limit: Joi.number().integer().min(1).max(100).default(50),
	before: Joi.string().isoDate().optional(),
});
