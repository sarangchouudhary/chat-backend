import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { Op, Transaction } from "sequelize";
import { firestore } from "../config/firebase";
import { sequelize } from "../config/database";
import { Chat, ChatMember, User } from "../models";
import { HttpError } from "../utils/httpError";

const messageCollection = (chatId: number) => firestore.collection("chats").doc(String(chatId)).collection("messages");

async function ensureMember(chatId: number, userId: number): Promise<void> {
	const membership = await ChatMember.findOne({ where: { chatId, userId } });
	if (!membership) throw new HttpError(403, "User is not a member of this chat");
}

export async function createOrGetChat(userAId: number, userBId: number) {
	const [userLowId, userHighId] = [userAId, userBId].sort((a, b) => a - b);
	return sequelize.transaction(async (transaction: Transaction) => {
		const users = await User.findAll({ where: { id: { [Op.in]: [userLowId, userHighId] } }, transaction });
		if (users.length !== 2) throw new HttpError(404, "One or both users were not found");
		let chat = await Chat.findOne({ where: { userLowId, userHighId }, transaction, lock: transaction.LOCK.UPDATE });
		if (!chat) {
			try {
				chat = await Chat.create({ userLowId, userHighId }, { transaction });
			} catch (error) {
				// Concurrent create requests can race on the pair's unique constraint.
				if (!(error instanceof Error) || !("name" in error && error.name === "SequelizeUniqueConstraintError")) throw error;
				chat = await Chat.findOne({ where: { userLowId, userHighId }, transaction });
				if (!chat) throw error;
			}
		}
		await ChatMember.bulkCreate([{ chatId: chat.id, userId: userLowId }, { chatId: chat.id, userId: userHighId }], { ignoreDuplicates: true, transaction });
		return chat;
	});
}

export async function sendMessage(chatId: number, senderId: number, text: string) {
	const chat = await Chat.findByPk(chatId);
	if (!chat) throw new HttpError(404, "Chat was not found");
	await ensureMember(chatId, senderId);
	const reference = messageCollection(chatId).doc();
	const timestamp = FieldValue.serverTimestamp();
	await reference.create({ chatId: String(chatId), senderId, text, timestamp, createdAt: timestamp });
	await chat.update({ updatedAt: new Date() });
	const saved = await reference.get();
	return { messageId: reference.id, ...saved.data(), timestamp: (saved.get("timestamp") as Timestamp | undefined)?.toDate().toISOString() ?? null };
}

export async function getMessages(chatId: number, limit: number, before?: string) {
	if (!(await Chat.findByPk(chatId))) throw new HttpError(404, "Chat was not found");
	let query = messageCollection(chatId).orderBy("timestamp", "desc");
	if (before) query = query.where("timestamp", "<", Timestamp.fromDate(new Date(before)));
	const snapshot = await query.limit(limit).get();
	const messages = snapshot.docs.map((doc) => {
		const value = doc.data();
		return { messageId: doc.id, ...value, timestamp: (value.timestamp as Timestamp | undefined)?.toDate().toISOString() ?? null };
	});
	return messages.reverse();
}

export async function markMessageRead(chatId: number, messageId: string, userId: number) {
	if (!(await Chat.findByPk(chatId))) throw new HttpError(404, "Chat was not found");
	await ensureMember(chatId, userId);
	const message = messageCollection(chatId).doc(messageId);
	const existing = await message.get();
	if (!existing.exists) throw new HttpError(404, "Message was not found");
	await message.collection("readReceipts").doc(String(userId)).set({ userId, readAt: FieldValue.serverTimestamp() }, { merge: true });
	return { chatId, messageId, userId, read: true };
}

export async function updateLastSeen(chatId: number, messageId: string, userId: number) {
	if (!(await Chat.findByPk(chatId))) throw new HttpError(404, "Chat was not found");
	await ensureMember(chatId, userId);
	const message = messageCollection(chatId).doc(messageId);
	const existing = await message.get();
	if (!existing.exists) throw new HttpError(404, "Message was not found");
	const lastSeen = firestore.collection("chats").doc(String(chatId)).collection("lastSeen").doc(String(userId));
	await firestore.runTransaction(async (transaction) => {
		const current = await transaction.get(lastSeen);
		const oldTimestamp = current.get("messageTimestamp") as Timestamp | undefined;
		const newTimestamp = existing.get("timestamp") as Timestamp | undefined;
		if (!oldTimestamp || !newTimestamp || newTimestamp.toMillis() >= oldTimestamp.toMillis()) {
			transaction.set(lastSeen, { userId, messageId, messageTimestamp: newTimestamp ?? null, updatedAt: FieldValue.serverTimestamp() });
		}
	});
	return { chatId, userId, messageId };
}

export async function listUserChats(userId: number) {
	if (!(await User.findByPk(userId))) throw new HttpError(404, "User was not found");
	const memberships = await ChatMember.findAll({ where: { userId }, attributes: ["chatId"], order: [["createdAt", "DESC"]] });
	const chats = await Chat.findAll({ where: { id: { [Op.in]: memberships.map(({ chatId }) => chatId) } }, order: [["updatedAt", "DESC"]] });
	return chats.map((chat) => ({
		chatId: chat.id,
		memberIds: [chat.userLowId, chat.userHighId],
		createdAt: chat.createdAt.toISOString(),
	}));
}
