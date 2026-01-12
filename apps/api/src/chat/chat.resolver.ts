import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatSession } from './entities/chat.entity';
import { CreateSessionInput } from './dto/chat.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => ChatSession)
export class ChatResolver {
    constructor(private chatService: ChatService) { }

    @Mutation(() => ChatSession)
    @UseGuards(JwtAuthGuard)
    async createChatSession(
        @Args('input') input: CreateSessionInput,
        @CurrentUser() user: User,
    ): Promise<ChatSession> {
        return this.chatService.createSession(user.id, input.agentId, input.title);
    }

    @Query(() => [ChatSession])
    @UseGuards(JwtAuthGuard)
    async myChatSessions(@CurrentUser() user: User): Promise<ChatSession[]> {
        return this.chatService.getUserSessions(user.id);
    }

    @Query(() => ChatSession)
    @UseGuards(JwtAuthGuard)
    async chatSession(@Args('id') id: string): Promise<ChatSession> {
        return this.chatService.getSession(id);
    }

    @Mutation(() => Boolean)
    @UseGuards(JwtAuthGuard)
    async deleteChatSession(
        @Args('id') id: string,
        @CurrentUser() user: User,
    ): Promise<boolean> {
        return this.chatService.deleteSession(id, user.id);
    }
}
