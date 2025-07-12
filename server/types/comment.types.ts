export interface CreateCommentInput {
  content: string;
  parentCommentId?: string; // For replies
}

export interface UpdateCommentInput {
  content: string;
}

export interface CommentResponse {
  id: string;
  vibeId: string;
  content: string;
  user: {
    id: string;
    username: string;
    name: string;
    profilePicture?: string;
    isVerified: boolean;
  };
  parentCommentId?: string;
  isActive: boolean;
  likesCount: number;
  repliesCount: number;
  isLiked?: boolean;
  replies?: CommentResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentFilters {
  vibeId: string;
  parentCommentId?: string;
  limit?: number;
  offset?: number;
  sortBy?: "newest" | "oldest" | "likes";
}

export interface ShareVibeResponse {
  shareUrl: string;
  shortUrl?: string;
  shareText: string;
  socialLinks: {
    twitter: string;
    facebook: string;
    whatsapp: string;
    telegram: string;
  };
}
