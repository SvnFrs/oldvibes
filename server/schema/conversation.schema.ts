import mongoose, { Document, Schema } from "mongoose";

export interface IConversation extends Document {
  conversationId: string;
  vibeId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  lastMessage?: {
    content: string;
    senderId: mongoose.Types.ObjectId;
    timestamp: Date;
    messageType: string;
  };
  unreadCount: {
    seller: number;
    buyer: number;
  };
  isActive: boolean;
  isBlocked: boolean;
  blockedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    vibeId: {
      type: Schema.Types.ObjectId,
      ref: "Vibe",
      required: true,
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lastMessage: {
      content: String,
      senderId: { type: Schema.Types.ObjectId, ref: "User" },
      timestamp: Date,
      messageType: String,
    },
    unreadCount: {
      seller: { type: Number, default: 0 },
      buyer: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    // Compound indexes
    index: [
      { sellerId: 1, buyerId: 1, vibeId: 1 },
      { sellerId: 1, isActive: 1, updatedAt: -1 },
      { buyerId: 1, isActive: 1, updatedAt: -1 },
    ],
  },
);

export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema,
);
