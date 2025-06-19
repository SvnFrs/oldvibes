import { Post, type IVibe } from "../schema/vibe.schema";
import type {
  CreateVibeInput,
  UpdateVibeInput,
  VibeFilters,
  VibeResponse,
} from "../types/vibe.types";
import mongoose from "mongoose";

export class VibeModel {
  async create(userId: string, vibeData: CreateVibeInput): Promise<IVibe> {
    const vibe = new Post({
      ...vibeData,
      userId: new mongoose.Types.ObjectId(userId),
      status: "pending", // All vibes start as pending for moderation
    });

    return await vibe.save();
  }

  async getById(vibeId: string, userId?: string): Promise<VibeResponse | null> {
    const vibe = await Post.findById(vibeId)
      .populate("userId", "username name profilePicture isVerified")
      .populate("comments")
      .lean();

    if (!vibe) return null;

    return this.formatVibeResponse(vibe, userId);
  }

  async updateVibe(
    vibeId: string,
    userId: string,
    updateData: UpdateVibeInput,
  ): Promise<IVibe | null> {
    // Only allow updates if vibe is pending or user is owner
    const vibe = await Post.findOneAndUpdate(
      {
        _id: vibeId,
        userId,
        status: { $in: ["pending", "approved"] },
      },
      {
        ...updateData,
        status: "pending", // Reset to pending if edited
        updatedAt: new Date(),
      },
      { new: true, runValidators: true },
    );

    return vibe;
  }

  async deleteVibe(vibeId: string, userId: string): Promise<boolean> {
    const result = await Post.findOneAndDelete({
      _id: vibeId,
      userId,
    });

    return !!result;
  }

  async getVibes(filters: VibeFilters = {}): Promise<VibeResponse[]> {
    const query: any = {};

    // Build query based on filters
    if (filters.category) query.category = filters.category;
    if (filters.condition) query.condition = filters.condition;
    if (filters.status) query.status = filters.status;
    if (filters.userId) query.userId = filters.userId;
    if (filters.location) {
      query.location = { $regex: filters.location, $options: "i" };
    }
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }

    // Default to approved vibes if no status filter
    if (!filters.status) {
      query.status = "approved";
      query.expiresAt = { $gt: new Date() }; // Not expired
    }

    const vibes = await Post.find(query)
      .populate("userId", "username name profilePicture isVerified")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return vibes.map((vibe) => this.formatVibeResponse(vibe));
  }

  async getPendingVibes(): Promise<VibeResponse[]> {
    const vibes = await Post.find({ status: "pending" })
      .populate("userId", "username name profilePicture isVerified")
      .sort({ createdAt: 1 }) // Oldest first for fairness
      .lean();

    return vibes.map((vibe) => this.formatVibeResponse(vibe));
  }

  async moderateVibe(
    vibeId: string,
    staffId: string,
    action: "approve" | "reject",
    notes?: string,
  ): Promise<IVibe | null> {
    const updateData: any = {
      status: action === "approve" ? "approved" : "rejected",
      moderatedBy: new mongoose.Types.ObjectId(staffId),
      updatedAt: new Date(),
    };

    if (notes) {
      updateData.moderationNotes = notes;
    }

    const vibe = await Post.findByIdAndUpdate(vibeId, updateData, {
      new: true,
    });

    return vibe;
  }

  async markAsSold(vibeId: string, userId: string): Promise<boolean> {
    const result = await Post.findOneAndUpdate(
      { _id: vibeId, userId, status: "approved" },
      { status: "sold", updatedAt: new Date() },
    );

    return !!result;
  }

  async likeVibe(vibeId: string, userId: string): Promise<boolean> {
    const result = await Post.findByIdAndUpdate(vibeId, {
      $addToSet: { likes: userId },
    });

    return !!result;
  }

  async unlikeVibe(vibeId: string, userId: string): Promise<boolean> {
    const result = await Post.findByIdAndUpdate(vibeId, {
      $pull: { likes: userId },
    });

    return !!result;
  }

  async incrementViews(vibeId: string): Promise<void> {
    await Post.findByIdAndUpdate(vibeId, { $inc: { views: 1 } });
  }

  async addMediaFiles(
    vibeId: string,
    mediaFiles: Array<{
      type: "image" | "video";
      url: string;
      thumbnail?: string;
    }>,
  ): Promise<IVibe | null> {
    const vibe = await Post.findByIdAndUpdate(
      vibeId,
      { $push: { mediaFiles: { $each: mediaFiles } } },
      { new: true },
    );

    return vibe;
  }

  async archiveExpiredVibes(): Promise<number> {
    const result = await Post.updateMany(
      {
        status: "approved",
        expiresAt: { $lte: new Date() },
      },
      {
        status: "archived",
        updatedAt: new Date(),
      },
    );

    return result.modifiedCount;
  }

  async searchVibes(
    query: string,
    filters: VibeFilters = {},
  ): Promise<VibeResponse[]> {
    const searchQuery: any = {
      $and: [
        {
          $or: [
            { itemName: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { tags: { $regex: query, $options: "i" } },
          ],
        },
        { status: "approved" },
        { expiresAt: { $gt: new Date() } },
      ],
    };

    // Apply additional filters
    if (filters.category) searchQuery.$and.push({ category: filters.category });
    if (filters.condition)
      searchQuery.$and.push({ condition: filters.condition });
    if (filters.minPrice || filters.maxPrice) {
      const priceQuery: any = {};
      if (filters.minPrice) priceQuery.$gte = filters.minPrice;
      if (filters.maxPrice) priceQuery.$lte = filters.maxPrice;
      searchQuery.$and.push({ price: priceQuery });
    }

    const vibes = await Post.find(searchQuery)
      .populate("userId", "username name profilePicture isVerified")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return vibes.map((vibe) => this.formatVibeResponse(vibe));
  }

  async getTrendingVibes(): Promise<VibeResponse[]> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const vibes = await Post.find({
      status: "approved",
      expiresAt: { $gt: new Date() },
      createdAt: { $gte: twentyFourHoursAgo },
    })
      .populate("userId", "username name profilePicture isVerified")
      .sort({ likes: -1, views: -1 }) // Sort by engagement
      .limit(20)
      .lean();

    return vibes.map((vibe) => this.formatVibeResponse(vibe));
  }

  async getUserVibes(
    userId: string,
    requestingUserId?: string,
  ): Promise<VibeResponse[]> {
    const query: any = { userId };

    // If requesting user is different from profile user, only show approved vibes
    if (!requestingUserId || requestingUserId !== userId) {
      query.status = "approved";
      query.expiresAt = { $gt: new Date() };
    }

    const vibes = await Post.find(query)
      .populate("userId", "username name profilePicture isVerified")
      .sort({ createdAt: -1 })
      .lean();

    return vibes.map((vibe) => this.formatVibeResponse(vibe, requestingUserId));
  }

  private formatVibeResponse(vibe: any, userId?: string): VibeResponse {
    return {
      id: vibe._id.toString(),
      userId: vibe.userId._id.toString(),
      user: {
        username: vibe.userId.username,
        name: vibe.userId.name,
        profilePicture: vibe.userId.profilePicture,
        isVerified: vibe.userId.isVerified,
      },
      itemName: vibe.itemName,
      description: vibe.description,
      price: vibe.price,
      tags: vibe.tags,
      mediaFiles: vibe.mediaFiles,
      status: vibe.status,
      category: vibe.category,
      condition: vibe.condition,
      location: vibe.location,
      likesCount: vibe.likes?.length || 0,
      commentsCount: vibe.comments?.length || 0,
      views: vibe.views,
      isLiked: userId ? vibe.likes?.includes(userId) : undefined,
      expiresAt: vibe.expiresAt,
      createdAt: vibe.createdAt,
      updatedAt: vibe.updatedAt,
    };
  }
}
