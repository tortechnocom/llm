import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TokenTransactionsService } from './token-transactions.service';
import { TokenTransaction, UserStats, MarketplaceStats } from './entities/token-transaction.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => TokenTransaction)
export class TokenTransactionsResolver {
    constructor(private tokenTransactionsService: TokenTransactionsService) { }

    @Query(() => [TokenTransaction])
    @UseGuards(JwtAuthGuard)
    async myTransactions(@CurrentUser() user: User): Promise<TokenTransaction[]> {
        return this.tokenTransactionsService.findByUser(user.id);
    }

    @Query(() => [TokenTransaction])
    async agentTransactions(@Args('agentId') agentId: string): Promise<TokenTransaction[]> {
        return this.tokenTransactionsService.findByAgent(agentId);
    }

    @Query(() => UserStats)
    @UseGuards(JwtAuthGuard)
    async myStats(@CurrentUser() user: User): Promise<UserStats> {
        return this.tokenTransactionsService.getUserStats(user.id);
    }

    @Query(() => MarketplaceStats)
    async marketplaceStats(): Promise<MarketplaceStats> {
        return this.tokenTransactionsService.getMarketplaceStats();
    }
}
