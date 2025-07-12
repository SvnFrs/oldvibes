import mongoose, { Document, Schema } from "mongoose";

export interface IComment extends Document {
  vibeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  parentComment?: mongoose.Types.ObjectId; // For replies
  isActive: boolean;
  likesCount: number;
  repliesCount: number;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    vibeId: {
      type: Schema.Types.ObjectId,
      ref: "Vibe",
      required: true,
      index: true, // Index for efficient queries
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true, // Index for efficient reply queries
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    repliesCount: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Comment = mongoose.model<IComment>("Comment", commentSchema);
