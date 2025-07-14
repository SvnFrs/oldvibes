import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper for base64 decoding in React Native
function base64Decode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'base64').toString('utf8');
  }
  // Fallback for Expo/React Native
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(str), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_DATA: 'user_data',
  TOKEN_EXPIRY: 'token_expiry',
} as const;

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

interface DecodedJWT {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Helper function to decode JWT token
function decodeJWT(token: string): DecodedJWT | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = base64Decode(base64);
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export const StorageService = {
  // Store login data
  async storeLoginData(loginResponse: LoginResponse): Promise<void> {
    try {
      const { token, user } = loginResponse;
      const decodedToken = decodeJWT(token);

      if (!decodedToken) throw new Error('Invalid JWT token');

      // Use JWT exp for expiry
      const expiryTime = decodedToken.exp * 1000;

      // Store token and expiry
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());

      // Store user data
      const userData: UserData = {
        user_id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing login data:', error);
    }
  },

  // Get access token
  async getAccessToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token && (await this.isTokenExpired())) {
        await this.clearLoginData();
        return null;
      }
      return token;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  // Get user data
  async getUserData(): Promise<UserData | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  // Get user role
  async getUserRole(): Promise<UserRole | null> {
    try {
      const userData = await this.getUserData();
      return userData?.role || null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  },

  // Check if user has specific role
  async hasRole(role: UserRole): Promise<boolean> {
    try {
      const userRole = await this.getUserRole();
      return userRole === role;
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  },

  // Check if token is expired
  async isTokenExpired(): Promise<boolean> {
    try {
      const expiryTime = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
      if (!expiryTime) return true;
      return Date.now() > parseInt(expiryTime, 10);
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  },

  // Check if user is logged in
  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      return !!token;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  },

  // Clear all login data
  async clearLoginData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.TOKEN_EXPIRY,
      ]);
    } catch (error) {
      console.error('Error clearing login data:', error);
    }
  },
};
