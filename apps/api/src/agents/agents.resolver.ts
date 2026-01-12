import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { Agent } from './entities/agent.entity';
import { CreateAgentInput, UpdateAgentInput } from './dto/agent.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Agent)
export class AgentsResolver {
    constructor(private agentsService: AgentsService) { }

    @Mutation(() => Agent)
    @UseGuards(JwtAuthGuard)
    async createAgent(
        @Args('input') input: CreateAgentInput,
        @CurrentUser() user: User,
    ): Promise<Agent> {
        return this.agentsService.create(user.id, input);
    }

    @Query(() => [Agent])
    async agents(
        @Args('isPublic', { nullable: true }) isPublic?: boolean,
    ): Promise<Agent[]> {
        return this.agentsService.findAll(isPublic);
    }

    @Query(() => Agent)
    async agent(@Args('id') id: string): Promise<Agent> {
        return this.agentsService.findOne(id);
    }

    @Query(() => [Agent])
    @UseGuards(JwtAuthGuard)
    async myAgents(@CurrentUser() user: User): Promise<Agent[]> {
        return this.agentsService.findByTrainer(user.id);
    }

    @Query(() => [Agent])
    async searchAgents(@Args('domain') domain: string): Promise<Agent[]> {
        return this.agentsService.searchByDomain(domain);
    }

    @Mutation(() => Agent)
    @UseGuards(JwtAuthGuard)
    async updateAgent(
        @Args('id') id: string,
        @Args('input') input: UpdateAgentInput,
        @CurrentUser() user: User,
    ): Promise<Agent> {
        return this.agentsService.update(id, user.id, input);
    }

    @Mutation(() => Boolean)
    @UseGuards(JwtAuthGuard)
    async deleteAgent(
        @Args('id') id: string,
        @CurrentUser() user: User,
    ): Promise<boolean> {
        return this.agentsService.delete(id, user.id);
    }
}
