import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/ws',
})
export class ZentroGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Client joins a location channel
  @SubscribeMessage('join:location')
  handleJoinLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { locationId: string; role: string },
  ) {
    const channel = `location:${data.locationId}`;
    client.join(channel);
    client.join(`${channel}:${data.role}`); // e.g., location:xxx:reception
    console.log(`${client.id} joined ${channel} as ${data.role}`);
    return { status: 'joined', channel };
  }

  // Client joins a specific room channel (for tablet)
  @SubscribeMessage('join:room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const channel = `room:${data.roomId}`;
    client.join(channel);
    return { status: 'joined', channel };
  }

  // === Emit methods (called from services) ===

  emitRoomStatusChange(locationId: string, roomId: string, data: any) {
    this.server
      .to(`location:${locationId}`)
      .emit('room:status_changed', { roomId, ...data });
  }

  emitQueueUpdate(locationId: string, queue: any[]) {
    this.server
      .to(`location:${locationId}`)
      .emit('queue:updated', { queue });
  }

  emitReadyForImmersion(locationId: string, roomId: string, data: any) {
    this.server
      .to(`location:${locationId}:attendant`)
      .emit('room:ready_for_immersion', { roomId, ...data });
  }

  emitEquipmentRequest(locationId: string, roomId: string, data: any) {
    this.server
      .to(`location:${locationId}`)
      .emit('equipment:requested', { roomId, ...data });
  }

  emitToRoom(roomId: string, event: string, data: any) {
    this.server.to(`room:${roomId}`).emit(event, data);
  }

  emitBookingUpdate(locationId: string, data: any) {
    this.server
      .to(`location:${locationId}`)
      .emit('booking:updated', data);
  }
}
