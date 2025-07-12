import bcrypt from "bcrypt";
import { User, type IUser } from "../schema/user.schema";
import type {
  RegisterInput,
  UpdateUserInput,
  UserResponse,
} from "../types/user.types";
import mongoose from "mongoose";

export class UserModel {
  async create(userData: RegisterInput): Promise<IUser> {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    const user = new User({
      ...userData,
      password: hashedPassword,
    });

    return await user.save();
  }

  async getByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email, isActive: true });
  }

  async getByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username, isActive: true });
  }

  async getById(id: string): Promise<IUser | null> {
    return await User.findById(id).select("-password");
  }

  async validatePassword(
    email: string,
    password: string,
  ): Promise<IUser | null> {
    const user = await User.findOne({ email, isActive: true });
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async updateUser(
    id: string,
    updateData: UpdateUserInput & { isEmailVerified?: boolean },
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).select("-password");
  }

  async followUser(userId: string, targetUserId: string): Promise<boolean> {
    const session = await User.startSession();
    session.startTransaction();

    try {
      // Add to following list
      await User.findByIdAndUpdate(userId, {
        $addToSet: { following: targetUserId },
      }).session(session);

      // Add to followers list
      await User.findByIdAndUpdate(targetUserId, {
        $addToSet: { followers: userId },
      }).session(session);

      await session.commitTransaction();
      return true;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async unfollowUser(userId: string, targetUserId: string): Promise<boolean> {
    const session = await User.startSession();
    session.startTransaction();

    try {
      // Remove from following list
      await User.findByIdAndUpdate(userId, {
        $pull: { following: targetUserId },
      }).session(session);

      // Remove from followers list
      await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: userId },
      }).session(session);

      await session.commitTransaction();
      return true;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getUserProfile(username: string): Promise<UserResponse | null> {
    const user = await User.findOne({ username, isActive: true })
      .select("-password")
      .populate("followers", "username")
      .populate("following", "username");

    if (!user) return null;

    return {
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      isVerified: user.isVerified,
    };
  }

  async searchUsers(
    query: string,
    limit: number = 10,
  ): Promise<UserResponse[]> {
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
      isActive: true,
    })
      .select("-password")
      .limit(limit);

    return users.map((user) => ({
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      isVerified: user.isVerified,
    }));
  }

  async isFollowing(userId: string, targetUserId: string): Promise<boolean> {
    const user = await User.findById(userId).select("following");
    return user
      ? user.following.includes(new mongoose.Types.ObjectId(targetUserId))
      : false;
  }

  async getFollowers(userId: string): Promise<UserResponse[]> {
    const user = await User.findById(userId)
      .populate("followers", "username name profilePicture isVerified bio")
      .select("followers");

    if (!user) return [];

    return user.followers.map((follower: any) => ({
      id: follower._id.toString(),
      email: "", // Don't expose email in follower lists
      name: follower.name,
      username: follower.username,
      role: "",
      profilePicture: follower.profilePicture,
      bio: follower.bio,
      followersCount: 0, // Not needed in lists
      followingCount: 0,
      isVerified: follower.isVerified,
    }));
  }

  async getFollowing(userId: string): Promise<UserResponse[]> {
    const user = await User.findById(userId)
      .populate("following", "username name profilePicture isVerified bio")
      .select("following");

    if (!user) return [];

    return user.following.map((following: any) => ({
      id: following._id.toString(),
      email: "",
      name: following.name,
      username: following.username,
      role: "",
      profilePicture: following.profilePicture,
      bio: following.bio,
      followersCount: 0,
      followingCount: 0,
      isVerified: following.isVerified,
    }));
  }
}
