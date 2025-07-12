import { Router } from "express";
import {
  createVibe,
  getVibe,
  updateVibe,
  deleteVibe,
  getVibes,
  searchVibes,
  getTrendingVibes,
  getUserVibes,
  likeVibe,
  unlikeVibe,
  markAsSold,
  getPendingVibes,
  moderateVibe,
  uploadVibeMedia,
} from "../controllers/vibe.controllers";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireStaff, requireUser } from "../middleware/role.middleware";
import { validateVibeCreation } from "../middleware/validation.middleware";
import { uploadToS3 } from "../middleware/upload.middleware";
import { requireEmailVerification } from "../middleware/emailVerification.middleware";
import type { RequestHandler } from "../types/handler.types";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateVibeInput:
 *       type: object
 *       required: [itemName, description, price, category, condition]
 *       properties:
 *         itemName: { type: string, example: "Vintage Camera" }
 *         description: { type: string, example: "Great condition film camera" }
 *         price: { type: number, minimum: 0, example: 150.00 }
 *         category: { type: string, example: "Electronics" }
 *         condition: { type: string, enum: [new, like-new, good, fair, poor] }
 *         tags: { type: array, items: { type: string }, example: ["vintage", "camera"] }
 *         location: { type: string, example: "New York, NY" }
 *
 *     ModerationAction:
 *       type: object
 *       required: [action]
 *       properties:
 *         action: { type: string, enum: [approve, reject] }
 *         notes: { type: string, example: "Quality photos needed" }
 *
 *     VibeResponse:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         itemName: { type: string }
 *         price: { type: number }
 *         status: { type: string, enum: [pending, approved, rejected, sold, archived] }
 *         likesCount: { type: number }
 *         views: { type: number }
 *         expiresAt: { type: string, format: date-time }
 *
 *   parameters:
 *     vibeId:
 *       in: path
 *       name: vibeId
 *       required: true
 *       schema: { type: string }
 *       description: Vibe ID
 */

/**
 * @swagger
 * /vibes:
 *   post:
 *     summary: Create new vibe (requires review)
 *     tags: [Vibes]
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateVibeInput' }
 *     responses:
 *       201: { description: Vibe created, pending review }
 *       400: { description: Invalid input }
 *   get:
 *     summary: Get approved vibes with filters
 *     tags: [Vibes]
 *     parameters:
 *       - { in: query, name: category, schema: { type: string } }
 *       - { in: query, name: condition, schema: { type: string } }
 *       - { in: query, name: minPrice, schema: { type: number } }
 *       - { in: query, name: maxPrice, schema: { type: number } }
 *       - { in: query, name: location, schema: { type: string } }
 *       - { in: query, name: tags, schema: { type: string }, description: Comma-separated tags }
 *     responses:
 *       200: { description: Vibes list retrieved }
 */
router.post(
  "/",
  authenticateToken,
  requireUser as RequestHandler,
  requireEmailVerification,
  validateVibeCreation as RequestHandler,
  createVibe as RequestHandler,
);
router.get("/", getVibes);

/**
 * @swagger
 * /vibes/search:
 *   get:
 *     summary: Search vibes by text
 *     tags: [Vibes]
 *     parameters:
 *       - { in: query, name: q, required: true, schema: { type: string }, description: Search query }
 *       - { in: query, name: category, schema: { type: string } }
 *       - { in: query, name: minPrice, schema: { type: number } }
 *       - { in: query, name: maxPrice, schema: { type: number } }
 *     responses:
 *       200: { description: Search results }
 *       400: { description: Missing search query }
 */
router.get("/search", searchVibes);

/**
 * @swagger
 * /vibes/trending:
 *   get:
 *     summary: Get trending vibes (24h)
 *     tags: [Vibes]
 *     responses:
 *       200: { description: Trending vibes by likes/views }
 */
router.get("/trending", getTrendingVibes);

/**
 * @swagger
 * /vibes/pending:
 *   get:
 *     summary: Get vibes pending moderation
 *     tags: [Moderation]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Pending vibes for review }
 *       403: { description: Staff/Admin access required }
 */
router.get(
  "/pending",
  authenticateToken,
  requireStaff as RequestHandler,
  getPendingVibes,
);

/**
 * @swagger
 * /vibes/user/{userId}:
 *   get:
 *     summary: Get user's vibes
 *     tags: [Vibes]
 *     parameters:
 *       - { in: path, name: userId, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: User vibes (approved only for others) }
 */
router.get("/user/:userId", getUserVibes);

/**
 * @swagger
 * /vibes/{vibeId}:
 *   get:
 *     summary: Get vibe details (increments views)
 *     tags: [Vibes]
 *     parameters: [{ $ref: '#/components/parameters/vibeId' }]
 *     responses:
 *       200: { description: Vibe details }
 *       404: { description: Vibe not found }
 *   put:
 *     summary: Update vibe (resets to pending)
 *     tags: [Vibes]
 *     security: [{ cookieAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/vibeId' }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateVibeInput' }
 *     responses:
 *       200: { description: Vibe updated, pending review }
 *       404: { description: Vibe not found or not editable }
 *   delete:
 *     summary: Delete vibe
 *     tags: [Vibes]
 *     security: [{ cookieAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/vibeId' }]
 *     responses:
 *       200: { description: Vibe deleted }
 *       404: { description: Vibe not found }
 */
router.get("/:vibeId", getVibe);
router.put(
  "/:vibeId",
  authenticateToken,
  requireUser as RequestHandler,
  updateVibe,
);
router.delete(
  "/:vibeId",
  authenticateToken,
  requireUser as RequestHandler,
  deleteVibe,
);

/**
 * @swagger
 * /vibes/{vibeId}/media:
 *   post:
 *     summary: Upload media files (max 5)
 *     tags: [Media]
 *     security: [{ cookieAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/vibeId' }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               media:
 *                 type: array
 *                 items: { type: string, format: binary }
 *                 maxItems: 5
 *                 description: Images/videos (10MB max each)
 *     responses:
 *       200: { description: Media uploaded successfully }
 *       400: { description: Invalid files or file limit exceeded }
 */
router.post(
  "/:vibeId/media",
  authenticateToken,
  requireUser as RequestHandler,
  uploadToS3.array("media", 5),
  uploadVibeMedia,
);

/**
 * @swagger
 * /vibes/{vibeId}/like:
 *   post:
 *     summary: Like vibe
 *     tags: [Interactions]
 *     security: [{ cookieAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/vibeId' }]
 *     responses:
 *       200: { description: Vibe liked }
 *   delete:
 *     summary: Unlike vibe
 *     tags: [Interactions]
 *     security: [{ cookieAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/vibeId' }]
 *     responses:
 *       200: { description: Vibe unliked }
 */
router.post(
  "/:vibeId/like",
  authenticateToken,
  requireUser as RequestHandler,
  requireEmailVerification,
  likeVibe,
);
router.delete(
  "/:vibeId/like",
  authenticateToken,
  requireUser as RequestHandler,
  unlikeVibe,
);

/**
 * @swagger
 * /vibes/{vibeId}/sold:
 *   patch:
 *     summary: Mark vibe as sold
 *     tags: [Interactions]
 *     security: [{ cookieAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/vibeId' }]
 *     responses:
 *       200: { description: Vibe marked as sold }
 *       404: { description: Vibe not found or already sold }
 */
router.patch(
  "/:vibeId/sold",
  authenticateToken,
  requireUser as RequestHandler,
  markAsSold,
);

/**
 * @swagger
 * /vibes/{vibeId}/moderate:
 *   patch:
 *     summary: Moderate vibe (approve/reject)
 *     tags: [Moderation]
 *     security: [{ cookieAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/vibeId' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ModerationAction' }
 *     responses:
 *       200: { description: Vibe moderated successfully }
 *       400: { description: Invalid action }
 *       403: { description: Staff/Admin access required }
 */
router.patch(
  "/:vibeId/moderate",
  authenticateToken,
  requireStaff as RequestHandler,
  moderateVibe,
);

export default router;
