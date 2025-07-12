import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth.middleware";
import { UserModel } from "../models/user.models";

const userModel = new UserModel();

export const requireEmailVerification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const user = await userModel.getById(req.user.userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.isEmailVerified) {
      res.status(403).json({
        message: "Email verification required",
        code: "EMAIL_NOT_VERIFIED",
        hint: "Please verify your email address to perform this action",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Email verification check error:", error);
    res
      .status(500)
      .json({ message: "Error checking email verification", error });
  }
};
