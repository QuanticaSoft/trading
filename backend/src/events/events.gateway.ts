import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Signal } from '../signals/entities/signal.entity';

// Uses the Socket.IO adapter NestJS wires up by default — the Terminal
// dashboard must connect with socket.io-client, not the browser's native
// WebSocket API, or the handshake never completes.
@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  emitSignalCreated(signal: Signal): void {
    this.server.emit('signal.created', signal);
  }

  emitSignalUpdated(signal: Signal): void {
    this.server.emit('signal.updated', signal);
  }
}
