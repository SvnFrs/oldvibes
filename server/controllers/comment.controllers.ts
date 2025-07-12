import type { Response } from "express";
import { CommentModel } from "../models/comment.models";
import { VibeModel } from "../models/vibe.models";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import type {
  CreateCommentInput,
  UpdateCommentInput,
  CommentFilters,
} from "../types/comment.types";

const commentModel = new CommentModel();
const vibeModel = new VibeModel();

export const createComment = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { vibeId } = req.params;
    const userId = req.user!.userId;
    const commentData: CreateCommentInput = req.body;

    if (!vibeId) {
      res.status(400).json({ message: "Vibe ID is required" });
      return;
    }

    // Check if vibe exists and is approved
    const vibe = await vibeModel.getById(vibeId);
    if (!vibe || vibe.status !== "approved") {
      res.status(404).json({
        message: "Vibe not found or not available for comments",
      });
      return;
    }

    // If this is a reply, check if parent comment exists
    if (commentData.parentCommentId) {
      const parentComment = await commentModel.getById(
        commentData.parentCommentId,
      );
      if (!parentComment || parentComment.vibeId !== vibeId) {
        res.status(404).json({ message: "Parent comment not found" });
        return;
      }
    }

    const newComment = await commentModel.create(userId, vibeId, commentData);

    res.status(201).json({
      message: "Comment created successfully",
      comment: {
        id: newComment._id,
        content: newComment.content,
        createdAt: newComment.createdAt,
      },
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ message: "Error creating comment", error });
  }
};

export const getVibeComments = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { vibeId } = req.params;
    const { limit = "20", offset = "0", sortBy = "newest" } = req.query;

    if (!vibeId) {
      res.status(400).json({ message: "Vibe ID is required" });
      return;
    }

    const filters: CommentFilters = {
      vibeId,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      sortBy: sortBy as "newest" | "oldest" | "likes",
    };

    const result = await commentModel.getCommentsByVibe(filters);

    res.json({
      comments: result.comments,
      pagination: {
        total: result.total,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    console.error("Get vibe comments error:", error);
    res.status(500).json({ message: "Error fetching comments", error });
  }
};

export const getCommentReplies = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const { limit = "10", offset = "0" } = req.query;

    if (!commentId) {
      res.status(400).json({ message: "Comment ID is required" });
      return;
    }

    const result = await commentModel.getReplies(
      commentId,
      parseInt(limit as string),
      parseInt(offset as string),
    );

    res.json({
      replies: result.replies,
      pagination: {
        total: result.total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    console.error("Get comment replies error:", error);
    res.status(500).json({ message: "Error fetching replies", error });
  }
};

export const updateComment = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.userId;
    const updateData: UpdateCommentInput = req.body;

    if (!commentId) {
      res.status(400).json({ message: "Comment ID is required" });
      return;
    }

    const updatedComment = await commentModel.updateComment(
      commentId,
      userId,
      updateData,
    );

    if (!updatedComment) {
      res.status(404).json({
        message: "Comment not found or you're not authorized to update it",
      });
      return;
    }

    res.json({
      message: "Comment updated successfully",
      comment: {
        id: updatedComment._id,
        content: updatedComment.content,
        updatedAt: updatedComment.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({ message: "Error updating comment", error });
  }
};

export const deleteComment = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.userId;

    if (!commentId) {
      res.status(400).json({ message: "Comment ID is required" });
      return;
    }

    const deleted = await commentModel.deleteComment(commentId, userId);

    if (!deleted) {
      res.status(404).json({
        message: "Comment not found or you're not authorized to delete it",
      });
      return;
    }

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Error deleting comment", error });
  }
};

export const likeComment = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.userId;

    if (!commentId) {
      res.status(400).json({ message: "Comment ID is required" });
      return;
    }

    await commentModel.likeComment(commentId, userId);
    res.json({ message: "Comment liked successfully" });
  } catch (error) {
    console.error("Like comment error:", error);
    res.status(500).json({ message: "Error liking comment", error });
  }
};

export const unlikeComment = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.userId;

    if (!commentId) {
      res.status(400).json({ message: "Comment ID is required" });
      return;
    }

    await commentModel.unlikeComment(commentId, userId);
    res.json({ message: "Comment unliked successfully" });
  } catch (error) {
    console.error("Unlike comment error:", error);
    res.status(500).json({ message: "Error unliking comment", error });
  }
};

export const getUserComments = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { limit = "20", offset = "0" } = req.query;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const comments = await commentModel.getUserComments(
      userId,
      parseInt(limit as string),
      parseInt(offset as string),
    );

    res.json({ comments, count: comments.length });
  } catch (error) {
    console.error("Get user comments error:", error);
    res.status(500).json({ message: "Error fetching user comments", error });
  }
};
