import mongoose, { Document, Schema } from "mongoose";

export interface IComment extends Document {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  parentComment?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Vibe", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 300 },
    parentComment: { type: Schema.Types.ObjectId, ref: "Comment" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Comment = mongoose.model<IComment>("Comment", commentSchema);
