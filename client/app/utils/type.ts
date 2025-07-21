export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  username: string;
}

export interface SignupResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    username: string;
    role: string;
    isEmailVerified: boolean;
  };
  emailSent: boolean;
}

export type UserRole = 'admin' | 'staff' | 'user' | 'guest';

export interface UserData {
  user_id: string;
  username: string;
  role: UserRole;
  email: string;
  name: string;
  isEmailVerified: boolean;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    username: string;
    role: UserRole;
    isEmailVerified: boolean;
  };
}

export interface Vibes {
  id: string;
  userId: string;
  user: {
    username: string;
    name: string;
    profilePicture: string | null;
    isEmailVerified: boolean;
  };
  itemName: string;
  description: string;
  price: number;
  tags: string[];
  mediaFiles: MediaFile[];
  status: 'approved' | 'rejected';
  category: string;
  condition: string;
  location: string;
  likesCount: number;
  commentsCount: number;
  views: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaFile {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  _id?: string;
}

export interface VibesResponse {
  vibes: Vibes[];
  count: number;
}
