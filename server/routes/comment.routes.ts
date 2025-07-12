import { Router } from "express";
import {
  createComment,
  getVibeComments,
  getCommentReplies,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  getUserComments,
} from "../controllers/comment.controllers";
import { getShareUrl } from "../controllers/share.controllers";
import { authenticateToken, optionalAuth } from "../middleware/auth.middleware";
import { requireUser } from "../middleware/role.middleware";
import { requireEmailVerification } from "../middleware/emailVerification.middleware";
import {
  validateCommentCreation,
  validateCommentUpdate,
} from "../middleware/validation.middleware";
import type { RequestHandler } from "../types/handler.types";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCommentInput:
 *       type: object
 *       required: [content]
 *       properties:
 *         content: { type: string, maxLength: 500, example: "Great item! Is it still available?" }
 *         parentCommentId: { type: string, description: "ID of parent comment for replies" }
 *
 *     CommentResponse:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         vibeId: { type: string }
 *         content: { type: string }
 *         user:
 *           type: object
 *           properties:
 *             id: { type: string }
 *             username: { type: string }
 *             name: { type: string }
 *             profilePicture: { type: string }
 *             isVerified: { type: boolean }
 *         parentCommentId: { type: string }
 *         likesCount: { type: number }
 *         repliesCount: { type: number }
 *         isLiked: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *
 *     ShareVibeResponse:
 *       type: object
 *       properties:
 *         shareUrl: { type: string }
 *         shareText: { type: string }
 *         socialLinks:
 *           type: object
 *           properties:
 *             twitter: { type: string }
 *             facebook: { type: string }
 *             whatsapp: { type: string }
 *             telegram: { type: string }
 *
 *   parameters:
 *     vibeId:
 *       in: path
 *       name: vibeId
 *       required: true
 *       schema: { type: string }
 *     commentId:
 *       in: path
 *       name: commentId
 *       required: true
 *       schema: { type: string }
 */

/**
 * @swagger
 * /vibes/{vibeId}/comments:
 *   post:
 *     summary: Create comment or reply
 *     tags: [Comments]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/vibeId' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateCommentInput' }
 *     responses:
 *       201: { description: Comment created successfully }
 *       400: { description: Invalid input or vibe not available }
 *       403: { description: Email verification required }
 *   get:
 *     summary: Get vibe comments
 *     tags: [Comments]
 *     parameters:
 *       - { $ref: '#/components/parameters/vibeId' }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *       - { in: query, name: offset, schema: { type: integer, default: 0 } }
 *       - { in: query, name: sortBy, schema: { type: string, enum: [newest, oldest, likes], default: newest } }
 *     responses:
 *       200: { description: Comments retrieved successfully }
 */
router.post(
  "/vibes/:vibeId/comments",
  authenticateToken,
  requireUser as RequestHandler,
  requireEmailVerification,
  validateCommentCreation,
  createComment,
);
router.get("/vibes/:vibeId/comments", optionalAuth, getVibeComments);

/**
 * @swagger
 * /comments/{commentId}/replies:
 *   get:
 *     summary: Get comment replies
 *     tags: [Comments]
 *     parameters:
 *       - { $ref: '#/components/parameters/commentId' }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *       - { in: query, name: offset, schema: { type: integer, default: 0 } }
 *     responses:
 *       200: { description: Replies retrieved successfully }
 */
router.get("/comments/:commentId/replies", optionalAuth, getCommentReplies);

/**
 * @swagger
 * /comments/{commentId}:
 *   put:
 *     summary: Update comment
 *     tags: [Comments]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/commentId' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: string, maxLength: 500 }
 *     responses:
 *       200: { description: Comment updated successfully }
 *       404: { description: Comment not found or unauthorized }
 *   delete:
 *     summary: Delete comment
 *     tags: [Comments]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/commentId' }]
 *     responses:
 *       200: { description: Comment deleted successfully }
 *       404: { description: Comment not found or unauthorized }
 */
router.put(
  "/comments/:commentId",
  authenticateToken,
  requireUser as RequestHandler,
  validateCommentUpdate,
  updateComment,
);
router.delete(
  "/comments/:commentId",
  authenticateToken,
  requireUser as RequestHandler,
  deleteComment,
);

/**
 * @swagger
 * /comments/{commentId}/like:
 *   post:
 *     summary: Like comment
 *     tags: [Comments]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/commentId' }]
 *     responses:
 *       200: { description: Comment liked successfully }
 *   delete:
 *     summary: Unlike comment
 *     tags: [Comments]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/commentId' }]
 *     responses:
 *       200: { description: Comment unliked successfully }
 */
router.post(
  "/comments/:commentId/like",
  authenticateToken,
  requireUser as RequestHandler,
  requireEmailVerification,
  likeComment,
);
router.delete(
  "/comments/:commentId/like",
  authenticateToken,
  requireUser as RequestHandler,
  unlikeComment,
);

/**
 * @swagger
 * /users/{userId}/comments:
 *   get:
 *     summary: Get user comments
 *     tags: [Comments]
 *     parameters:
 *       - { in: path, name: userId, required: true, schema: { type: string } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *       - { in: query, name: offset, schema: { type: integer, default: 0 } }
 *     responses:
 *       200: { description: User comments retrieved successfully }
 */
router.get("/users/:userId/comments", getUserComments);

/**
 * @swagger
 * /vibes/{vibeId}/share:
 *   get:
 *     summary: Get vibe share URLs
 *     tags: [Share]
 *     parameters: [{ $ref: '#/components/parameters/vibeId' }]
 *     responses:
 *       200:
 *         description: Share URLs generated successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ShareVibeResponse' }
 *       404: { description: Vibe not found or not available }
 */
router.get("/vibes/:vibeId/share", getShareUrl);

export default router;
