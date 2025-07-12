import { Router } from "express";
import {
  startConversation,
  getUserConversations,
  getConversationMessages,
  sendMessageREST,
  markMessageAsRead,
} from "../controllers/chat.controllers";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireUser } from "../middleware/role.middleware";
import { requireEmailVerification } from "../middleware/emailVerification.middleware";
import type { RequestHandler } from "../types/handler.types";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateMessageInput:
 *       type: object
 *       required: [content]
 *       properties:
 *         content: { type: string, maxLength: 1000, example: "Hi! Is this item still available?" }
 *         messageType: { type: string, enum: [text, offer], default: text }
 *         offerData:
 *           type: object
 *           properties:
 *             amount: { type: number, minimum: 0, example: 120.00 }
 *             message: { type: string, maxLength: 200, example: "Would you accept $120?" }
 *
 *     MessageResponse:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         conversationId: { type: string }
 *         content: { type: string }
 *         messageType: { type: string }
 *         sender:
 *           type: object
 *           properties:
 *             id: { type: string }
 *             username: { type: string }
 *             name: { type: string }
 *             profilePicture: { type: string }
 *         isRead: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *
 *     ConversationResponse:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         conversationId: { type: string }
 *         vibe:
 *           type: object
 *           properties:
 *             id: { type: string }
 *             itemName: { type: string }
 *             price: { type: number }
 *             status: { type: string }
 *         participant:
 *           type: object
 *           properties:
 *             id: { type: string }
 *             username: { type: string }
 *             name: { type: string }
 *             profilePicture: { type: string }
 *         unreadCount: { type: number }
 *         lastMessage:
 *           type: object
 *           properties:
 *             content: { type: string }
 *             timestamp: { type: string, format: date-time }
 *             isFromMe: { type: boolean }
 */

/**
 * @swagger
 * /chat/conversations:
 *   get:
 *     summary: Get user conversations
 *     tags: [Chat]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *       - { in: query, name: offset, schema: { type: integer, default: 0 } }
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversations:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/ConversationResponse' }
 */
router.get(
  "/conversations",
  authenticateToken,
  requireUser as RequestHandler,
  getUserConversations,
);

/**
 * @swagger
 * /chat/vibes/{vibeId}/start:
 *   post:
 *     summary: Start conversation about a vibe
 *     tags: [Chat]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: vibeId, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Conversation started successfully }
 *       400: { description: Cannot start conversation with yourself }
 *       404: { description: Vibe not found or not available }
 *       403: { description: Email verification required }
 */
router.post(
  "/vibes/:vibeId/start",
  authenticateToken,
  requireUser as RequestHandler,
  requireEmailVerification,
  startConversation,
);

/**
 * @swagger
 * /chat/conversations/{conversationId}/messages:
 *   get:
 *     summary: Get conversation messages
 *     tags: [Chat]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: conversationId, required: true, schema: { type: string } }
 *       - { in: query, name: limit, schema: { type: integer, default: 50 } }
 *       - { in: query, name: offset, schema: { type: integer, default: 0 } }
 *     responses:
 *       200: { description: Messages retrieved successfully }
 *       403: { description: Unauthorized to access conversation }
 *   post:
 *     summary: Send message (REST fallback)
 *     tags: [Chat]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: conversationId, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateMessageInput' }
 *     responses:
 *       201: { description: Message sent successfully }
 *       403: { description: Unauthorized or email verification required }
 */
router.get(
  "/conversations/:conversationId/messages",
  authenticateToken,
  requireUser as RequestHandler,
  getConversationMessages,
);

router.post(
  "/conversations/:conversationId/messages",
  authenticateToken,
  requireUser as RequestHandler,
  requireEmailVerification,
  sendMessageREST,
);

/**
 * @swagger
 * /chat/messages/{messageId}/read:
 *   patch:
 *     summary: Mark message as read
 *     tags: [Chat]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: messageId, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Message marked as read }
 *       403: { description: Unauthorized to mark message as read }
 */
router.patch(
  "/messages/:messageId/read",
  authenticateToken,
  requireUser as RequestHandler,
  markMessageAsRead,
);

export default router;
