import type { Request, Response } from "express";
import { VibeModel } from "../models/vibe.models";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import type {
  CreateVibeInput,
  UpdateVibeInput,
  VibeFilters,
  ModerationAction,
} from "../types/vibe.types";

const vibeModel = new VibeModel();

export const createVibe = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const vibeData: CreateVibeInput = req.body;

    const newVibe = await vibeModel.create(userId, vibeData);

    res.status(201).json({
      message: "Vibe created and submitted for review",
      vibe: {
        id: newVibe._id,
        status: newVibe.status,
        expiresAt: newVibe.expiresAt,
      },
    });
  } catch (error) {
    console.error("Create vibe error:", error);
    res.status(500).json({ message: "Error creating vibe", error });
  }
};

export const getVibe = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { vibeId } = req.params;
    const userId = req.user?.userId;

    if (!vibeId) {
      res.status(400).json({ message: "Vibe ID is required" });
      return;
    }

    const vibe = await vibeModel.getById(vibeId, userId);

    if (!vibe) {
      res.status(404).json({ message: "Vibe not found" });
      return;
    }

    // Increment view count
    await vibeModel.incrementViews(vibeId);

    res.json({ vibe });
  } catch (error) {
    console.error("Get vibe error:", error);
    res.status(500).json({ message: "Error fetching vibe", error });
  }
};

export const updateVibe = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { vibeId } = req.params;
    const userId = req.user!.userId;
    const updateData: UpdateVibeInput = req.body;

    if (!vibeId) {
      res.status(400).json({ message: "Vibe ID is required" });
      return;
    }

    const updatedVibe = await vibeModel.updateVibe(vibeId, userId, updateData);

    if (!updatedVibe) {
      res.status(404).json({
        message: "Vibe not found or cannot be updated",
      });
      return;
    }

    res.json({
      message: "Vibe updated and resubmitted for review",
      vibe: {
        id: updatedVibe._id,
        status: updatedVibe.status,
      },
    });
  } catch (error) {
    console.error("Update vibe error:", error);
    res.status(500).json({ message: "Error updating vibe", error });
  }
};

export const deleteVibe = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { vibeId } = req.params;
    const userId = req.user!.userId;

    if (!vibeId) {
      res.status(400).json({ message: "Vibe ID is required" });
      return;
    }

    const deleted = await vibeModel.deleteVibe(vibeId, userId);

    if (!deleted) {
      res.status(404).json({ message: "Vibe not found" });
      return;
    }

    res.json({ message: "Vibe deleted successfully" });
  } catch (error) {
    console.error("Delete vibe error:", error);
    res.status(500).json({ message: "Error deleting vibe", error });
  }
};

export const getVibes = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const filters: VibeFilters = {
      category: req.query.category as string,
      condition: req.query.condition as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      location: req.query.location as string,
      tags: req.query.tags ? (req.query.tags as string).split(",") : undefined,
    };

    const vibes = await vibeModel.getVibes(filters);

    res.json({ vibes, count: vibes.length });
  } catch (error) {
    console.error("Get vibes error:", error);
    res.status(500).json({ message: "Error fetching vibes", error });
  }
};

export const searchVibes = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { q: query } = req.query;

    if (!query || typeof query !== "string") {
      res.status(400).json({ message: "Search query is required" });
      return;
    }

    const filters: VibeFilters = {
      category: req.query.category as string,
      condition: req.query.condition as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    };

    const vibes = await vibeModel.searchVibes(query, filters);

    res.json({ vibes, count: vibes.length, query });
  } catch (error) {
    console.error("Search vibes error:", error);
    res.status(500).json({ message: "Error searching vibes", error });
  }
};

export const getTrendingVibes = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const vibes = await vibeModel.getTrendingVibes();
    res.json({ vibes, count: vibes.length });
  } catch (error) {
    console.error("Get trending vibes error:", error);
    res.status(500).json({ message: "Error fetching trending vibes", error });
  }
};

export const getUserVibes = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.userId;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const vibes = await vibeModel.getUserVibes(userId, requestingUserId);

    res.json({ vibes, count: vibes.length });
  } catch (error) {
    console.error("Get user vibes error:", error);
    res.status(500).json({ message: "Error fetching user vibes", error });
  }
};

export const likeVibe = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { vibeId } = req.params;
    const userId = req.user!.userId;

    if (!vibeId) {
      res.status(400).json({ message: "Vibe ID is required" });
      return;
    }

    await vibeModel.likeVibe(vibeId, userId);

    res.json({ message: "Vibe liked successfully" });
  } catch (error) {
    console.error("Like vibe error:", error);
    res.status(500).json({ message: "Error liking vibe", error });
  }
};

export const unlikeVibe = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { vibeId } = req.params;
    const userId = req.user!.userId;

    if (!vibeId) {
      res.status(400).json({ message: "Vibe ID is required" });
      return;
    }

    await vibeModel.unlikeVibe(vibeId, userId);

    res.json({ message: "Vibe unliked successfully" });
  } catch (error) {
    console.error("Unlike vibe error:", error);
    res.status(500).json({ message: "Error unliking vibe", error });
  }
};

export const markAsSold = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { vibeId } = req.params;
    const userId = req.user!.userId;

    if (!vibeId) {
      res.status(400).json({ message: "Vibe ID is required" });
      return;
    }

    const success = await vibeModel.markAsSold(vibeId, userId);

    if (!success) {
      res.status(404).json({ message: "Vibe not found or already sold" });
      return;
    }

    res.json({ message: "Vibe marked as sold successfully" });
  } catch (error) {
    console.error("Mark as sold error:", error);
    res.status(500).json({ message: "Error marking vibe as sold", error });
  }
};

// Moderation endpoints (Staff/Admin only)
export const getPendingVibes = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const vibes = await vibeModel.getPendingVibes();
    res.json({ vibes, count: vibes.length });
  } catch (error) {
    console.error("Get pending vibes error:", error);
    res.status(500).json({ message: "Error fetching pending vibes", error });
  }
};

export const moderateVibe = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { vibeId } = req.params;
    const staffId = req.user!.userId;
    const { action, notes }: ModerationAction = req.body;

    if (!vibeId) {
      res.status(400).json({ message: "Vibe ID is required" });
      return;
    }

    if (!["approve", "reject"].includes(action)) {
      res.status(400).json({
        message: "Invalid action. Must be 'approve' or 'reject'",
      });
      return;
    }

    const moderatedVibe = await vibeModel.moderateVibe(
      vibeId,
      staffId,
      action,
      notes,
    );

    if (!moderatedVibe) {
      res.status(404).json({ message: "Vibe not found" });
      return;
    }

    res.json({
      message: `Vibe ${action}d successfully`,
      vibe: {
        id: moderatedVibe._id,
        status: moderatedVibe.status,
        moderationNotes: moderatedVibe.moderationNotes,
      },
    });
  } catch (error) {
    console.error("Moderate vibe error:", error);
    res.status(500).json({ message: "Error moderating vibe", error });
  }
};

export const uploadVibeMedia = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { vibeId } = req.params;
    const files = req.files as Express.MulterS3.File[];

    if (!vibeId) {
      res.status(400).json({ message: "Vibe ID is required" });
      return;
    }

    if (!files || files.length === 0) {
      res.status(400).json({ message: "No files uploaded" });
      return;
    }

    const mediaFiles = files.map((file) => ({
      type: file.mimetype.startsWith("video")
        ? ("video" as const)
        : ("image" as const),
      url: file.location,
      thumbnail: file.mimetype.startsWith("video") ? undefined : file.location,
    }));

    const updatedVibe = await vibeModel.addMediaFiles(vibeId, mediaFiles);

    if (!updatedVibe) {
      res.status(404).json({ message: "Vibe not found" });
      return;
    }

    res.json({
      message: "Media uploaded successfully",
      mediaFiles: updatedVibe.mediaFiles,
    });
  } catch (error) {
    console.error("Upload media error:", error);
    res.status(500).json({ message: "Error uploading media", error });
  }
};
