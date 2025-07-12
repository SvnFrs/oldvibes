import type { Request, Response, NextFunction } from "express";
import { verifyToken, type JWTPayload } from "../utils/jwt.utils";

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  // Try to get token from Authorization header first, then from cookies
  const authHeader = req.headers.authorization;
  const bearerToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

  const cookieToken = req.cookies.token;
  const token = bearerToken || cookieToken;

  if (!token) {
    res.status(401).json({
      message: "Access token required",
      hint: "Include token in Authorization header as 'Bearer <token>' or ensure cookies are enabled",
    });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({
      message: "Invalid or expired token",
      error: error instanceof Error ? error.message : error,
    });
  }
};

// Optional middleware that doesn't require authentication but adds user if present
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  const bearerToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

  const cookieToken = req.cookies.token;
  const token = bearerToken || cookieToken;

  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (error) {
      // Ignore invalid tokens for optional auth
      console.log("Optional auth: Invalid token ignored");
    }
  }

  next();
};
