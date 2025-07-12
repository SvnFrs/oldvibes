import type { Request, Response, NextFunction } from "express";

export const validateVibeCreation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { itemName, description, price, category, condition } = req.body;

  if (!itemName || !description || !price || !category || !condition) {
    return res.status(400).json({
      message: "Missing required fields",
      required: ["itemName", "description", "price", "category", "condition"],
    });
  }

  if (price < 0) {
    return res.status(400).json({ message: "Price must be positive" });
  }

  next();
};

export const validateProfileUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, bio } = req.body;

  if (name && (typeof name !== "string" || name.trim().length === 0)) {
    return res.status(400).json({ message: "Name must be a non-empty string" });
  }

  if (bio && (typeof bio !== "string" || bio.length > 150)) {
    return res
      .status(400)
      .json({ message: "Bio must be 150 characters or less" });
  }

  next();
};
