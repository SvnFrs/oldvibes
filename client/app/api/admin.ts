import { apiUrl } from '~/utils/common';
import { withAuthHeaders } from './api';

export async function getAllUsers({ limit = 50, offset = 0 } = {}) {
  const res = await fetch(
    `${apiUrl}/admin/users?limit=${limit}&offset=${offset}`,
    await withAuthHeaders({ method: 'GET' })
  );
  if (!res.ok) throw new Error('Failed to fetch users');
  return await res.json();
}

export async function banUser(userId: string) {
  const res = await fetch(
    `${apiUrl}/admin/users/${userId}/ban`,
    await withAuthHeaders({ method: 'PATCH' })
  );
  if (!res.ok) throw new Error('Failed to ban user');
  return await res.json();
}

export async function unbanUser(userId: string) {
  const res = await fetch(
    `${apiUrl}/admin/users/${userId}/unban`,
    await withAuthHeaders({ method: 'PATCH' })
  );
  if (!res.ok) throw new Error('Failed to unban user');
  return await res.json();
}
