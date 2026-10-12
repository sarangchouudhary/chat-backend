import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Chat extends Model<InferAttributes<Chat>, InferCreationAttributes<Chat>> {
	declare id: CreationOptional<number>;
	declare userLowId: number;
	declare userHighId: number;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
}

Chat.init({
	id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
	userLowId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
	userHighId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
	createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal("CURRENT_TIMESTAMP") },
	updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") },
}, { sequelize, tableName: "chats", indexes: [{ unique: true, fields: ["user_low_id", "user_high_id"] }] });
