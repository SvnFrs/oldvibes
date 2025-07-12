import { Router } from "express";
import {
  getProfile,
  getMyProfile,
  updateProfile,
  uploadProfilePicture,
  followUser,
  unfollowUser,
  searchUsers,
  getFollowers,
  getFollowing,
} from "../controllers/user.controllers";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireUser } from "../middleware/role.middleware";
import { uploadProfilePicture as uploadMiddleware } from "../middleware/upload.middleware";
import type { RequestHandler } from "../types/handler.types";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateProfileInput:
 *       type: object
 *       properties:
 *         name: { type: string, example: "John Doe" }
 *         bio: { type: string, maxLength: 150, example: "Vintage enthusiast" }
 *
 *     ProfileResponse:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         username: { type: string }
 *         name: { type: string }
 *         bio: { type: string }
 *         profilePicture: { type: string }
 *         followersCount: { type: number }
 *         followingCount: { type: number }
 *         isVerified: { type: boolean }
 *         isFollowing: { type: boolean }
 *
 *   parameters:
 *     username:
 *       in: path
 *       name: username
 *       required: true
 *       schema: { type: string }
 *       description: Username
 *     userId:
 *       in: path
 *       name: userId
 *       required: true
 *       schema: { type: string }
 *       description: User ID
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get own profile (detailed)
 *     tags: [Users]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Own profile with private data }
 *       401: { description: Unauthorized }
 *   patch:
 *     summary: Update profile information
 *     tags: [Users]
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateProfileInput' }
 *     responses:
 *       200: { description: Profile updated }
 *       400: { description: Invalid input }
 */
router.get("/me", authenticateToken, getMyProfile);
router.patch(
  "/me",
  authenticateToken,
  requireUser as RequestHandler,
  updateProfile,
);

/**
 * @swagger
 * /users/me/avatar:
 *   post:
 *     summary: Upload profile picture
 *     tags: [Users]
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar: { type: string, format: binary, description: Image file (5MB max) }
 *     responses:
 *       200: { description: Profile picture uploaded }
 *       400: { description: Invalid file }
 */
router.post(
  "/me/avatar",
  authenticateToken,
  requireUser as RequestHandler,
  uploadMiddleware.single("avatar"),
  uploadProfilePicture,
);

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search users by name/username
 *     tags: [Users]
 *     parameters:
 *       - { in: query, name: q, required: true, schema: { type: string }, description: Search query }
 *     responses:
 *       200: { description: User search results }
 *       400: { description: Missing search query }
 */
router.get("/search", searchUsers);

/**
 * @swagger
 * /users/{username}:
 *   get:
 *     summary: Get user profile by username
 *     tags: [Users]
 *     parameters: [{ $ref: '#/components/parameters/username' }]
 *     responses:
 *       200: { description: User profile }
 *       404: { description: User not found }
 */
router.get("/:username", getProfile);

/**
 * @swagger
 * /users/{userId}/followers:
 *   get:
 *     summary: Get user followers
 *     tags: [Social]
 *     parameters: [{ $ref: '#/components/parameters/userId' }]
 *     responses:
 *       200: { description: Followers list }
 */
router.get("/:userId/followers", getFollowers);

/**
 * @swagger
 * /users/{userId}/following:
 *   get:
 *     summary: Get users being followed
 *     tags: [Social]
 *     parameters: [{ $ref: '#/components/parameters/userId' }]
 *     responses:
 *       200: { description: Following list }
 */
router.get("/:userId/following", getFollowing);

/**
 * @swagger
 * /users/{targetUserId}/follow:
 *   post:
 *     summary: Follow user
 *     tags: [Social]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: targetUserId, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: User followed }
 *       400: { description: Cannot follow yourself }
 *   delete:
 *     summary: Unfollow user
 *     tags: [Social]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: targetUserId, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: User unfollowed }
 */
router.post(
  "/:targetUserId/follow",
  authenticateToken,
  requireUser as RequestHandler,
  followUser,
);
router.delete(
  "/:targetUserId/follow",
  authenticateToken,
  requireUser as RequestHandler,
  unfollowUser,
);

export default router;
