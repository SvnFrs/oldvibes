import { apiUrl } from '~/utils/common';
import { withAuthHeaders } from './api';

export async function getComments(
  vibeId: string,
  { limit = 20, offset = 0, sortBy = 'newest' } = {}
) {
  const res = await fetch(
    `${apiUrl}/vibes/${vibeId}/comments?limit=${limit}&offset=${offset}&sortBy=${sortBy}`,
    await withAuthHeaders({ method: 'GET' })
  );
  if (!res.ok) throw new Error('Failed to fetch comments');
  return await res.json();
}

export async function getReplies(commentId: string, { limit = 10, offset = 0 } = {}) {
  const res = await fetch(
    `${apiUrl}/comments/${commentId}/replies?limit=${limit}&offset=${offset}`,
    await withAuthHeaders({ method: 'GET' })
  );
  if (!res.ok) throw new Error('Failed to fetch replies');
  return await res.json();
}

export async function createComment(vibeId: string, content: string, parentCommentId?: string) {
  const body = parentCommentId ? { content, parentCommentId } : { content };
  const res = await fetch(
    `${apiUrl}/vibes/${vibeId}/comments`,
    await withAuthHeaders({
      method: 'POST',
      body: JSON.stringify(body),
    })
  );
  if (!res.ok) throw new Error('Failed to create comment');
  return await res.json();
}

export async function likeComment(commentId: string) {
  const res = await fetch(
    `${apiUrl}/comments/${commentId}/like`,
    await withAuthHeaders({ method: 'POST' })
  );
  if (!res.ok) throw new Error('Failed to like comment');
  return await res.json();
}

export async function unlikeComment(commentId: string) {
  const res = await fetch(
    `${apiUrl}/comments/${commentId}/like`,
    await withAuthHeaders({ method: 'DELETE' })
  );
  if (!res.ok) throw new Error('Failed to unlike comment');
  return await res.json();
}

export async function deleteComment(commentId: string) {
  const res = await fetch(
    `${apiUrl}/comments/${commentId}`,
    await withAuthHeaders({ method: 'DELETE' })
  );
  if (!res.ok) throw new Error('Failed to delete comment');
  return await res.json();
}
