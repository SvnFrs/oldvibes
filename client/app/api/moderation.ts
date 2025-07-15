import { apiUrl } from '~/utils/common';
import { withAuthHeaders } from './api';

export async function getPendingVibes() {
  const res = await fetch(`${apiUrl}/vibes/pending`, await withAuthHeaders({ method: 'GET' }));
  if (!res.ok) throw new Error('Failed to fetch pending vibes');
  return await res.json();
}

export async function moderateVibe(vibeId: string, action: 'approve' | 'reject', notes: string) {
  const res = await fetch(
    `${apiUrl}/vibes/${vibeId}/moderate`,
    await withAuthHeaders({
      method: 'PATCH',
      body: JSON.stringify({ action, notes }),
    })
  );
  if (!res.ok) throw new Error('Failed to moderate vibe');
  return await res.json();
}

export async function deleteVibe(vibeId: string) {
  const res = await fetch(`${apiUrl}/vibes/${vibeId}`, await withAuthHeaders({ method: 'DELETE' }));
  if (!res.ok) throw new Error('Failed to delete vibe');
  return await res.json();
}
