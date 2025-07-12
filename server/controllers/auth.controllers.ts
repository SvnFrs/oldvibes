import type { Request, Response } from "express";
import { UserModel } from "../models/user.models";
import { generateToken } from "../utils/jwt.utils";
import { verificationService } from "../services/verification.services";
import { emailService } from "../services/email.services";
import type { LoginCredentials, RegisterInput } from "../types/user.types";

const userModel = new UserModel();

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production"
      ? ("none" as const)
      : ("lax" as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  domain: process.env.NODE_ENV === "production" ? undefined : undefined,
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, username }: RegisterInput = req.body;

    // validate input
    if (!email || !password || !name || !username) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // check if user already exists
    const existingUser = await userModel.getByEmail(email);
    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    // check if username is taken
    const existingUsername = await userModel.getByUsername(username);
    if (existingUsername) {
      res.status(409).json({ message: "Username already taken" });
      return;
    }

    // create user (not email verified yet)
    const newUser = await userModel.create({ email, password, name, username });

    // Send verification email
    await verificationService.sendVerificationEmail(
      email,
      name,
      newUser._id!.toString(),
    );

    // generate jwt token
    const token = generateToken({
      userId: newUser._id!.toString(),
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
    });

    // set http-only cookie
    res.cookie("token", token, getCookieOptions());

    res.status(201).json({
      message:
        "User registered successfully. Please check your email for verification.",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
        isEmailVerified: false,
      },
      emailSent: true,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user", error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginCredentials = req.body;

    // validate input
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    // validate user credentials
    const user = await userModel.validatePassword(email, password);
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // generate jwt token
    const token = generateToken({
      userId: user._id!.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // set http-only cookie
    res.cookie("token", token, getCookieOptions());

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ message: "Verification token is required" });
      return;
    }

    const result = await verificationService.verifyEmail(token);

    if (!result.success) {
      res.status(400).json({ message: result.message });
      return;
    }

    // Update user's email verification status
    await userModel.updateUser(result.userId!, { isEmailVerified: true });

    // Send welcome email
    const user = await userModel.getById(result.userId!);
    if (user) {
      await emailService.sendWelcomeEmail(user.email, user.name);
    }

    res.json({
      message: result.message,
      verified: true,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Error verifying email", error });
  }
};

export const resendVerification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const user = await userModel.getByEmail(email);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ message: "Email is already verified" });
      return;
    }

    await verificationService.sendVerificationEmail(
      user.email,
      user.name,
      user._id!.toString(),
    );

    res.json({
      message: "Verification email sent successfully",
      emailSent: true,
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res
      .status(500)
      .json({ message: "Error sending verification email", error });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Error logging out", error });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.json({ user: (req as any).user });
  } catch (error) {
    console.error("Me endpoint error:", error);
    res.status(500).json({ message: "Error getting user info", error });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (req as any).user;

    // Generate new token
    const token = generateToken({
      userId: user.userId,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // Update cookie
    res.cookie("token", token, getCookieOptions());

    res.json({
      message: "Token refreshed successfully",
      token,
      user: {
        id: user.userId,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Error refreshing token", error });
  }
};
