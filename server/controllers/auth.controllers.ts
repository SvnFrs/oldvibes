import type { Request, Response } from "express";
import { UserModel } from "../models/user.models";
import { generateToken } from "../utils/jwt.utils";
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
  domain: process.env.NODE_ENV === "production" ? undefined : undefined, // Set your domain in production
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

    // create user
    const newUser = await userModel.create({ email, password, name, username });

    // generate jwt token
    const token = generateToken({
      userId: newUser._id!.toString(),
      email: newUser.email,
      username: newUser.username,
    });

    // set http-only cookie
    res.cookie("token", token, getCookieOptions());

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        username: newUser.username,
      },
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
    });

    // set http-only cookie
    res.cookie("token", token, getCookieOptions());

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error });
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
