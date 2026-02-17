import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
// import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';

@WebSocketGateway({
    cors: {
        origin: true,
        credentials: true,
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService) { }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join-session')
    async handleJoinSession(
        @MessageBody() data: { sessionId: string },
        @ConnectedSocket() client: Socket,
    ) {
        client.join(data.sessionId);
        return { event: 'joined-session', data: { sessionId: data.sessionId } };
    }

    @SubscribeMessage('send-message')
    async handleMessage(
        @MessageBody() data: { userId: string; sessionId: string; content: string },
        // @ConnectedSocket() client: Socket,
    ) {
        console.log('Gateway handleMessage received:', data);
        try {
            // Send user message immediately
            this.server.to(data.sessionId).emit('message', {
                role: 'user',
                content: data.content,
            });

            // Stream AI response
            let fullResponse = '';

            for await (const chunk of this.chatService.streamMessage(
                data.userId,
                data.sessionId,
                data.content,
            )) {
                fullResponse += chunk;
                this.server.to(data.sessionId).emit('message-chunk', {
                    role: 'assistant',
                    content: chunk,
                });
            }

            // Send complete message
            this.server.to(data.sessionId).emit('message-complete', {
                role: 'assistant',
                content: fullResponse,
            });

            return { event: 'message-sent', data: { success: true } };
        } catch (error) {
            console.error('Gateway handleMessage error:', error);
            this.server.to(data.sessionId).emit('error', {
                message: (error as any).message,
            });
            return { event: 'error', data: { message: (error as any).message } };
        }
    }

    @SubscribeMessage('leave-session')
    handleLeaveSession(
        @MessageBody() data: { sessionId: string },
        @ConnectedSocket() client: Socket,
    ) {
        client.leave(data.sessionId);
        return { event: 'left-session', data: { sessionId: data.sessionId } };
    }
}
