import { Chat } from "./Chat";
import { ChatMember } from "./ChatMember";
import { User } from "./User";

User.belongsToMany(Chat, { through: ChatMember, foreignKey: "userId", otherKey: "chatId", as: "chats" });
Chat.belongsToMany(User, { through: ChatMember, foreignKey: "chatId", otherKey: "userId", as: "members" });
Chat.belongsTo(User, { foreignKey: "userLowId", as: "userLow" });
Chat.belongsTo(User, { foreignKey: "userHighId", as: "userHigh" });

export { Chat, ChatMember, User };
