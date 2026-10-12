import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class ChatMember extends Model<InferAttributes<ChatMember>, InferCreationAttributes<ChatMember>> {
	declare chatId: number;
	declare userId: number;
	declare createdAt: CreationOptional<Date>;
}

ChatMember.init({
	chatId: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, allowNull: false },
	userId: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, allowNull: false },
	createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal("CURRENT_TIMESTAMP") },
}, { sequelize, tableName: "chat_members", updatedAt: false });
