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
