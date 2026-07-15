import { io, type Socket } from 'socket.io-client';
import { BACKEND_URL } from './api';

let socket: Socket | null = null;

// One shared connection for the whole app — components subscribe/unsubscribe
// to events on it rather than each opening their own socket.
export function getSocket(): Socket {
  if (!socket) {
    socket = io(BACKEND_URL, { transports: ['websocket'] });
  }
  return socket;
}
