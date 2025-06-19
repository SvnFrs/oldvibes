import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  conversationId: string;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  postId?: mongoose.Types.ObjectId;
  content: string;
  messageType: "text" | "image" | "offer";
  isRead: boolean;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: String, required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Vibe" },
    content: { type: String, required: true },
    messageType: {
      type: String,
      enum: ["text", "image", "offer"],
      default: "text",
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Message = mongoose.model<IMessage>("Message", messageSchema);
