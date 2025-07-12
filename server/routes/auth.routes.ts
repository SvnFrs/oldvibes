import { Router } from "express";
import {
  register,
  login,
  logout,
  me,
  refreshToken,
} from "../controllers/auth.controllers";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterInput:
 *       type: object
 *       required: [email, password, name, username]
 *       properties:
 *         email: { type: string, format: email, example: "user@example.com" }
 *         password: { type: string, minLength: 6, example: "password123" }
 *         name: { type: string, example: "John Doe" }
 *         username: { type: string, example: "johndoe" }
 *
 *     LoginInput:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email: { type: string, format: email }
 *         password: { type: string }
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message: { type: string }
 *         token: { type: string, description: "JWT access token" }
 *         user:
 *           type: object
 *           properties:
 *             id: { type: string }
 *             email: { type: string }
 *             name: { type: string }
 *             username: { type: string }
 *             role: { type: string }
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RegisterInput' }
 *     responses:
 *       201:
 *         description: User registered successfully
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only authentication cookie
 *             schema: { type: string }
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponse' }
 *       400: { description: Missing required fields }
 *       409: { description: User already exists or username taken }
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginInput' }
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only authentication cookie
 *             schema: { type: string }
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponse' }
 *       400: { description: Missing email or password }
 *       401: { description: Invalid credentials }
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user (clears cookie)
 *     tags: [Authentication]
 *     responses:
 *       200: { description: Logged out successfully }
 */
router.post("/logout", logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user info
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user: { $ref: '#/components/schemas/AuthResponse/properties/user' }
 *       401: { description: Authentication required }
 *       403: { description: Invalid or expired token }
 */
router.get("/me", authenticateToken, me);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponse' }
 *       401: { description: Authentication required }
 *       403: { description: Invalid or expired token }
 */
router.post("/refresh", authenticateToken, refreshToken);

export default router;
