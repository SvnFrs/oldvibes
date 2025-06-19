import type { IUser } from "../schema/user.schema";

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  username: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  username: string;
  role: string;
  profilePicture?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  isVerified: boolean;
}

export interface UpdateUserInput {
  name?: string;
  bio?: string;
  profilePicture?: string;
}

export type UserRole = "admin" | "staff" | "user" | "guest";

export interface UserModel extends IUser {}
