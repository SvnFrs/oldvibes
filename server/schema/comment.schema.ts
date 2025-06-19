import mongoose, { Document } from "mongoose";

export interface IComment extends Document {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  parentComment?: mongoose.Types.ObjectId; // for replies
  isActive: boolean;
  createdAt: Date;
}
