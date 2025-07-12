import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  conversationId: string;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  vibeId: mongoose.Types.ObjectId;
  content: string;
  messageType: "text" | "image" | "offer" | "system";
  attachments?: {
    type: "image" | "file";
    url: string;
    filename: string;
    size: number;
  }[];
  offerData?: {
    amount: number;
    message?: string;
    status: "pending" | "accepted" | "rejected" | "expired";
    expiresAt: Date;
  };
  isRead: boolean;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    vibeId: {
      type: Schema.Types.ObjectId,
      ref: "Vibe",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "offer", "system"],
      default: "text",
      index: true,
    },
    attachments: [
      {
        type: { type: String, enum: ["image", "file"] },
        url: String,
        filename: String,
        size: Number,
      },
    ],
    offerData: {
      amount: { type: Number, min: 0 },
      message: { type: String, maxlength: 200 },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "expired"],
        default: "pending",
      },
      expiresAt: Date,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  },
);

export const Message = mongoose.model<IMessage>("Message", messageSchema);
