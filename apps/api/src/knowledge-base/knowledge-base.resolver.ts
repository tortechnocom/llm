import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { CreateKnowledgeInput, UpdateKnowledgeInput } from './dto/knowledge.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => KnowledgeBase)
export class KnowledgeBaseResolver {
    constructor(private knowledgeBaseService: KnowledgeBaseService) { }

    @Mutation(() => KnowledgeBase)
    @UseGuards(JwtAuthGuard)
    async createKnowledge(
        @Args('input') input: CreateKnowledgeInput,
        @CurrentUser() user: User,
    ): Promise<KnowledgeBase> {
        return this.knowledgeBaseService.create(user.id, input);
    }

    @Mutation(() => KnowledgeBase)
    @UseGuards(JwtAuthGuard)
    async updateKnowledge(
        @Args('input') input: UpdateKnowledgeInput,
        @CurrentUser() user: User,
    ): Promise<KnowledgeBase> {
        return this.knowledgeBaseService.update(input.id, user.id, input);
    }

    @Query(() => [KnowledgeBase])
    async knowledgeByAgent(@Args('agentId') agentId: string): Promise<KnowledgeBase[]> {
        return this.knowledgeBaseService.findByAgent(agentId);
    }

    @Mutation(() => Boolean)
    @UseGuards(JwtAuthGuard)
    async deleteKnowledge(
        @Args('id') id: string,
        @CurrentUser() user: User,
    ): Promise<boolean> {
        return this.knowledgeBaseService.delete(id, user.id);
    }

    @Query(() => [KnowledgeBase])
    async searchKnowledge(
        @Args('agentId') agentId: string,
        @Args('query') query: string,
        @Args('limit', { type: () => Int, defaultValue: 5 }) limit: number,
    ): Promise<any[]> {
        return this.knowledgeBaseService.searchSimilar(agentId, query, limit);
    }
}
