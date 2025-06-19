import mongoose, { Document } from "mongoose";

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId;
  itemName: string;
  description: string;
  price: number;
  tags: string[];
  mediaFiles: {
    type: "image" | "video";
    url: string;
    thumbnail?: string;
  }[];
  status: "pending" | "approved" | "rejected" | "sold" | "archived";
  moderationNotes?: string;
  moderatedBy?: mongoose.Types.ObjectId;
  category: string;
  condition: "new" | "like-new" | "good" | "fair" | "poor";
  location?: string;
  likes: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  views: number;
  expiresAt: Date; // 24-hour expiry
  createdAt: Date;
  updatedAt: Date;
}
