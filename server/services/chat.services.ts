import { Message, type IMessage } from "../schema/message.schema";
import {
  Conversation,
  type IConversation,
} from "../schema/conversation.schema";
import { VibeModel } from "../models/vibe.models";
import { UserModel } from "../models/user.models";
import type {
  CreateMessageInput,
  MessageResponse,
  ConversationResponse,
} from "../types/chat.types";
import mongoose from "mongoose";
import crypto from "crypto";

export class ChatService {
  private vibeModel = new VibeModel();
  private userModel = new UserModel();

  generateConversationId(
    vibeId: string,
    sellerId: string,
    buyerId: string,
  ): string {
    // Create a deterministic conversation ID
    const ids = [vibeId, sellerId, buyerId].sort();
    return crypto
      .createHash("sha256")
      .update(ids.join("|"))
      .digest("hex")
      .substring(0, 16);
  }

  async createOrGetConversation(
    vibeId: string,
    sellerId: string,
    buyerId: string,
  ): Promise<IConversation> {
    const conversationId = this.generateConversationId(
      vibeId,
      sellerId,
      buyerId,
    );

    let conversation = await Conversation.findOne({ conversationId });

    if (!conversation) {
      conversation = new Conversation({
        conversationId,
        vibeId: new mongoose.Types.ObjectId(vibeId),
        sellerId: new mongoose.Types.ObjectId(sellerId),
        buyerId: new mongoose.Types.ObjectId(buyerId),
      });
      await conversation.save();
    }

    return conversation;
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    messageData: CreateMessageInput,
  ): Promise<MessageResponse> {
    try {
      const conversation = await Conversation.findOne({ conversationId });
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      // Verify sender is part of conversation
      const senderObjectId = new mongoose.Types.ObjectId(senderId);
      if (
        !conversation.sellerId.equals(senderObjectId) &&
        !conversation.buyerId.equals(senderObjectId)
      ) {
        throw new Error("Unauthorized to send message in this conversation");
      }

      const receiverId = conversation.sellerId.equals(senderObjectId)
        ? conversation.buyerId
        : conversation.sellerId;

      // Create message
      const message = new Message({
        conversationId,
        senderId: senderObjectId,
        receiverId,
        vibeId: conversation.vibeId,
        content: messageData.content,
        messageType: messageData.messageType || "text",
        offerData: messageData.offerData
          ? {
              ...messageData.offerData,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            }
          : undefined,
      });

      const savedMessage = await message.save();

      // Update conversation (fire and forget for better performance)
      const isSeller = conversation.sellerId.equals(senderObjectId);
      const updateData: any = {
        lastMessage: {
          content: messageData.content,
          senderId: senderObjectId,
          timestamp: new Date(),
          messageType: messageData.messageType || "text",
        },
        updatedAt: new Date(),
      };

      // Increment unread count for receiver
      if (isSeller) {
        updateData["$inc"] = { "unreadCount.buyer": 1 };
      } else {
        updateData["$inc"] = { "unreadCount.seller": 1 };
      }

      Conversation.findOneAndUpdate({ conversationId }, updateData).catch(
        (err) => console.error("Error updating conversation:", err),
      );

      // Format response
      const messageResponse = await this.formatMessageResponse(savedMessage);
      return messageResponse;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async getConversationMessages(
    conversationId: string,
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ messages: MessageResponse[]; hasMore: boolean }> {
    // Verify user is part of conversation
    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    if (
      !conversation.sellerId.equals(userObjectId) &&
      !conversation.buyerId.equals(userObjectId)
    ) {
      throw new Error("Unauthorized to access this conversation");
    }

    const messages = await Message.find({
      conversationId,
      isDeleted: false,
    })
      .populate("senderId", "username name profilePicture isVerified")
      .populate("receiverId", "username name profilePicture isVerified")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit + 1) // Get one extra to check if there are more
      .lean();

    const hasMore = messages.length > limit;
    if (hasMore) messages.pop(); // Remove the extra message

    const formattedMessages = messages
      .reverse()
      .map((message: any) => this.formatMessageResponse(message));

    return { messages: formattedMessages, hasMore };
  }

  async getUserConversations(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ conversations: ConversationResponse[]; hasMore: boolean }> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const conversations = await Conversation.find({
      $or: [{ sellerId: userObjectId }, { buyerId: userObjectId }],
      isActive: true,
    })
      .populate("vibeId", "itemName price status mediaFiles")
      .populate("sellerId", "username name profilePicture isVerified")
      .populate("buyerId", "username name profilePicture isVerified")
      .sort({ updatedAt: -1 })
      .skip(offset)
      .limit(limit + 1)
      .lean();

    const hasMore = conversations.length > limit;
    if (hasMore) conversations.pop();

    // Filter out conversations with missing vibe
    const formattedConversations = conversations
      .filter((conv: any) => conv.vibeId)
      .map((conv: any) => this.formatConversationResponse(conv, userId));

    return { conversations: formattedConversations, hasMore };
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error("Message not found");
      }

      // Only receiver can mark as read
      if (!message.receiverId.equals(new mongoose.Types.ObjectId(userId))) {
        throw new Error("Unauthorized to mark this message as read");
      }

      if (!message.isRead) {
        await Message.findByIdAndUpdate(messageId, { isRead: true });

        // Update conversation unread count (fire and forget)
        const conversation = await Conversation.findOne({
          conversationId: message.conversationId,
        });

        if (conversation) {
          const isSeller = conversation.sellerId.equals(
            new mongoose.Types.ObjectId(userId),
          );
          const updateField = isSeller
            ? "unreadCount.seller"
            : "unreadCount.buyer";

          Conversation.findOneAndUpdate(
            { conversationId: message.conversationId },
            { $inc: { [updateField]: -1 } },
          ).catch((err) =>
            console.error("Error updating conversation unread count:", err),
          );
        }
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw error;
    }
  }

  async updateOfferStatus(
    messageId: string,
    status: "accepted" | "rejected",
    userId: string,
  ): Promise<MessageResponse> {
    const message = await Message.findById(messageId);
    if (!message || message.messageType !== "offer") {
      throw new Error("Offer message not found");
    }

    // Only receiver can update offer status
    if (!message.receiverId.equals(new mongoose.Types.ObjectId(userId))) {
      throw new Error("Unauthorized to update this offer");
    }

    if (message.offerData?.status !== "pending") {
      throw new Error("Offer is no longer pending");
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        "offerData.status": status,
        updatedAt: new Date(),
      },
      { new: true },
    ).populate(
      "senderId receiverId",
      "username name profilePicture isVerified",
    );

    return this.formatMessageResponse(updatedMessage);
  }

  async validateConversationAccess(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) return false;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    return (
      conversation.sellerId.equals(userObjectId) ||
      conversation.buyerId.equals(userObjectId)
    );
  }

  private formatMessageResponse(message: any): MessageResponse {
    return {
      id: message._id.toString(),
      conversationId: message.conversationId,
      content: message.content,
      messageType: message.messageType,
      sender: {
        id: message.senderId._id.toString(),
        username: message.senderId.username,
        name: message.senderId.name,
        profilePicture: message.senderId.profilePicture,
      },
      receiver: {
        id: message.receiverId._id.toString(),
        username: message.receiverId.username,
        name: message.receiverId.name,
        profilePicture: message.receiverId.profilePicture,
      },
      attachments: message.attachments,
      offerData: message.offerData,
      isRead: message.isRead,
      isEdited: message.isEdited,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }

  private formatConversationResponse(
    conversation: any,
    userId: string,
  ): ConversationResponse {
    const isSeller = conversation.sellerId._id.toString() === userId;
    const participant = isSeller ? conversation.buyerId : conversation.sellerId;
    const unreadCount = isSeller
      ? conversation.unreadCount.seller
      : conversation.unreadCount.buyer;

    return {
      id: conversation._id.toString(),
      conversationId: conversation.conversationId,
      vibe: {
        id: conversation.vibeId._id.toString(),
        itemName: conversation.vibeId.itemName,
        price: conversation.vibeId.price,
        status: conversation.vibeId.status,
        mediaFiles: conversation.vibeId.mediaFiles,
      },
      participant: {
        id: participant._id.toString(),
        username: participant.username,
        name: participant.name,
        profilePicture: participant.profilePicture,
        isVerified: participant.isVerified,
      },
      lastMessage: conversation.lastMessage
        ? {
            content: conversation.lastMessage.content,
            timestamp: conversation.lastMessage.timestamp,
            messageType: conversation.lastMessage.messageType,
            isFromMe: conversation.lastMessage.senderId.toString() === userId,
          }
        : undefined,
      unreadCount,
      isActive: conversation.isActive,
      isBlocked: conversation.isBlocked,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }
}
