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

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateVibeInput:
 *       type: object
 *       required:
 *         - itemName
 *         - description
 *         - price
 *         - category
 *         - condition
 *       properties:
 *         itemName:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         category:
 *           type: string
 *         condition:
 *           type: string
 *           enum: [new, like-new, good, fair, poor]
 *         location:
 *           type: string
 */

/**
 * @swagger
 * /vibes:
 *   post:
 *     summary: Create a new vibe
 *     tags: [Vibes]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVibeInput'
 *     responses:
 *       201:
 *         description: Vibe created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authenticateToken,
  requireUser,
  validateVibeCreation,
  createVibe,
);

/**
 * @swagger
 * /vibes:
 *   get:
 *     summary: Get vibes with optional filters
 *     tags: [Vibes]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: condition
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Vibes retrieved successfully
 */
router.get("/", getVibes);

/**
 * @swagger
 * /vibes/search:
 *   get:
 *     summary: Search vibes
 *     tags: [Vibes]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
router.get("/search", searchVibes);

/**
 * @swagger
 * /vibes/trending:
 *   get:
 *     summary: Get trending vibes
 *     tags: [Vibes]
 *     responses:
 *       200:
 *         description: Trending vibes
 */
router.get("/trending", getTrendingVibes);

/**
 * @swagger
 * /vibes/pending:
 *   get:
 *     summary: Get pending vibes for moderation
 *     tags: [Vibes]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Pending vibes
 *       403:
 *         description: Insufficient permissions
 */
router.get("/pending", authenticateToken, requireStaff, getPendingVibes);

/**
 * @swagger
 * /vibes/user/{userId}:
 *   get:
 *     summary: Get vibes by user
 *     tags: [Vibes]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User vibes
 */
router.get("/user/:userId", getUserVibes);

/**
 * @swagger
 * /vibes/{vibeId}:
 *   get:
 *     summary: Get a specific vibe
 *     tags: [Vibes]
 *     parameters:
 *       - in: path
 *         name: vibeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vibe details
 *       404:
 *         description: Vibe not found
 */
router.get("/:vibeId", getVibe);

/**
 * @swagger
 * /vibes/{vibeId}:
 *   put:
 *     summary: Update a vibe
 *     tags: [Vibes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: vibeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vibe updated
 *       404:
 *         description: Vibe not found
 */
router.put("/:vibeId", authenticateToken, requireUser, updateVibe);

/**
 * @swagger
 * /vibes/{vibeId}:
 *   delete:
 *     summary: Delete a vibe
 *     tags: [Vibes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: vibeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vibe deleted
 *       404:
 *         description: Vibe not found
 */
router.delete("/:vibeId", authenticateToken, requireUser, deleteVibe);

// Media upload
router.post(
  "/:vibeId/media",
  authenticateToken,
  requireUser,
  uploadToS3.array("media", 5), // Max 5 files
  uploadVibeMedia,
);

// Interactions
router.post("/:vibeId/like", authenticateToken, requireUser, likeVibe);
router.delete("/:vibeId/like", authenticateToken, requireUser, unlikeVibe);
router.patch("/:vibeId/sold", authenticateToken, requireUser, markAsSold);

// Moderation
router.patch(
  "/:vibeId/moderate",
  authenticateToken,
  requireStaff,
  moderateVibe,
);

export default router;
