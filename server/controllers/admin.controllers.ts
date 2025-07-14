import type { Request, Response } from "express";
import { UserModel } from "../models/user.models";

const userModel = new UserModel();

export const addStaff = async (req: Request, res: Response) => {
  try {
    const { email, password, name, username } = req.body;

    if (!email || !password || !name || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email or username exists
    const existingEmail = await userModel.getByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }
    const existingUsername = await userModel.getByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const staff = await userModel.createStaff({
      email,
      password,
      name,
      username,
      role: "staff",
    });

    res.status(201).json({
      message: "Staff created successfully",
      staff: {
        id: staff._id,
        email: staff.email,
        name: staff.name,
        username: staff.username,
        role: staff.role,
      },
    });
  } catch (error) {
    console.error("Add staff error:", error);
    res.status(500).json({ message: "Error creating staff", error });
  }
};

export const editStaff = async (req: Request, res: Response) => {
  try {
    const { staffId } = req.params;
    if (!staffId) {
      return res.status(400).json({ message: "Staff ID is required" });
    }
    const updateData = req.body;

    const updated = await userModel.updateStaff(staffId, updateData);

    if (!updated) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.json({
      message: "Staff updated successfully",
      staff: {
        id: updated._id,
        email: updated.email,
        name: updated.name,
        username: updated.username,
        role: updated.role,
      },
    });
  } catch (error) {
    console.error("Edit staff error:", error);
    res.status(500).json({ message: "Error updating staff", error });
  }
};

export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { staffId } = req.params;

    if (!staffId) {
      return res.status(400).json({ message: "Staff ID is required" });
    }

    const deleted = await userModel.deleteStaff(staffId);

    if (!deleted) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.json({ message: "Staff deleted successfully" });
  } catch (error) {
    console.error("Delete staff error:", error);
    res.status(500).json({ message: "Error deleting staff", error });
  }
};

export const listStaff = async (req: Request, res: Response) => {
  try {
    const staffList = await userModel.listStaff();
    res.json({
      staff: staffList.map((u) => ({
        id: u._id,
        email: u.email,
        name: u.name,
        username: u.username,
        role: u.role,
      })),
    });
  } catch (error) {
    console.error("List staff error:", error);
    res.status(500).json({ message: "Error listing staff", error });
  }
};
