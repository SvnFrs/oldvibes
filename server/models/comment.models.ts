import { Comment, type IComment } from "../schema/comment.schema";
import { Vibe } from "../schema/vibe.schema";
import type {
  CreateCommentInput,
  UpdateCommentInput,
  CommentResponse,
  CommentFilters,
} from "../types/comment.types";
import mongoose from "mongoose";

export class CommentModel {
  async create(
    userId: string,
    vibeId: string,
    commentData: CreateCommentInput,
  ): Promise<IComment> {
    try {
      // Create the comment first
      const comment = new Comment({
        userId: new mongoose.Types.ObjectId(userId),
        vibeId: new mongoose.Types.ObjectId(vibeId),
        content: commentData.content,
        parentComment: commentData.parentCommentId
          ? new mongoose.Types.ObjectId(commentData.parentCommentId)
          : null,
      });

      const savedComment = await comment.save();

      // Update vibe comments count (fire and forget - eventual consistency)
      Vibe.findByIdAndUpdate(vibeId, { $inc: { commentsCount: 1 } }).catch(
        (err) => console.error("Error updating vibe comment count:", err),
      );

      // If this is a reply, update parent comment's replies count
      if (commentData.parentCommentId) {
        Comment.findByIdAndUpdate(commentData.parentCommentId, {
          $inc: { repliesCount: 1 },
        }).catch((err) =>
          console.error("Error updating parent comment replies count:", err),
        );
      }

      return savedComment;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  }

  async getCommentsByVibe(filters: CommentFilters): Promise<{
    comments: CommentResponse[];
    total: number;
    hasMore: boolean;
  }> {
    const { vibeId, limit = 20, offset = 0, sortBy = "newest" } = filters;

    // Build sort criteria
    let sortCriteria: any = {};
    switch (sortBy) {
      case "oldest":
        sortCriteria = { createdAt: 1 };
        break;
      case "likes":
        sortCriteria = { likesCount: -1, createdAt: -1 };
        break;
      default: // newest
        sortCriteria = { createdAt: -1 };
    }

    // Get top-level comments only (no replies) with simplified query
    const query = {
      vibeId: new mongoose.Types.ObjectId(vibeId),
      parentComment: null,
      isActive: true,
    };

    // Get total count
    const total = await Comment.countDocuments(query);

    // Get comments with pagination
    const comments = await Comment.find(query)
      .populate("userId", "username name profilePicture isVerified")
      .sort(sortCriteria)
      .skip(offset)
      .limit(limit)
      .lean();

    const formattedComments = comments.map((comment: any) =>
      this.formatCommentResponse(comment),
    );

    return {
      comments: formattedComments,
      total,
      hasMore: offset + comments.length < total,
    };
  }

  async getReplies(
    parentCommentId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{
    replies: CommentResponse[];
    total: number;
    hasMore: boolean;
  }> {
    const query = {
      parentComment: new mongoose.Types.ObjectId(parentCommentId),
      isActive: true,
    };

    // Get total count
    const total = await Comment.countDocuments(query);

    // Get replies
    const replies = await Comment.find(query)
      .populate("userId", "username name profilePicture isVerified")
      .sort({ createdAt: 1 }) // Replies in chronological order
      .skip(offset)
      .limit(limit)
      .lean();

    const formattedReplies = replies.map((reply: any) =>
      this.formatCommentResponse(reply),
    );

    return {
      replies: formattedReplies,
      total,
      hasMore: offset + replies.length < total,
    };
  }

  async getById(commentId: string): Promise<CommentResponse | null> {
    const comment = await Comment.findOne({
      _id: commentId,
      isActive: true,
    })
      .populate("userId", "username name profilePicture isVerified")
      .lean();

    return comment ? this.formatCommentResponse(comment) : null;
  }

  async updateComment(
    commentId: string,
    userId: string,
    updateData: UpdateCommentInput,
  ): Promise<IComment | null> {
    const comment = await Comment.findOneAndUpdate(
      {
        _id: commentId,
        userId,
        isActive: true,
      },
      {
        content: updateData.content,
        isEdited: true,
        editedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true },
    );

    return comment;
  }

  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    try {
      const comment = await Comment.findOne({
        _id: commentId,
        userId,
        isActive: true,
      });

      if (!comment) {
        return false;
      }

      // Soft delete the comment
      await Comment.findByIdAndUpdate(commentId, {
        isActive: false,
        deletedAt: new Date(),
      });

      // Update vibe comments count (fire and forget)
      Vibe.findByIdAndUpdate(comment.vibeId, {
        $inc: { commentsCount: -1 },
      }).catch((err) =>
        console.error("Error updating vibe comment count:", err),
      );

      // If this is a reply, update parent comment's replies count
      if (comment.parentComment) {
        Comment.findByIdAndUpdate(comment.parentComment, {
          $inc: { repliesCount: -1 },
        }).catch((err) =>
          console.error("Error updating parent comment replies count:", err),
        );
      }

      // Soft delete all replies if this is a parent comment (fire and forget)
      if (!comment.parentComment) {
        Comment.updateMany(
          { parentComment: commentId, isActive: true },
          {
            isActive: false,
            deletedAt: new Date(),
          },
        )
          .then((result) => {
            // Update vibe comments count for deleted replies
            if (result.modifiedCount > 0) {
              Vibe.findByIdAndUpdate(comment.vibeId, {
                $inc: { commentsCount: -result.modifiedCount },
              }).catch((err) =>
                console.error(
                  "Error updating vibe comment count for replies:",
                  err,
                ),
              );
            }
          })
          .catch((err) => console.error("Error soft deleting replies:", err));
      }

      return true;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }

  async likeComment(commentId: string, userId: string): Promise<boolean> {
    try {
      // Check if already liked
      const comment = await Comment.findById(commentId);
      if (!comment) return false;

      const isAlreadyLiked = comment.likes.includes(
        new mongoose.Types.ObjectId(userId),
      );

      if (isAlreadyLiked) {
        // Unlike the comment
        await Comment.findByIdAndUpdate(commentId, {
          $pull: { likes: userId },
          $inc: { likesCount: -1 },
        });
      } else {
        // Like the comment
        await Comment.findByIdAndUpdate(commentId, {
          $addToSet: { likes: userId },
          $inc: { likesCount: 1 },
        });
      }

      return true;
    } catch (error) {
      console.error("Error liking comment:", error);
      return false;
    }
  }

  async unlikeComment(commentId: string, userId: string): Promise<boolean> {
    try {
      const result = await Comment.findByIdAndUpdate(commentId, {
        $pull: { likes: userId },
        $inc: { likesCount: -1 },
      });

      return !!result;
    } catch (error) {
      console.error("Error unliking comment:", error);
      return false;
    }
  }

  async getUserComments(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<CommentResponse[]> {
    const comments = await Comment.find({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
    })
      .populate("userId", "username name profilePicture isVerified")
      .populate("vibeId", "itemName status")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    return comments.map((comment) => this.formatCommentResponse(comment));
  }

  private formatCommentResponse(
    comment: any,
    userId?: string,
  ): CommentResponse {
    return {
      id: comment._id.toString(),
      vibeId: comment.vibeId._id
        ? comment.vibeId._id.toString()
        : comment.vibeId.toString(),
      content: comment.content,
      user: {
        id: comment.userId._id.toString(),
        username: comment.userId.username,
        name: comment.userId.name,
        profilePicture: comment.userId.profilePicture,
        isVerified: comment.userId.isVerified,
      },
      parentCommentId: comment.parentComment?.toString(),
      isActive: comment.isActive,
      likesCount: comment.likesCount || 0,
      repliesCount: comment.repliesCount || 0,
      isLiked: userId ? comment.likes?.includes(userId) : undefined,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}
