import { useEffect, useRef } from 'react';
import { connectSocket, joinLocation, joinRoom } from '../lib/socket';
import type { Socket } from 'socket.io-client';

export function useLocationSocket(
  locationId: string | undefined,
  role: string,
  handlers: Record<string, (data: any) => void>,
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!locationId) return;

    const socket = connectSocket();
    socketRef.current = socket;

    joinLocation(locationId, role);

    for (const [event, handler] of Object.entries(handlers)) {
      socket.on(event, handler);
    }

    return () => {
      for (const [event, handler] of Object.entries(handlers)) {
        socket.off(event, handler);
      }
    };
  }, [locationId, role]);

  return socketRef;
}

export function useRoomSocket(
  roomId: string | undefined,
  handlers: Record<string, (data: any) => void>,
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const socket = connectSocket();
    socketRef.current = socket;

    joinRoom(roomId);

    for (const [event, handler] of Object.entries(handlers)) {
      socket.on(event, handler);
    }

    return () => {
      for (const [event, handler] of Object.entries(handlers)) {
        socket.off(event, handler);
      }
    };
  }, [roomId]);

  return socketRef;
}
