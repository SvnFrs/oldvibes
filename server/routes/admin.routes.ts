import { Router } from "express";
import {
  addStaff,
  editStaff,
  deleteStaff,
  listStaff,
} from "../controllers/admin.controllers";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/role.middleware";

const router = Router();

/**
 * @swagger
 * /admin/staff:
 *   post:
 *     summary: Add new staff
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name, username]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               name: { type: string }
 *               username: { type: string }
 *     responses:
 *       201: { description: Staff created }
 *       409: { description: Email or username exists }
 */
router.post("/staff", authenticateToken, requireAdmin, addStaff);

/**
 * @swagger
 * /admin/staff/{staffId}:
 *   put:
 *     summary: Edit staff
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               name: { type: string }
 *               username: { type: string }
 *               bio: { type: string }
 *               profilePicture: { type: string }
 *     responses:
 *       200: { description: Staff updated }
 *       404: { description: Staff not found }
 */
router.put("/staff/:staffId", authenticateToken, requireAdmin, editStaff);

/**
 * @swagger
 * /admin/staff/{staffId}:
 *   delete:
 *     summary: Delete staff
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Staff deleted }
 *       404: { description: Staff not found }
 */
router.delete("/staff/:staffId", authenticateToken, requireAdmin, deleteStaff);

/**
 * @swagger
 * /admin/staff:
 *   get:
 *     summary: List all staff
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: List of staff }
 */
router.get("/staff", authenticateToken, requireAdmin, listStaff);

export default router;
