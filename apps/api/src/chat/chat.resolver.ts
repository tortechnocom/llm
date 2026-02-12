import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatSession } from './entities/chat.entity';
import { CreateSessionInput } from './dto/chat.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { AgentsService } from '../agents/agents.service';

@Resolver(() => ChatSession)
export class ChatResolver {
    constructor(
        private chatService: ChatService,
        private agentsService: AgentsService,
    ) { }

    @Mutation(() => ChatSession)
    @UseGuards(OptionalJwtAuthGuard)
    async createChatSession(
        @Args('input') input: CreateSessionInput,
        @CurrentUser() user?: User,
    ): Promise<ChatSession> {
        console.log('Creating public session');
        if (!user) {
            const agent = await this.agentsService.findOne(input.agentId);
            if (!agent.isPublic) {
                throw new Error('Unauthorized: Agent is private');
            }
            return this.chatService.createSession(null, input.agentId, input.title);
        }
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
