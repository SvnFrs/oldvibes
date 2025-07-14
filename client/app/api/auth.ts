import { SignupRequest, SignupResponse } from '~/utils/type';
import { StorageService, LoginResponse } from '~/utils/storage';
import { apiUrl } from '~/utils/common';

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data: LoginResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    console.error('Login API error:', error);
    throw error;
  }
}

export async function signup(signupData: SignupRequest): Promise<SignupResponse> {
  try {
    const response = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData),
      // Note: credentials: "include" might not be needed for mobile apps
    });

    const data: SignupResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  } catch (error) {
    console.error('Signup API error:', error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    const token = await StorageService.getAccessToken();

    if (token) {
      // Optional: Call logout endpoint if your API has one
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    // Always clear local storage
    await StorageService.clearLoginData();
  }
}

// Helper function to make authenticated API calls
export async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await StorageService.getAccessToken();

  if (!token) {
    throw new Error('No access token available');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}
