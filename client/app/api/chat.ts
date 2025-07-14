import { apiUrl } from '~/utils/common';
import { withAuthHeaders } from './api';

export async function startChatAboutVibe(vibeId: string) {
  const res = await fetch(
    `${apiUrl}/chat/vibes/${vibeId}/start`,
    await withAuthHeaders({ method: 'POST' })
  );
  if (!res.ok) throw new Error('Failed to start chat');
  return await res.json();
}

export async function getConversations() {
  const res = await fetch(
    `${apiUrl}/chat/conversations?limit=20&offset=0`,
    await withAuthHeaders({ method: 'GET' })
  );
  if (!res.ok) throw new Error('Failed to fetch conversations');
  return await res.json();
}

export async function getMessages(conversationId: string) {
  const res = await fetch(
    `${apiUrl}/chat/conversations/${conversationId}/messages?limit=50&offset=0`,
    await withAuthHeaders({ method: 'GET' })
  );
  if (!res.ok) throw new Error('Failed to fetch messages');
  return await res.json();
}

export async function sendMessage(conversationId: string, content: string, offerData?: any) {
  const body = { content, messageType: 'text', ...(offerData ? { offerData } : {}) };
  const res = await fetch(
    `${apiUrl}/chat/conversations/${conversationId}/messages`,
    await withAuthHeaders({
      method: 'POST',
      body: JSON.stringify(body),
    })
  );
  if (!res.ok) throw new Error('Failed to send message');
  return await res.json();
}

export async function markMessageAsRead(messageId: string) {
  const res = await fetch(
    `${apiUrl}/chat/messages/${messageId}/read`,
    await withAuthHeaders({ method: 'PATCH' })
  );
  if (!res.ok) throw new Error('Failed to mark message as read');
  return await res.json();
}
