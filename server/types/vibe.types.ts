import type { IVibe } from "../schema/vibe.schema";

export interface CreateVibeInput {
  itemName: string;
  description: string;
  price: number;
  tags: string[];
  category: string;
  condition: "new" | "like-new" | "good" | "fair" | "poor";
  location?: string;
}

export interface UpdateVibeInput {
  itemName?: string;
  description?: string;
  price?: number;
  tags?: string[];
  category?: string;
  condition?: "new" | "like-new" | "good" | "fair" | "poor";
  location?: string;
}

export interface VibeFilters {
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  tags?: string[];
  status?: "pending" | "approved" | "rejected" | "sold" | "archived";
  userId?: string;
}

export interface VibeResponse {
  id: string;
  userId: string;
  user: {
    username: string;
    name: string;
    profilePicture?: string;
    isVerified: boolean;
  };
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
  category: string;
  condition: string;
  location?: string;
  likesCount: number;
  commentsCount: number;
  views: number;
  isLiked?: boolean; // For authenticated users
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModerationAction {
  vibeId: string;
  action: "approve" | "reject";
  notes?: string;
}
