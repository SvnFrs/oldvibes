import { apiUrl } from '~/utils/common';
import { withAuthHeaders } from './api';
import { StorageService } from '~/utils/storage';

// Get current user's profile
export async function getMyProfile() {
  const res = await fetch(`${apiUrl}/users/me`, await withAuthHeaders({ method: 'GET' }));
  if (!res.ok) throw new Error('Failed to fetch profile');
  return (await res.json()).profile;
}

// Update profile (name, bio)
export async function updateMyProfile(data: { name?: string; bio?: string }) {
  const res = await fetch(
    `${apiUrl}/users/me`,
    await withAuthHeaders({
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  );
  if (!res.ok) throw new Error('Failed to update profile');
  return await res.json();
}

// Update avatar
export async function updateMyAvatar(formData: FormData) {
  const res = await fetch(`${apiUrl}/users/me/avatar`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers: {
      // Don't set Content-Type for FormData!
      Accept: '*/*',
    },
  });
  if (!res.ok) throw new Error('Failed to update avatar');
  return await res.json();
}

// Get another user's profile
export async function getUserProfile(userId: string) {
  const res = await fetch(`${apiUrl}/users/${userId}`, await withAuthHeaders({ method: 'GET' }));
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return (await res.json()).profile;
}

// Get user's vibes
export async function getUserVibes(userId: string) {
  const res = await fetch(
    `${apiUrl}/vibes/user/${userId}`,
    await withAuthHeaders({ method: 'GET' })
  );
  if (!res.ok) throw new Error('Failed to fetch user vibes');
  return await res.json();
}

// Get user's comments
export async function getUserComments(userId: string, limit = 20, offset = 0) {
  const res = await fetch(
    `${apiUrl}/users/${userId}/comments?limit=${limit}&offset=${offset}`,
    await withAuthHeaders({ method: 'GET' })
  );
  if (!res.ok) throw new Error('Failed to fetch user comments');
  return await res.json();
}

// Get followers/following
export async function getFollowers(userId: string) {
  const res = await fetch(
    `${apiUrl}/users/${userId}/followers`,
    await withAuthHeaders({ method: 'GET' })
  );
  if (!res.ok) throw new Error('Failed to fetch followers');
  return await res.json();
}
export async function getFollowing(userId: string) {
  const res = await fetch(
    `${apiUrl}/users/${userId}/following`,
    await withAuthHeaders({ method: 'GET' })
  );
  if (!res.ok) throw new Error('Failed to fetch following');
  return await res.json();
}
export async function followUser(userId: string) {
  const res = await fetch(
    `${apiUrl}/users/${userId}/follow`,
    await withAuthHeaders({ method: 'POST' })
  );
  if (!res.ok) throw new Error('Failed to follow user');
  return await res.json();
}
export async function unfollowUser(userId: string) {
  const res = await fetch(
    `${apiUrl}/users/${userId}/follow`,
    await withAuthHeaders({ method: 'DELETE' })
  );
  if (!res.ok) throw new Error('Failed to unfollow user');
  return await res.json();
}

export async function uploadAvatar(imageUri: string) {
  const formData = new FormData();
  formData.append('avatar', {
    uri: imageUri,
    name: 'avatar.jpg',
    type: 'image/jpeg',
  } as any);

  // Get token
  const token = await StorageService.getAccessToken();

  const res = await fetch(`${apiUrl}/users/me/avatar`, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`, // <-- Add this line!
      // Do NOT set Content-Type for FormData!
    },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to upload avatar');
  return await res.json();
}
