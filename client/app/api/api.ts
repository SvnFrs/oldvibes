import { StorageService } from '~/utils/storage';

export async function withAuthHeaders(init: RequestInit = {}): Promise<RequestInit> {
  const token = await StorageService.getAccessToken();
  return {
    ...init,
    headers: {
      ...(init.headers || {}),
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  };
}
