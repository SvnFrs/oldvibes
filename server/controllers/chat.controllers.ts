import type { Response } from "express";
import { ChatService } from "../services/chat.services";
import { VibeModel } from "../models/vibe.models";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import type { CreateMessageInput } from "../types/chat.types";

const chatService = new ChatService();
const vibeModel = new VibeModel();

export const startConversation = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { vibeId } = req.params;
    const buyerId = req.user!.userId;

    if (!vibeId) {
      res.status(400).json({ message: "Vibe ID is required" });
      return;
    }

    // Get vibe and verify it exists and is approved
    const vibe = await vibeModel.getById(vibeId);
    if (!vibe || vibe.status !== "approved") {
      res.status(404).json({ message: "Vibe not found or not available" });
      return;
    }

    const sellerId = vibe.userId;

    // Prevent seller from starting conversation with themselves
    if (sellerId === buyerId) {
      res
        .status(400)
        .json({ message: "Cannot start conversation with yourself" });
      return;
    }

    // Create or get existing conversation
    const conversation = await chatService.createOrGetConversation(
      vibeId,
      sellerId,
      buyerId,
    );

    res.json({
      message: "Conversation started successfully",
      conversationId: conversation.conversationId,
      vibe: {
        id: vibe.id,
        itemName: vibe.itemName,
        price: vibe.price,
      },
    });
  } catch (error) {
    console.error("Start conversation error:", error);
    res.status(500).json({ message: "Error starting conversation", error });
  }
};

export const getUserConversations = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { limit = "20", offset = "0" } = req.query;

    const result = await chatService.getUserConversations(
      userId,
      parseInt(limit as string),
      parseInt(offset as string),
    );

    res.json({
      conversations: result.conversations,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ message: "Error fetching conversations", error });
  }
};

export const getConversationMessages = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.userId;
    const { limit = "50", offset = "0" } = req.query;

    if (!conversationId) {
      res.status(400).json({ message: "Conversation ID is required" });
      return;
    }

    const result = await chatService.getConversationMessages(
      conversationId,
      userId,
      parseInt(limit as string),
      parseInt(offset as string),
    );

    res.json({
      messages: result.messages,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      res.status(403).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Error fetching messages", error });
    }
  }
};

export const sendMessageREST = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.userId;
    const messageData: CreateMessageInput = req.body;

    if (!conversationId) {
      res.status(400).json({ message: "Conversation ID is required" });
      return;
    }

    const message = await chatService.sendMessage(
      conversationId,
      userId,
      messageData,
    );

    res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Send message (REST) error:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      res.status(403).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Error sending message", error });
    }
  }
};

export const markMessageAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { messageId } = req.params;
    const userId = req.user!.userId;

    if (!messageId) {
      res.status(400).json({ message: "Message ID is required" });
      return;
    }

    await chatService.markMessageAsRead(messageId, userId);

    res.json({ message: "Message marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      res.status(403).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Error marking message as read", error });
    }
  }
};
