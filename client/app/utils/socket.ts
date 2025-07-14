import { io, Socket } from 'socket.io-client';
import { StorageService } from '~/utils/storage';
import { apiUrl } from '~/utils/common';

let socket: Socket | null = null;

export async function getSocket() {
  if (socket) return socket;
  const token = await StorageService.getAccessToken();
  socket = io(apiUrl?.replace('/api', ''), {
    auth: { token },
    transports: ['websocket'],
  });
  return socket;
}
