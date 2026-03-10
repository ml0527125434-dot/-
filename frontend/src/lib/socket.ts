import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io('/ws', {
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function joinLocation(locationId: string, role: string) {
  const s = getSocket();
  s.emit('join:location', { locationId, role });
}

export function joinRoom(roomId: string) {
  const s = getSocket();
  s.emit('join:room', { roomId });
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
