import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth.middleware";
import type { UserRole } from "../types/user.types";

export const requireRole = (allowedRoles: UserRole[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // You might want to fetch the user's role from the database
      // since JWT payload might not always have the latest role
      const userRole = req.user.role || "user"; // You'll need to add role to JWT payload

      if (!allowedRoles.includes(userRole as UserRole)) {
        return res.status(403).json({
          message: "Insufficient permissions",
          required: allowedRoles,
          current: userRole,
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "Error checking permissions", error });
    }
  };
};

// Specific role middlewares
export const requireAdmin = requireRole(["admin"]);
export const requireStaff = requireRole(["admin", "staff"]);
export const requireUser = requireRole(["admin", "staff", "user"]);
