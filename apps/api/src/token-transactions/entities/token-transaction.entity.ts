import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Agent } from '../../agents/entities/agent.entity';
import { TransactionType } from '@prisma/client';

registerEnumType(TransactionType, {
    name: 'TransactionType',
});

@ObjectType()
export class TokenTransaction {
    @Field(() => ID)
    id: string;

    @Field()
    userId: string;

    @Field({ nullable: true })
    agentId?: string;

    @Field(() => Int)
    tokensUsed: number;

    @Field(() => Float)
    amountDeducted: number;

    @Field(() => TransactionType)
    transactionType: TransactionType;

    @Field({ nullable: true })
    txHash?: string;

    @Field()
    createdAt: Date;

    @Field(() => User, { nullable: true })
    user?: User;

    @Field(() => Agent, { nullable: true })
    agent?: Agent;
}

@ObjectType()
export class UserStats {
    @Field(() => Int)
    totalTransactions: number;

    @Field(() => Float)
    totalSpent: number;

    @Field(() => Float)
    totalEarned: number;

    @Field(() => Float)
    netBalance: number;
}

@ObjectType()
export class MarketplaceStats {
    @Field(() => Int)
    totalChats: number;

    @Field(() => Int)
    totalAgents: number;

    @Field(() => Int)
    totalCreators: number;
}
