import mongoose, { Document } from "mongoose";

export interface IMessage extends Document {
  conversationId: string;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  postId?: mongoose.Types.ObjectId; // related item
  content: string;
  messageType: "text" | "image" | "offer";
  isRead: boolean;
  createdAt: Date;
}
