import { apiUrl } from '~/utils/common';
import { Vibes, VibesResponse } from '~/utils/type';
import { withAuthHeaders } from './api';

export async function getVibes(): Promise<VibesResponse> {
  try {
    const response = await fetch(`${apiUrl}/vibes`, await withAuthHeaders({ method: 'GET' }));
    const data: VibesResponse = await response.json();
    if (!response.ok) throw new Error('Get vibes failed');
    return data;
  } catch (error) {
    console.error('Vibes API error:', error);
    throw error;
  }
}

export async function getVibeDetailAndIncreaseView(id: string): Promise<Vibes> {
  const response = await fetch(`${apiUrl}/vibes/${id}`, await withAuthHeaders({ method: 'GET' }));
  const data = await response.json();
  if (!response.ok) throw new Error('Get vibe detail failed');
  return data.vibe;
}

export async function likeVibe(id: string) {
  const response = await fetch(
    `${apiUrl}/vibes/${id}/like`,
    await withAuthHeaders({ method: 'POST' })
  );
  if (!response.ok) throw new Error('Like failed');
  return await response.json();
}

export async function unlikeVibe(id: string) {
  const response = await fetch(
    `${apiUrl}/vibes/${id}/like`,
    await withAuthHeaders({ method: 'DELETE' })
  );
  if (!response.ok) throw new Error('Unlike failed');
  return await response.json();
}

export async function searchVibes({
  q = '',
  category,
  minPrice,
  maxPrice,
}: {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const params = new URLSearchParams();
  if (q) params.append('q', q);
  if (category) params.append('category', category);
  if (minPrice !== undefined) params.append('minPrice', String(minPrice));
  if (maxPrice !== undefined) params.append('maxPrice', String(maxPrice));
  const url = `${apiUrl}/vibes/search?${params.toString()}`;
  const res = await fetch(url, await withAuthHeaders({ method: 'GET' }));
  if (!res.ok) throw new Error('Failed to search vibes');
  return await res.json();
}
