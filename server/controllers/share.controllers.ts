import type { Response } from "express";
import { VibeModel } from "../models/vibe.models";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import type { ShareVibeResponse } from "../types/comment.types";

const vibeModel = new VibeModel();

export const getShareUrl = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { vibeId } = req.params;

    if (!vibeId) {
      res.status(400).json({ message: "Vibe ID is required" });
      return;
    }

    const vibe = await vibeModel.getById(vibeId);
    if (!vibe || vibe.status !== "approved") {
      res.status(404).json({ message: "Vibe not found or not available" });
      return;
    }

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/vibes/${vibeId}`;
    const shareText = `Check out this amazing ${vibe.itemName} for $${vibe.price} on Old Vibes! 🌊`;

    const response: ShareVibeResponse = {
      shareUrl,
      shareText,
      socialLinks: {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Get share URL error:", error);
    res.status(500).json({ message: "Error generating share URL", error });
  }
};
